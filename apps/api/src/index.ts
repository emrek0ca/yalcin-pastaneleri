import path from 'path';
import { fileURLToPath } from 'url';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import fastifyStatic from '@fastify/static';
import dotenv from 'dotenv';
import { pool, query } from './db/index.js';
import {
  CreateOrderSchema,
  CartValidateSchema,
  CreateCustomCakeRequestSchema,
  UpdateOrderStatusSchema,
  QuoteCustomCakeSchema,
  RegisterDeviceSchema,
} from '@yalcin/shared';
import { NotificationService } from './services/notification.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const assetsDir = path.resolve(process.cwd(), 'assets');

const server = Fastify({
  logger: {
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  },
});

await server.register(cors, {
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
});

// Serve local authentic assets
await server.register(fastifyStatic, {
  root: assetsDir,
  prefix: '/assets/',
});

// 1. Health check
server.get('/api/health', async () => {
  const dbRes = await query('SELECT NOW() as now, current_database() as db');
  return {
    status: 'ok',
    service: 'Yalçın Pastaneleri Core API',
    database: dbRes.rows[0].db,
    serverTime: dbRes.rows[0].now,
    version: '1.0.0',
  };
});

// 2. Branches
server.get('/api/branches', async () => {
  const { rows } = await query(`
    SELECT
      id, name, slug, district, city, address, phone,
      json_build_object('lat', lat, 'lng', lng) as coordinates,
      opening_hours as "openingHours",
      order_hours as "orderHours",
      status, source_url as "sourceUrl",
      features,
      is_delivery_available as "isDeliveryAvailable",
      is_pickup_available as "isPickupAvailable",
      minimum_order_cents as "minimumOrderCents",
      delivery_fee_cents as "deliveryFeeCents"
    FROM branches
    ORDER BY id ASC
  `);
  return rows;
});

server.get('/api/branches/:id', async (req, reply) => {
  const { id } = req.params as { id: string };
  const { rows } = await query(`
    SELECT
      id, name, slug, district, city, address, phone,
      json_build_object('lat', lat, 'lng', lng) as coordinates,
      opening_hours as "openingHours",
      order_hours as "orderHours",
      status, source_url as "sourceUrl",
      features,
      is_delivery_available as "isDeliveryAvailable",
      is_pickup_available as "isPickupAvailable",
      minimum_order_cents as "minimumOrderCents",
      delivery_fee_cents as "deliveryFeeCents"
    FROM branches
    WHERE id = $1 OR slug = $1
  `, [id]);

  if (rows.length === 0) {
    return reply.status(404).send({ error: 'Şube bulunamadı' });
  }
  return rows[0];
});

// 3. Categories
server.get('/api/categories', async (req) => {
  const { branchId } = req.query as { branchId?: string };
  let sql = `
    SELECT
      id, name, slug, display_order as "displayOrder",
      image_url as "imageUrl", local_asset as "localAsset",
      description, branch_specific as "branchSpecific", status
    FROM categories
  `;
  const params: any[] = [];
  if (branchId === 'raufbey') {
    sql += ` WHERE (branch_specific IS NULL OR branch_specific = 'raufbey')`;
  }
  sql += ` ORDER BY display_order ASC`;

  const { rows } = await query(sql, params);
  return rows;
});

