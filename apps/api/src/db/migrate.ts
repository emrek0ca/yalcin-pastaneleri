import { pool } from './index.js';

export async function migrate() {
  console.log('Running database migrations for Yalçın Pastaneleri...');

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Branches table
    await client.query(`
      CREATE TABLE IF NOT EXISTS branches (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(128) NOT NULL UNIQUE,
        district VARCHAR(128) NOT NULL,
        city VARCHAR(64) NOT NULL DEFAULT 'Osmaniye',
        address TEXT NOT NULL,
        phone VARCHAR(32) NOT NULL,
        lat NUMERIC(9, 6) NOT NULL,
        lng NUMERIC(9, 6) NOT NULL,
        opening_hours VARCHAR(64) NOT NULL,
        order_hours VARCHAR(64) NOT NULL,
        status VARCHAR(32) NOT NULL DEFAULT 'verified',
        source_url TEXT NOT NULL,
        features JSONB NOT NULL DEFAULT '[]'::jsonb,
        is_delivery_available BOOLEAN NOT NULL DEFAULT true,
        is_pickup_available BOOLEAN NOT NULL DEFAULT true,
        minimum_order_cents INTEGER NOT NULL DEFAULT 20000,
        delivery_fee_cents INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // 2. Categories table
    await client.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(128) NOT NULL UNIQUE,
        display_order INTEGER NOT NULL DEFAULT 0,
        image_url TEXT,
        local_asset TEXT,
        description TEXT,
        branch_specific VARCHAR(64),
        status VARCHAR(32) NOT NULL DEFAULT 'verified',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // 3. Products table
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(64) PRIMARY KEY,
        category_id VARCHAR(64) NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL,
        description TEXT,
        ingredients TEXT,
        allergens JSONB DEFAULT '[]'::jsonb,
        raw_image_url TEXT,
        local_asset TEXT,
        base_price_cents INTEGER NOT NULL,
        is_available BOOLEAN NOT NULL DEFAULT true,
        is_delivery_available BOOLEAN NOT NULL DEFAULT true,
        status VARCHAR(32) NOT NULL DEFAULT 'verified',
        source_url TEXT NOT NULL,
        unit VARCHAR(32) NOT NULL DEFAULT 'adet',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // 4. Branch offerings table (Availability and branch specific pricing)
    await client.query(`
      CREATE TABLE IF NOT EXISTS branch_offerings (
        id SERIAL PRIMARY KEY,
        branch_id VARCHAR(64) NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
        product_id VARCHAR(64) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        is_available BOOLEAN NOT NULL DEFAULT true,
        is_delivery_available BOOLEAN NOT NULL DEFAULT true,
        custom_price_cents INTEGER,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE(branch_id, product_id)
      );
    `);

    // 5. Orders table
    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_number VARCHAR(32) NOT NULL UNIQUE,
        branch_id VARCHAR(64) NOT NULL REFERENCES branches(id),
        order_type VARCHAR(32) NOT NULL,
        status VARCHAR(32) NOT NULL DEFAULT 'received',
        customer_name VARCHAR(128) NOT NULL,
        customer_phone VARCHAR(32) NOT NULL,
        customer_email VARCHAR(128),
        delivery_address TEXT,
        delivery_notes TEXT,
        subtotal_cents INTEGER NOT NULL,
        delivery_fee_cents INTEGER NOT NULL DEFAULT 0,
        total_cents INTEGER NOT NULL,
        payment_method VARCHAR(32) NOT NULL DEFAULT 'cash_on_delivery',
        payment_status VARCHAR(32) NOT NULL DEFAULT 'pending',
        idempotency_key VARCHAR(64) UNIQUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // 6. Order items table
    await client.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        product_id VARCHAR(64) NOT NULL,
        product_name VARCHAR(255) NOT NULL,
        unit_price_cents INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        total_price_cents INTEGER NOT NULL,
        notes TEXT
      );
    `);

    // 7. Order status history table
    await client.query(`
      CREATE TABLE IF NOT EXISTS order_status_history (
        id SERIAL PRIMARY KEY,
        order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        status VARCHAR(32) NOT NULL,
        note TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // 8. Custom cake requests table
    await client.query(`
      CREATE TABLE IF NOT EXISTS custom_cake_requests (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        request_number VARCHAR(32) NOT NULL UNIQUE,
        branch_id VARCHAR(64) NOT NULL REFERENCES branches(id),
        customer_name VARCHAR(128) NOT NULL,
        customer_phone VARCHAR(32) NOT NULL,
        customer_email VARCHAR(128),
        delivery_date DATE NOT NULL,
        serving_size VARCHAR(64) NOT NULL,
        flavor_preference VARCHAR(128) NOT NULL,
        cake_message TEXT,
        notes TEXT,
        reference_image_urls JSONB DEFAULT '[]'::jsonb,
        status VARCHAR(32) NOT NULL DEFAULT 'submitted',
        quote_cents INTEGER,
        quote_notes TEXT,
        quoted_at TIMESTAMPTZ,
        accepted_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // 9. Devices table (FCM push notifications)
    await client.query(`
      CREATE TABLE IF NOT EXISTS devices (
        id SERIAL PRIMARY KEY,
        token TEXT NOT NULL UNIQUE,
        platform VARCHAR(32) NOT NULL,
        customer_id VARCHAR(64),
        branch_id VARCHAR(64),
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // 10. Audit logs table
    await client.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id SERIAL PRIMARY KEY,
        entity_type VARCHAR(64) NOT NULL,
        entity_id VARCHAR(64) NOT NULL,
        action VARCHAR(64) NOT NULL,
        actor VARCHAR(128) NOT NULL DEFAULT 'system',
        details JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // Indexes for fast lookups
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
      CREATE INDEX IF NOT EXISTS idx_branch_offerings_branch ON branch_offerings(branch_id);
      CREATE INDEX IF NOT EXISTS idx_orders_branch ON orders(branch_id);
      CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number);
      CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
      CREATE INDEX IF NOT EXISTS idx_custom_cake_number ON custom_cake_requests(request_number);
    `);

    await client.query('COMMIT');
    console.log('Database migrations completed successfully!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', error);
    throw error;
  } finally {
    client.release();
  }
}

if (import.meta.url.endsWith(process.argv[1]) || process.argv[1]?.includes('migrate.ts')) {
  migrate().then(() => process.exit(0)).catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
