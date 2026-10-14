import test from 'node:test';
import assert from 'node:assert/strict';
import { pool, query } from '../src/db/index.js';

test('Database connection and migration verification', async () => {
  const branchRes = await query('SELECT COUNT(*) as count FROM branches');
  assert.equal(parseInt(branchRes.rows[0].count, 10), 2, 'Should have 2 verified branches');

  const catRes = await query('SELECT COUNT(*) as count FROM categories');
  assert.equal(parseInt(catRes.rows[0].count, 10), 19, 'Should have 19 verified categories');

  const prodRes = await query('SELECT COUNT(*) as count FROM products');
  assert.ok(parseInt(prodRes.rows[0].count, 10) >= 170, 'Should have at least 170 verified products');
});

test('Price calculation and currency safety (kuruş / integer cents)', async () => {
  const { rows } = await query('SELECT name, base_price_cents FROM products WHERE name ILIKE $1', ['%2 Kişilik Serpme Kahvaltı%']);
  assert.ok(rows.length > 0, 'Serpme kahvaltı should exist');
  assert.equal(rows[0].base_price_cents, 120000, '1200 TL must equal 120,000 kuruş');
});

test('Branch filtering integrity (Adnan Menderes exclusive vs Shared)', async () => {
  // Check pizza availability at raufbey vs adnan-menderes
  const pizzaProd = await query("SELECT id FROM products WHERE name ILIKE '%Pizza%' LIMIT 1");
  assert.ok(pizzaProd.rows.length > 0);
  const prodId = pizzaProd.rows[0].id;

  const raufbeyOffering = await query('SELECT * FROM branch_offerings WHERE branch_id = $1 AND product_id = $2', ['raufbey', prodId]);
  const adnanOffering = await query('SELECT * FROM branch_offerings WHERE branch_id = $1 AND product_id = $2', ['adnan-menderes', prodId]);

  assert.equal(raufbeyOffering.rows.length, 0, 'Hot restaurant food like Pizza should not be in Raufbey');
  assert.equal(adnanOffering.rows.length, 1, 'Pizza must be available in Adnan Menderes');
});

test('Order lifecycle and state machine integrity', async () => {
  const prodRes = await query('SELECT id, name, base_price_cents FROM products WHERE category_id = $1 LIMIT 1', ['cat-11-serbetli-tatlilar']);
  assert.ok(prodRes.rows.length > 0);
  const prod = prodRes.rows[0];

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const orderNumber = `TEST-${Date.now()}`;
    const insertRes = await client.query(`
      INSERT INTO orders (
        order_number, branch_id, order_type, status,
        customer_name, customer_phone, delivery_address,
        subtotal_cents, delivery_fee_cents, total_cents,
        payment_method, payment_status
      ) VALUES ($1, 'raufbey', 'delivery', 'received', 'Test Müşteri', '05440000000', 'Test Mah. No:1', $2, 0, $2, 'cash_on_delivery', 'pending')
      RETURNING *
    `, [orderNumber, prod.base_price_cents]);

    const order = insertRes.rows[0];
    assert.equal(order.status, 'received');

    // Update to confirmed
    const confirmedRes = await client.query("UPDATE orders SET status = 'confirmed' WHERE id = $1 RETURNING status", [order.id]);
    assert.equal(confirmedRes.rows[0].status, 'confirmed');

    // Update to preparing
    const prepRes = await client.query("UPDATE orders SET status = 'preparing' WHERE id = $1 RETURNING status", [order.id]);
    assert.equal(prepRes.rows[0].status, 'preparing');

    // Update to out_for_delivery
    const delivRes = await client.query("UPDATE orders SET status = 'out_for_delivery' WHERE id = $1 RETURNING status", [order.id]);
    assert.equal(delivRes.rows[0].status, 'out_for_delivery');

    // Complete
    const completeRes = await client.query("UPDATE orders SET status = 'completed' WHERE id = $1 RETURNING status", [order.id]);
    assert.equal(completeRes.rows[0].status, 'completed');

    await client.query('ROLLBACK'); // clean up test order
  } finally {
    client.release();
  }
});

test('Custom cake request and quoting cycle', async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const reqNumber = `CAKE-TEST-${Date.now()}`;
    const insert = await client.query(`
      INSERT INTO custom_cake_requests (
        request_number, branch_id, customer_name, customer_phone,
        delivery_date, serving_size, flavor_preference, notes, status
      ) VALUES ($1, 'raufbey', 'Emre Test', '05441112233', '2026-10-20', '15-20 Kişilik', 'Çikolatalı & Fıstıklı', 'Şeker hamuru yerine çikolata kaplama olsun', 'submitted')
      RETURNING *
    `, [reqNumber]);

    const cake = insert.rows[0];
    assert.equal(cake.status, 'submitted');

    // Admin quotes 850 TL
    const quoteRes = await client.query(`
      UPDATE custom_cake_requests
      SET status = 'quoted', quote_cents = 85000, quote_notes = 'Özel Belçika çikolatası ile hazırlanacaktır.', quoted_at = NOW()
      WHERE id = $1
      RETURNING *
    `, [cake.id]);

    assert.equal(quoteRes.rows[0].status, 'quoted');
    assert.equal(quoteRes.rows[0].quote_cents, 85000);

    // Customer accepts
    const acceptRes = await client.query(`
      UPDATE custom_cake_requests
      SET status = 'accepted', accepted_at = NOW()
      WHERE id = $1
      RETURNING *
    `, [cake.id]);
    assert.equal(acceptRes.rows[0].status, 'accepted');

    await client.query('ROLLBACK');
  } finally {
    client.release();
  }
});

test.after(async () => {
  await pool.end();
});