// 4. Products
server.get('/api/products', async (req) => {
  const { categoryId, branchId, search, limit = '100', offset = '0' } = req.query as {
    categoryId?: string;
    branchId?: string;
    search?: string;
    limit?: string;
    offset?: string;
  };

  let sql = `
    SELECT
      p.id, p.category_id as "categoryId", p.name, p.slug,
      p.description, p.ingredients, p.allergens,
      p.raw_image_url as "rawImageUrl", p.local_asset as "localAsset",
      COALESCE(bo.custom_price_cents, p.base_price_cents) as "basePriceCents",
      COALESCE(bo.is_available, p.is_available) as "isAvailable",
      COALESCE(bo.is_delivery_available, p.is_delivery_available) as "isDeliveryAvailable",
      p.status, p.source_url as "sourceUrl", p.unit,
      c.name as "categoryName", c.slug as "categorySlug"
    FROM products p
    JOIN categories c ON p.category_id = c.id
  `;

  const conditions: string[] = [];
  const params: any[] = [];

  if (branchId) {
    params.push(branchId);
    sql += ` JOIN branch_offerings bo ON bo.product_id = p.id AND bo.branch_id = $${params.length}`;
    conditions.push(`bo.is_available = true`);
  } else {
    sql += ` LEFT JOIN branch_offerings bo ON bo.product_id = p.id`;
  }

  if (categoryId) {
    params.push(categoryId);
    conditions.push(`(p.category_id = $${params.length} OR c.slug = $${params.length})`);
  }

  if (search && search.trim().length > 0) {
    params.push(`%${search.trim().toLowerCase()}%`);
    conditions.push(`(LOWER(p.name) LIKE $${params.length} OR LOWER(COALESCE(p.description, '')) LIKE $${params.length})`);
  }

  if (conditions.length > 0) {
    sql += ` WHERE ` + conditions.join(' AND ');
  }

  sql += ` GROUP BY p.id, c.id, bo.custom_price_cents, bo.is_available, bo.is_delivery_available`;
  sql += ` ORDER BY c.display_order ASC, p.name ASC`;
  sql += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
  params.push(parseInt(limit, 10), parseInt(offset, 10));

  const { rows } = await query(sql, params);
  return rows;
});

// 5. Single Product
server.get('/api/products/:id', async (req, reply) => {
  const { id } = req.params as { id: string };
  const { branchId } = req.query as { branchId?: string };

  const { rows } = await query(`
    SELECT
      p.id, p.category_id as "categoryId", p.name, p.slug,
      p.description, p.ingredients, p.allergens,
      p.raw_image_url as "rawImageUrl", p.local_asset as "localAsset",
      p.base_price_cents as "basePriceCents",
      p.is_available as "isAvailable",
      p.is_delivery_available as "isDeliveryAvailable",
      p.status, p.source_url as "sourceUrl", p.unit,
      c.name as "categoryName", c.slug as "categorySlug"
    FROM products p
    JOIN categories c ON p.category_id = c.id
    WHERE p.id = $1 OR p.slug = $1
  `, [id]);

  if (rows.length === 0) {
    return reply.status(404).send({ error: 'Ürün bulunamadı' });
  }

  const product = rows[0];

  // Fetch branch availability
  const offeringsRes = await query(`
    SELECT branch_id, is_available, is_delivery_available, custom_price_cents
    FROM branch_offerings
    WHERE product_id = $1
  `, [product.id]);

  return {
    ...product,
    branchOfferings: offeringsRes.rows,
  };
});

// 6. Cart Validation & Recalculation (Single source of truth in PostgreSQL)
server.post('/api/cart/validate', async (req, reply) => {
  const parseRes = CartValidateSchema.safeParse(req.body);
  if (!parseRes.success) {
    return reply.status(400).send({ error: 'Geçersiz sepet verisi', details: parseRes.error.flatten() });
  }

  const { branchId, items } = parseRes.data;

  // Verify branch exists
  const branchRes = await query('SELECT * FROM branches WHERE id = $1', [branchId]);
  if (branchRes.rows.length === 0) {
    return reply.status(400).send({ error: 'Seçilen şube bulunamadı' });
  }
  const branch = branchRes.rows[0];

  let subtotalCents = 0;
  let itemCount = 0;
  const validatedItems = [];

  for (const item of items) {
    const prodRes = await query(`
      SELECT p.*, bo.is_available, bo.custom_price_cents
      FROM products p
      LEFT JOIN branch_offerings bo ON bo.product_id = p.id AND bo.branch_id = $1
      WHERE p.id = $2
    `, [branchId, item.productId]);

    if (prodRes.rows.length === 0) {
      continue;
    }

    const prod = prodRes.rows[0];
    const isAvailable = prod.is_available !== false;
    if (!isAvailable) {
      continue; // Item not available at this branch
    }

    const currentPriceCents = prod.custom_price_cents || prod.base_price_cents;
    const itemTotalCents = currentPriceCents * item.quantity;
    subtotalCents += itemTotalCents;
    itemCount += item.quantity;

    validatedItems.push({
      productId: prod.id,
      name: prod.name,
      unitPriceCents: currentPriceCents,
      quantity: item.quantity,
      totalPriceCents: itemTotalCents,
      imageUrl: prod.local_asset || prod.raw_image_url,
      notes: item.notes,
    });
  }

  const deliveryFeeCents = branch.delivery_fee_cents || 0;
  const totalCents = subtotalCents + deliveryFeeCents;
  const minimumOrderCents = branch.minimum_order_cents || 20000;
  const isMinimumMet = subtotalCents >= minimumOrderCents;

  return {
    branchId,
    branchName: branch.name,
    items: validatedItems,
    subtotalCents,
    deliveryFeeCents,
    totalCents,
    itemCount,
    minimumOrderCents,
    isMinimumMet,
  };
});

