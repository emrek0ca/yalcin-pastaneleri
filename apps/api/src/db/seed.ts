import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from './index.js';
import { VERIFIED_BRANCHES } from '@yalcin/shared';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function slugify(text: string): string {
  const trMap: Record<string, string> = {
    'ç': 'c', 'Ç': 'c', 'ğ': 'g', 'Ğ': 'g', 'ı': 'i', 'İ': 'i',
    'ö': 'o', 'Ö': 'o', 'ş': 's', 'Ş': 's', 'ü': 'u', 'Ü': 'u',
  };
  return text
    .split('')
    .map((char) => trMap[char] || char)
    .join('')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function seed() {
  console.log('Seeding database with verified Yalçın Pastaneleri catalog...');

  const catalogPath = path.resolve(process.cwd(), 'assets/catalog.json');
  if (!fs.existsSync(catalogPath)) {
    throw new Error(`Catalog file not found at ${catalogPath}`);
  }

  const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf-8'));
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Seed Branches
    for (const b of VERIFIED_BRANCHES) {
      await client.query(`
        INSERT INTO branches (
          id, name, slug, district, city, address, phone,
          lat, lng, opening_hours, order_hours, status, source_url,
          features, is_delivery_available, is_pickup_available,
          minimum_order_cents, delivery_fee_cents
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18
        ) ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          phone = EXCLUDED.phone,
          address = EXCLUDED.address,
          opening_hours = EXCLUDED.opening_hours,
          order_hours = EXCLUDED.order_hours,
          status = EXCLUDED.status,
          updated_at = NOW();
      `, [
        b.id, b.name, b.slug, b.district, b.city, b.address, b.phone,
        b.coordinates.lat, b.coordinates.lng, b.openingHours, b.orderHours,
        b.status, b.sourceUrl, JSON.stringify(b.features),
        b.isDeliveryAvailable, b.isPickupAvailable, b.minimumOrderCents, b.deliveryFeeCents,
      ]);
    }
    console.log(`Seeded ${VERIFIED_BRANCHES.length} verified branches.`);

    // 2. Seed Categories & Products
    let prodCount = 0;
    let offeringCount = 0;

    for (let i = 0; i < catalog.categories.length; i++) {
      const cat = catalog.categories[i];
      const rawName = cat.name.trim();
      const isAdnanMenderesSpecific = rawName.toUpperCase().includes('ADNAN MENDERES');
      const cleanName = rawName.replace(/\s*\(\s*ADNAN MENDERES[^\)]*\)/i, '').trim();
      const catSlug = slugify(cleanName) || `kategori-${i + 1}`;
      const catId = `cat-${i + 1}-${catSlug}`;
      const branchSpecific = isAdnanMenderesSpecific ? 'adnan-menderes' : null;

      const localCatAsset = cat.local_asset ? `/${cat.local_asset}` : null;

      await client.query(`
        INSERT INTO categories (
          id, name, slug, display_order, image_url, local_asset, branch_specific, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          display_order = EXCLUDED.display_order,
          local_asset = EXCLUDED.local_asset,
          branch_specific = EXCLUDED.branch_specific;
      `, [
        catId,
        cleanName,
        catSlug,
        i + 1,
        cat.image_url || null,
        localCatAsset,
        branchSpecific,
        'verified',
      ]);

      for (let j = 0; j < cat.items.length; j++) {
        const item = cat.items[j];
        const prodName = item.title.trim();
        const prodSlug = `${slugify(prodName)}-${j + 1}`;
        const prodId = `prod-${catId}-${j + 1}`;
        const localAsset = item.local_asset ? `/${item.local_asset}` : null;

        await client.query(`
          INSERT INTO products (
            id, category_id, name, slug, description, raw_image_url,
            local_asset, base_price_cents, is_available, is_delivery_available,
            status, source_url, unit
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
          ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            base_price_cents = EXCLUDED.base_price_cents,
            local_asset = EXCLUDED.local_asset,
            updated_at = NOW();
        `, [
          prodId,
          catId,
          prodName,
          prodSlug,
          item.description || null,
          item.raw_image_url || null,
          localAsset,
          item.price_cents,
          true,
          true,
          'verified',
          item.source_url,
          'adet',
        ]);
        prodCount++;

        // Offerings mapping
        if (isAdnanMenderesSpecific) {
          // Available only in Adnan Menderes
          await client.query(`
            INSERT INTO branch_offerings (branch_id, product_id, is_available, is_delivery_available)
            VALUES ('adnan-menderes', $1, true, true)
            ON CONFLICT (branch_id, product_id) DO UPDATE SET is_available = true;
          `, [prodId]);
          offeringCount++;
        } else {
          // Available in both branches
          for (const branch of VERIFIED_BRANCHES) {
            await client.query(`
              INSERT INTO branch_offerings (branch_id, product_id, is_available, is_delivery_available)
              VALUES ($1, $2, true, true)
              ON CONFLICT (branch_id, product_id) DO UPDATE SET is_available = true;
            `, [branch.id, prodId]);
            offeringCount++;
          }
        }
      }
    }

    await client.query('COMMIT');
    console.log(`Seeding finished: ${catalog.categories.length} categories, ${prodCount} products, ${offeringCount} branch offerings.`);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Seeding failed:', error);
    throw error;
  } finally {
    client.release();
  }
}

if (import.meta.url.endsWith(process.argv[1]) || process.argv[1]?.includes('seed.ts')) {
  seed().then(() => process.exit(0)).catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
