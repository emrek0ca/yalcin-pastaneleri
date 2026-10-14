import { initializeApp, getApps, getApp, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getMessaging } from 'firebase-admin/messaging';
import { getFirestore } from 'firebase-admin/firestore';
import { pool } from '../db/index.js';

export function getFirebaseAdmin(): App {
  if (getApps().length === 0) {
    return initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID || 'yalcin-pastaneleri',
      storageBucket: 'yalcin-pastaneleri.firebasestorage.app',
    });
  }
  return getApp();
}

/**
 * Verifies a Firebase Auth ID token from HTTP Authorization headers
 */
export async function verifyAuthToken(idToken: string) {
  try {
    const app = getFirebaseAdmin();
    const auth = getAuth(app);
    const decodedToken = await auth.verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    console.warn('[FirebaseAdmin] Failed to verify ID token:', error);
    return null;
  }
}

/**
 * Sends a transactional push notification via Firebase Cloud Messaging (FCM)
 */
export async function sendFcmPushNotification(params: {
  token: string;
  title: string;
  body: string;
  data?: Record<string, string>;
}) {
  try {
    const app = getFirebaseAdmin();
    const messaging = getMessaging(app);
    const response = await messaging.send({
      token: params.token,
      notification: {
        title: params.title,
        body: params.body,
      },
      data: params.data || {},
    });
    console.log('[FirebaseAdmin] FCM notification dispatched successfully:', response);
    return true;
  } catch (error) {
    console.warn('[FirebaseAdmin] FCM notification send failed:', error);
    return false;
  }
}

/**
 * Synchronizes verified catalog, branches, and orders from PostgreSQL to Cloud Firestore
 */
export async function syncPostgresToFirestore() {
  console.log('[FirebaseAdmin] Starting PostgreSQL -> Cloud Firestore sync...');
  const app = getFirebaseAdmin();
  const firestore = getFirestore(app);

  // 1. Sync Branches
  const { rows: branches } = await pool.query('SELECT * FROM branches');
  const branchBatch = firestore.batch();
  for (const b of branches) {
    const ref = firestore.collection('branches').doc(b.id);
    branchBatch.set(ref, {
      id: b.id,
      name: b.name,
      slug: b.slug,
      district: b.district,
      city: b.city,
      address: b.address,
      phone: b.phone,
      coordinates: { lat: parseFloat(b.lat), lng: parseFloat(b.lng) },
      openingHours: b.opening_hours,
      orderHours: b.order_hours,
      status: b.status,
      sourceUrl: b.source_url,
      features: b.features,
      isDeliveryAvailable: b.is_delivery_available,
      isPickupAvailable: b.is_pickup_available,
      minimumOrderCents: b.minimum_order_cents,
      deliveryFeeCents: b.delivery_fee_cents,
      updatedAt: new Date(),
    }, { merge: true });
  }
  await branchBatch.commit();
  console.log(`[FirebaseAdmin] Synced ${branches.length} branches to Firestore.`);

  // 2. Sync Categories
  const { rows: categories } = await pool.query('SELECT * FROM categories');
  const catBatch = firestore.batch();
  for (const c of categories) {
    const ref = firestore.collection('categories').doc(c.id);
    catBatch.set(ref, {
      id: c.id,
      name: c.name,
      slug: c.slug,
      displayOrder: c.display_order,
      imageUrl: c.image_url,
      localAsset: c.local_asset,
      branchSpecific: c.branch_specific,
      status: c.status,
      updatedAt: new Date(),
    }, { merge: true });
  }
  await catBatch.commit();
  console.log(`[FirebaseAdmin] Synced ${categories.length} categories to Firestore.`);

  // 3. Sync Products
  const { rows: products } = await pool.query('SELECT * FROM products');
  const prodBatch = firestore.batch();
  for (const p of products) {
    const ref = firestore.collection('products').doc(p.id);
    prodBatch.set(ref, {
      id: p.id,
      categoryId: p.category_id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      rawImageUrl: p.raw_image_url,
      localAsset: p.local_asset,
      basePriceCents: p.base_price_cents,
      isAvailable: p.is_available,
      isDeliveryAvailable: p.is_delivery_available,
      status: p.status,
      sourceUrl: p.source_url,
      unit: p.unit,
      updatedAt: new Date(),
    }, { merge: true });
  }
  await prodBatch.commit();
  console.log(`[FirebaseAdmin] Synced ${products.length} products to Firestore.`);

  return {
    branchesCount: branches.length,
    categoriesCount: categories.length,
    productsCount: products.length,
  };
}