// 7. Place Order
server.post('/api/orders', async (req, reply) => {
  const parseRes = CreateOrderSchema.safeParse(req.body);
  if (!parseRes.success) {
    return reply.status(400).send({ error: 'Sipariş bilgileri eksik veya geçersiz', details: parseRes.error.flatten() });
  }

  const data = parseRes.data;

  // Idempotency check if key is provided
  if (data.idempotencyKey) {
    const existing = await query('SELECT * FROM orders WHERE idempotency_key = $1', [data.idempotencyKey]);
    if (existing.rows.length > 0) {
      return existing.rows[0];
    }
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Verify branch
    const branchRes = await client.query('SELECT * FROM branches WHERE id = $1', [data.branchId]);
    if (branchRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return reply.status(400).send({ error: 'Şube bulunamadı' });
    }
    const branch = branchRes.rows[0];

    // Re-verify all items against database prices and branch offerings
    let subtotalCents = 0;
    const verifiedOrderItems: any[] = [];

    for (const item of data.items) {
      const prodRes = await client.query(`
        SELECT p.*, bo.is_available, bo.custom_price_cents
        FROM products p
        LEFT JOIN branch_offerings bo ON bo.product_id = p.id AND bo.branch_id = $1
        WHERE p.id = $2
      `, [data.branchId, item.productId]);

      if (prodRes.rows.length === 0) {
        await client.query('ROLLBACK');
        return reply.status(400).send({ error: `Ürün bulunamadı: ${item.name}` });
      }

      const prod = prodRes.rows[0];
      if (prod.is_available === false) {
        await client.query('ROLLBACK');
        return reply.status(400).send({ error: `"${prod.name}" seçilen şubede şu anda satışa uygun değil.` });
      }

      const unitPriceCents = prod.custom_price_cents || prod.base_price_cents;
      const itemTotalCents = unitPriceCents * item.quantity;
      subtotalCents += itemTotalCents;

      verifiedOrderItems.push({
        productId: prod.id,
        productName: prod.name,
        unitPriceCents,
        quantity: item.quantity,
        totalPriceCents: itemTotalCents,
        notes: item.notes || null,
      });
    }

    // Minimum basket check for delivery
    if (data.orderType === 'delivery' && subtotalCents < branch.minimum_order_cents) {
      await client.query('ROLLBACK');
      return reply.status(400).send({
        error: `Teslimat için minimum sepet tutarı ${(branch.minimum_order_cents / 100).toFixed(2)} ₺ olmalıdır.`,
      });
    }

    const deliveryFeeCents = data.orderType === 'delivery' ? (branch.delivery_fee_cents || 0) : 0;
    const totalCents = subtotalCents + deliveryFeeCents;

    // Generate readable order number: YLC-YYYYMMDD-XXXX
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `YLC-${dateStr}-${randomSuffix}`;

    const orderInsert = await client.query(`
      INSERT INTO orders (
        order_number, branch_id, order_type, status,
        customer_name, customer_phone, customer_email,
        delivery_address, delivery_notes,
        subtotal_cents, delivery_fee_cents, total_cents,
        payment_method, payment_status, idempotency_key
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *
    `, [
      orderNumber,
      data.branchId,
      data.orderType,
      'received',
      data.customerName,
      data.customerPhone,
      data.customerEmail || null,
      data.deliveryAddress || null,
      data.deliveryNotes || null,
      subtotalCents,
      deliveryFeeCents,
      totalCents,
      data.paymentMethod,
      data.paymentMethod === 'online_card' ? 'authorized' : 'pending',
      data.idempotencyKey || null,
    ]);

    const createdOrder = orderInsert.rows[0];

    // Insert order items
    for (const item of verifiedOrderItems) {
      await client.query(`
        INSERT INTO order_items (order_id, product_id, product_name, unit_price_cents, quantity, total_price_cents, notes)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        createdOrder.id,
        item.productId,
        item.productName,
        item.unitPriceCents,
        item.quantity,
        item.totalPriceCents,
        item.notes,
      ]);
    }

    // Insert initial status history
    await client.query(`
      INSERT INTO order_status_history (order_id, status, note)
      VALUES ($1, 'received', 'Sipariş başarıyla alındı ve şubeye iletildi.')
    `, [createdOrder.id]);

    // Record audit log
    await client.query(`
      INSERT INTO audit_logs (entity_type, entity_id, action, actor, details)
      VALUES ('order', $1, 'created', 'customer', $2)
    `, [createdOrder.id, JSON.stringify({ orderNumber, totalCents, branchId: data.branchId })]);

    await client.query('COMMIT');

    // Trigger transactional notification
    await NotificationService.sendTransactionalNotification({
      title: 'Siparişiniz Alındı! 🍰',
      body: `${orderNumber} numaralı siparişiniz Yalçın Pastaneleri ${branch.name} tarafından hazırlanmak üzere alındı.`,
      branchId: data.branchId,
      data: {
        orderId: createdOrder.id,
        orderNumber,
        status: 'received',
      },
    });

    return reply.status(201).send({
      ...createdOrder,
      items: verifiedOrderItems,
      branchName: branch.name,
    });
  } catch (err) {
    await client.query('ROLLBACK');
    server.log.error(err);
    return reply.status(500).send({ error: 'Sipariş oluşturulurken bir hata meydana geldi.' });
  } finally {
    client.release();
  }
});

// 8. Track Order by Order Number or ID
server.get('/api/orders/:orderRef', async (req, reply) => {
  const { orderRef } = req.params as { orderRef: string };

  const orderRes = await query(`
    SELECT o.*, b.name as "branchName", b.phone as "branchPhone"
    FROM orders o
    JOIN branches b ON b.id = o.branch_id
    WHERE o.order_number = $1 OR o.id::text = $1
  `, [orderRef]);

  if (orderRes.rows.length === 0) {
    return reply.status(404).send({ error: 'Sipariş bulunamadı' });
  }

  const order = orderRes.rows[0];

  const itemsRes = await query(`
    SELECT * FROM order_items WHERE order_id = $1 ORDER BY id ASC
  `, [order.id]);

  const historyRes = await query(`
    SELECT status, note, created_at as "timestamp"
    FROM order_status_history
    WHERE order_id = $1
    ORDER BY created_at ASC
  `, [order.id]);

  return {
    ...order,
    items: itemsRes.rows,
    statusHistory: historyRes.rows,
  };
});

// 9. Admin List Orders
server.get('/api/orders', async (req) => {
  const { branchId, status, limit = '50', offset = '0' } = req.query as {
    branchId?: string;
    status?: string;
    limit?: string;
    offset?: string;
  };

  let sql = `
    SELECT o.*, b.name as "branchName"
    FROM orders o
    JOIN branches b ON b.id = o.branch_id
  `;
  const conditions: string[] = [];
  const params: any[] = [];

  if (branchId) {
    params.push(branchId);
    conditions.push(`o.branch_id = $${params.length}`);
  }

  if (status) {
    params.push(status);
    conditions.push(`o.status = $${params.length}`);
  }

  if (conditions.length > 0) {
    sql += ' WHERE ' + conditions.join(' AND ');
  }

  sql += ' ORDER BY o.created_at DESC';
  sql += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
  params.push(parseInt(limit, 10), parseInt(offset, 10));

  const { rows } = await query(sql, params);
  return rows;
});

// 10. Update Order Status (Deterministic State Machine per AGENTS.md rule 6)
server.patch('/api/orders/:id/status', async (req, reply) => {
  const { id } = req.params as { id: string };
  const parseRes = UpdateOrderStatusSchema.safeParse(req.body);

  if (!parseRes.success) {
    return reply.status(400).send({ error: 'Geçersiz durum güncellemesi', details: parseRes.error.flatten() });
  }

  const { status, note } = parseRes.data;

  const validTransitions: Record<string, string[]> = {
    received: ['confirmed', 'cancelled'],
    confirmed: ['preparing', 'cancelled'],
    preparing: ['out_for_delivery', 'ready_for_pickup', 'cancelled'],
    out_for_delivery: ['completed', 'cancelled'],
    ready_for_pickup: ['completed', 'cancelled'],
    completed: [],
    cancelled: [],
  };

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const curRes = await client.query('SELECT * FROM orders WHERE id = $1', [id]);
    if (curRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return reply.status(404).send({ error: 'Sipariş bulunamadı' });
    }

    const currentOrder = curRes.rows[0];
    const allowed = validTransitions[currentOrder.status] || [];

    if (!allowed.includes(status)) {
      await client.query('ROLLBACK');
      return reply.status(400).send({
        error: `Geçersiz durum geçişi: "${currentOrder.status}" -> "${status}". İzin verilen durumlar: ${allowed.join(', ')}`,
      });
    }

    const updatedRes = await client.query(`
      UPDATE orders
      SET status = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `, [status, id]);

    await client.query(`
      INSERT INTO order_status_history (order_id, status, note)
      VALUES ($1, $2, $3)
    `, [id, status, note || `Sipariş durumu "${status}" olarak güncellendi.`]);

    await client.query(`
      INSERT INTO audit_logs (entity_type, entity_id, action, actor, details)
      VALUES ('order', $1, 'status_change', 'admin', $2)
    `, [id, JSON.stringify({ from: currentOrder.status, to: status, note })]);

    await client.query('COMMIT');

    const statusTexts: Record<string, string> = {
      confirmed: 'Siparişiniz onaylandı.',
      preparing: 'Siparişiniz usta eller tarafından taze olarak hazırlanıyor.',
      out_for_delivery: 'Siparişiniz kurye ile yola çıktı!',
      ready_for_pickup: 'Siparişiniz şubede teslimata hazır!',
      completed: 'Siparişiniz teslim edildi. Afiyet olsun!',
      cancelled: 'Siparişiniz iptal edildi.',
    };

    // Push notification trigger
    await NotificationService.sendTransactionalNotification({
      title: `Sipariş Durumu: ${currentOrder.order_number}`,
      body: statusTexts[status] || `Durum: ${status}`,
      branchId: currentOrder.branch_id,
      data: {
        orderId: currentOrder.id,
        orderNumber: currentOrder.order_number,
        status,
      },
    });

    return updatedRes.rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    server.log.error(err);
    return reply.status(500).send({ error: 'Durum güncellenemedi' });
  } finally {
    client.release();
  }
});

// 11. Custom Cake Requests
server.post('/api/custom-cakes', async (req, reply) => {
  const parseRes = CreateCustomCakeRequestSchema.safeParse(req.body);
  if (!parseRes.success) {
    return reply.status(400).send({ error: 'Özel pasta talebi bilgileri eksik veya geçersiz', details: parseRes.error.flatten() });
  }

  const d = parseRes.data;
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const requestNumber = `PST-${dateStr}-${randomSuffix}`;

  const { rows } = await query(`
    INSERT INTO custom_cake_requests (
      request_number, branch_id, customer_name, customer_phone, customer_email,
      delivery_date, serving_size, flavor_preference, cake_message, notes,
      reference_image_urls, status
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'submitted')
    RETURNING *
  `, [
    requestNumber,
    d.branchId,
    d.customerName,
    d.customerPhone,
    d.customerEmail || null,
    d.deliveryDate,
    d.servingSize,
    d.flavorPreference,
    d.cakeMessage || null,
    d.notes || null,
    JSON.stringify(d.referenceImageUrls || []),
  ]);

  return reply.status(201).send(rows[0]);
});

server.get('/api/custom-cakes', async (req) => {
  const { branchId, status } = req.query as { branchId?: string; status?: string };
  let sql = 'SELECT * FROM custom_cake_requests';
  const conditions: string[] = [];
  const params: any[] = [];

  if (branchId) {
    params.push(branchId);
    conditions.push(`branch_id = $${params.length}`);
  }
  if (status) {
    params.push(status);
    conditions.push(`status = $${params.length}`);
  }
  if (conditions.length > 0) {
    sql += ' WHERE ' + conditions.join(' AND ');
  }
  sql += ' ORDER BY created_at DESC';

  const { rows } = await query(sql, params);
  return rows;
});

server.get('/api/custom-cakes/:id', async (req, reply) => {
  const { id } = req.params as { id: string };
  const { rows } = await query(`
    SELECT * FROM custom_cake_requests WHERE id::text = $1 OR request_number = $1
  `, [id]);
  if (rows.length === 0) {
    return reply.status(404).send({ error: 'Özel pasta talebi bulunamadı' });
  }
  return rows[0];
});

// Admin submits quote
server.post('/api/custom-cakes/:id/quote', async (req, reply) => {
  const { id } = req.params as { id: string };
  const parseRes = QuoteCustomCakeSchema.safeParse(req.body);
  if (!parseRes.success) {
    return reply.status(400).send({ error: 'Teklif bilgisi geçersiz', details: parseRes.error.flatten() });
  }

  const { quoteCents, quoteNotes } = parseRes.data;

  const { rows } = await query(`
    UPDATE custom_cake_requests
    SET status = 'quoted', quote_cents = $1, quote_notes = $2, quoted_at = NOW(), updated_at = NOW()
    WHERE id::text = $3 OR request_number = $3
    RETURNING *
  `, [quoteCents, quoteNotes, id]);

  if (rows.length === 0) {
    return reply.status(404).send({ error: 'Talebi bulunamadı' });
  }

  return rows[0];
});

// Customer accepts quote
server.post('/api/custom-cakes/:id/accept', async (req, reply) => {
  const { id } = req.params as { id: string };
  const { rows } = await query(`
    UPDATE custom_cake_requests
    SET status = 'accepted', accepted_at = NOW(), updated_at = NOW()
    WHERE (id::text = $1 OR request_number = $1) AND status = 'quoted'
    RETURNING *
  `, [id]);

  if (rows.length === 0) {
    return reply.status(400).send({ error: 'Teklif henüz sunulmamış veya talep bulunamadı' });
  }

  return rows[0];
});

// 12. Register FCM device
server.post('/api/devices/register', async (req, reply) => {
  const parseRes = RegisterDeviceSchema.safeParse(req.body);
  if (!parseRes.success) {
    return reply.status(400).send({ error: 'Geçersiz cihaz verisi', details: parseRes.error.flatten() });
  }

  const { token, platform, customerId } = parseRes.data;

  await query(`
    INSERT INTO devices (token, platform, customer_id, is_active, updated_at)
    VALUES ($1, $2, $3, true, NOW())
    ON CONFLICT (token) DO UPDATE SET
      customer_id = EXCLUDED.customer_id,
      platform = EXCLUDED.platform,
      is_active = true,
      updated_at = NOW()
  `, [token, platform, customerId || null]);

  return { status: 'registered' };
});

// 13. Admin Dashboard Summary Stats
server.get('/api/stats', async () => {
  const ordersCountRes = await query('SELECT COUNT(*) as count FROM orders');
  const revenueRes = await query("SELECT COALESCE(SUM(total_cents), 0) as revenue FROM orders WHERE status != 'cancelled'");
  const pendingOrdersRes = await query("SELECT COUNT(*) as count FROM orders WHERE status IN ('received', 'confirmed', 'preparing')");
  const pendingCakesRes = await query("SELECT COUNT(*) as count FROM custom_cake_requests WHERE status IN ('submitted', 'reviewing')");
  const branchesCountRes = await query('SELECT COUNT(*) as count FROM branches');

  return {
    totalOrders: parseInt(ordersCountRes.rows[0].count, 10),
    totalRevenueCents: parseInt(revenueRes.rows[0].revenue, 10),
    pendingOrders: parseInt(pendingOrdersRes.rows[0].count, 10),
    pendingCakeRequests: parseInt(pendingCakesRes.rows[0].count, 10),
    activeBranches: parseInt(branchesCountRes.rows[0].count, 10),
  };
});

const PORT = parseInt(process.env.PORT || '4000', 10);
const HOST = process.env.HOST || '0.0.0.0';

try {
  await server.listen({ port: PORT, host: HOST });
  console.log(`🍰 Yalçın Pastaneleri API Server is running on http://${HOST}:${PORT}`);
} catch (err) {
  server.log.error(err);
  process.exit(1);
}
