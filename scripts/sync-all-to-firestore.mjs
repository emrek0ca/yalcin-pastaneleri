import fs from 'fs';
import os from 'os';
import path from 'path';

const projectRoot = process.cwd();
const confPath = path.join(os.homedir(), '.config', 'configstore', 'firebase-tools.json');

if (!fs.existsSync(confPath)) {
  console.error('Firebase CLI configstore not found at:', confPath);
  process.exit(1);
}

const conf = JSON.parse(fs.readFileSync(confPath, 'utf8'));
const accessToken = conf.tokens?.access_token;
if (!accessToken) {
  console.error('No access token in firebase-tools.json');
  process.exit(1);
}

const catalogPath = path.join(projectRoot, 'assets', 'catalog.json');
const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));

const projectId = 'yalcin-pastaneleri';
const baseUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`;
const commitUrl = `${baseUrl}:commit`;

function toFirestoreValue(val) {
  if (val === null || val === undefined) return { nullValue: null };
  if (typeof val === 'string') return { stringValue: val };
  if (typeof val === 'number') {
    if (Number.isInteger(val)) return { integerValue: val.toString() };
    return { doubleValue: val };
  }
  if (typeof val === 'boolean') return { booleanValue: val };
  if (Array.isArray(val)) {
    return { arrayValue: { values: val.map(toFirestoreValue) } };
  }
  if (typeof val === 'object') {
    const fields = {};
    for (const [k, v] of Object.entries(val)) {
      fields[k] = toFirestoreValue(v);
    }
    return { mapValue: { fields } };
  }
  return { stringValue: String(val) };
}

function createDocWrite(collection, docId, data) {
  const fields = {};
  for (const [k, v] of Object.entries(data)) {
    fields[k] = toFirestoreValue(v);
  }
  return {
    update: {
      name: `projects/${projectId}/databases/(default)/documents/${collection}/${docId}`,
      fields,
    },
  };
}

async function commitWrites(writes) {
  const res = await fetch(commitUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ writes }),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Firestore commit failed: ${res.status} ${errText}`);
  }
  return await res.json();
}

async function run() {
  console.log('🚀 Starting Cloud Firestore synchronization for Yalçın Pastaneleri...');

  // 1. Branches
  const branches = [
    {
      id: 'raufbey',
      name: 'Raufbey Şubesi',
      slug: 'raufbey',
      district: 'Merkez',
      city: 'Osmaniye',
      address: 'Raufbey, Atatürk Cd. No:308, Osmaniye Merkez',
      phone: '05446486040',
      coordinates: { lat: 37.0712, lng: 36.2415 },
      openingHours: '06:30 - 00:00',
      orderHours: '08:00 - 23:00',
      status: 'verified',
      sourceUrl: 'https://www.instagram.com/yalcinpastaneleri/',
      features: ['Pastane', 'Unlu Mamuller', 'Tatlı', 'Kahve', 'Dondurma', 'Paket Servis'],
      isDeliveryAvailable: true,
      isPickupAvailable: true,
      minimumOrderCents: 20000,
      deliveryFeeCents: 0,
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'adnan-menderes',
      name: 'Adnan Menderes Şubesi',
      slug: 'adnan-menderes',
      district: 'Merkez',
      city: 'Osmaniye',
      address: 'Adnan Menderes Mah. 19524. Sk. No:8, Osmaniye Merkez',
      phone: '05013690080',
      coordinates: { lat: 37.0624, lng: 36.2589 },
      openingHours: '07:00 - 01:00',
      orderHours: '08:00 - 00:00',
      status: 'verified',
      sourceUrl: 'https://www.instagram.com/yalcinpastaneleri/',
      features: ['Pastane & Kafe', 'Restoran Menüsü', 'Pizza & Burger', 'Kahvaltı', 'Nargile & Bahçe', 'Paket Servis'],
      isDeliveryAvailable: true,
      isPickupAvailable: true,
      minimumOrderCents: 20000,
      deliveryFeeCents: 0,
      updatedAt: new Date().toISOString(),
    },
  ];

  const branchWrites = branches.map((b) => createDocWrite('branches', b.id, b));
  await commitWrites(branchWrites);
  console.log(`✅ Synced ${branches.length} branches to Firestore`);

  // 2. Categories
  const categoryWrites = [];
  const productWrites = [];

  catalog.categories.forEach((cat, catIdx) => {
    const isAdnanSpecific = cat.name.toUpperCase().includes('ADNAN MENDERES');
    const cleanName = cat.name.replace(/\s*\(\s*ADNAN MENDERES[^\)]*\)/i, '').trim();
    const catId = `cat-${catIdx + 1}-${cat.slug || catIdx}`;

    categoryWrites.push(
      createDocWrite('categories', catId, {
        id: catId,
        name: cleanName,
        slug: cat.slug || `kategori-${catIdx + 1}`,
        displayOrder: catIdx + 1,
        imageUrl: cat.raw_image_url || null,
        localAsset: cat.local_asset || null,
        branchSpecific: isAdnanSpecific ? 'adnan-menderes' : null,
        status: 'verified',
        updatedAt: new Date().toISOString(),
      })
    );

    cat.items.forEach((item, itemIdx) => {
      const prodId = `prod-${catIdx + 1}-${itemIdx + 1}`;
      productWrites.push(
        createDocWrite('products', prodId, {
          id: prodId,
          categoryId: catId,
          name: item.title,
          slug: item.title.toLowerCase().replace(/[^a-z0-9ğüşıöç]+/g, '-'),
          description: item.description || null,
          rawImageUrl: item.raw_image_url || null,
          localAsset: item.local_asset || null,
          basePriceCents: item.price_cents,
          isAvailable: true,
          isDeliveryAvailable: true,
          status: 'verified',
          sourceUrl: 'https://qrmenu.yalcinpastaneleri.com/',
          unit: 'adet',
          isAdnanOnly: isAdnanSpecific,
          updatedAt: new Date().toISOString(),
        })
      );
    });
  });

  // Commit categories
  await commitWrites(categoryWrites);
  console.log(`✅ Synced ${categoryWrites.length} categories to Firestore`);

  // Commit products in chunks of 100
  const chunkSize = 100;
  for (let i = 0; i < productWrites.length; i += chunkSize) {
    const chunk = productWrites.slice(i, i + chunkSize);
    await commitWrites(chunk);
    console.log(`✅ Synced products ${i + 1} - ${i + chunk.length} to Firestore`);
  }

  console.log(`🎉 Total ${productWrites.length} products successfully stored in Cloud Firestore!`);
}

run().catch((err) => {
  console.error('Error during Firestore sync:', err);
  process.exit(1);
});
