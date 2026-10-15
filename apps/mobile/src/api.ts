import { Branch, Category, Product, Order, CustomCakeRequest, VERIFIED_BRANCHES } from '@yalcin/shared';
import catalogData from '../../../assets/catalog.json';
import instagramFeedData from '../../../assets/instagram-feed.json';

// In development or when server is deployed; otherwise seamlessly falls back to 100% serverless
export const API_BASE_URL = 'http://192.168.1.106:4000/api';
export const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/emrek0ca/yalcin-pastaneleri/main';

export interface MobileProduct {
  id: string;
  title: string;
  description: string;
  priceCents: number;
  priceFormatted: string;
  imageUrl: string;
  categoryName: string;
  categorySlug: string;
  isAdnanOnly: boolean;
  isAvailable: boolean;
}

export interface MobileCategory {
  id: string;
  name: string;
  slug: string;
  itemCount: number;
  imageUrl?: string;
  isAdnanOnly?: boolean;
}

export interface InstagramStory {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  timestamp: string;
}

export interface InstagramReel {
  id: string;
  title: string;
  caption: string;
  posterUrl: string;
  videoUrl: string;
  views: string;
  likes: string;
  duration?: string;
  instagramUrl: string;
}

export interface InstagramPost {
  id: string;
  title: string;
  imageUrl: string;
  date: string;
  likes: string;
  instagramUrl: string;
}

export interface InstagramFeed {
  updatedAt: string;
  account: string;
  instagramUrl: string;
  stories: InstagramStory[];
  latestReel: InstagramReel;
  latestPost: InstagramPost;
}

/**
 * Normalizes an item from catalogData into MobileProduct (zero-cost serverless catalog)
 */
function normalizeCatalogProduct(item: any, catName: string, id: string): MobileProduct {
  const isAdnanOnly = catName.toUpperCase().includes('ADNAN MENDERES');
  const cleanCatName = catName.replace(/\s*\(\s*ADNAN MENDERES[^\)]*\)/i, '').trim();
  const slug = cleanCatName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  
  // Use authentic image URL from qrmenu or fallback to raw GitHub CDN asset
  const imageUrl =
    item.raw_image_url ||
    (item.local_asset ? `${GITHUB_RAW_BASE}/assets/${item.local_asset}` : '');

  return {
    id,
    title: item.title || item.name,
    description: item.description || '',
    priceCents: item.price_cents || item.base_price_cents || 0,
    priceFormatted: `${((item.price_cents || item.base_price_cents || 0) / 100).toFixed(2)} ₺`,
    imageUrl,
    categoryName: cleanCatName,
    categorySlug: slug,
    isAdnanOnly,
    isAvailable: true,
  };
}

/**
 * Returns all 179 authentic products from catalog with normalization
 */
export function getAllOfflineProducts(): MobileProduct[] {
  const list: MobileProduct[] = [];
  catalogData.categories.forEach((cat: any, cIdx: number) => {
    cat.items.forEach((item: any, iIdx: number) => {
      list.push(normalizeCatalogProduct(item, cat.name, `prod-${cIdx}-${iIdx}`));
    });
  });
  return list;
}

/**
 * Returns all 19 authentic categories
 */
export function getAllOfflineCategories(): MobileCategory[] {
  return catalogData.categories.map((c: any, idx: number) => {
    const isAdnanOnly = c.name.toUpperCase().includes('ADNAN MENDERES');
    const clean = c.name.replace(/\s*\(\s*ADNAN MENDERES[^\)]*\)/i, '').trim();
    const slug = clean.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const firstItem = c.items[0];
    const imageUrl = firstItem?.raw_image_url || undefined;
    return {
      id: `cat-${idx}`,
      name: clean,
      slug,
      itemCount: c.items?.length || 0,
      imageUrl,
      isAdnanOnly,
    };
  });
}

/**
 * Fetch branches (instant zero-server fallback to VERIFIED_BRANCHES)
 */
export async function getBranches(): Promise<Branch[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1200);
    const res = await fetch(`${API_BASE_URL}/branches`, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (res.ok) return await res.json();
  } catch (e) {
    // Serverless mode
  }
  return VERIFIED_BRANCHES;
}

/**
 * Fetch categories with instant offline fallback
 */
export async function getCategories(branchId?: string): Promise<MobileCategory[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1200);
    const url = branchId ? `${API_BASE_URL}/categories?branchId=${branchId}` : `${API_BASE_URL}/categories`;
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      return data.map((c: any) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        itemCount: 0,
        imageUrl: c.imageUrl,
        isAdnanOnly: c.branchSpecific === 'adnan-menderes',
      }));
    }
  } catch (e) {
    // Serverless mode
  }
  const all = getAllOfflineCategories();
  if (branchId === 'raufbey') {
    return all.filter((c) => !c.isAdnanOnly);
  }
  return all;
}

/**
 * Fetch products with instant offline fallback
 */
export async function getProducts(params?: {
  branchId?: string;
  categoryId?: string;
  search?: string;
}): Promise<MobileProduct[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1200);
    const queryParts: string[] = [];
    if (params?.branchId) queryParts.push(`branchId=${params.branchId}`);
    if (params?.categoryId) queryParts.push(`categoryId=${params.categoryId}`);
    if (params?.search) queryParts.push(`search=${encodeURIComponent(params.search)}`);
    queryParts.push('limit=300');

    const url = `${API_BASE_URL}/products?${queryParts.join('&')}`;
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const rows = await res.json();
      if (Array.isArray(rows) && rows.length > 0) {
        return rows.map((p: any) => ({
          id: p.id,
          title: p.name,
          description: p.description || '',
          priceCents: p.basePriceCents || 0,
          priceFormatted: `${((p.basePriceCents || 0) / 100).toFixed(2)} ₺`,
          imageUrl: p.rawImageUrl || (p.localAsset ? `${GITHUB_RAW_BASE}/assets/${p.localAsset}` : ''),
          categoryName: p.categoryName || 'Genel',
          categorySlug: p.categorySlug || 'genel',
          isAdnanOnly: false,
          isAvailable: p.isAvailable !== false,
        }));
      }
    }
  } catch (e) {
    // Serverless mode
  }

  // Fallback to verified catalog
  let list = getAllOfflineProducts();
  if (params?.branchId === 'raufbey') {
    list = list.filter((p) => !p.isAdnanOnly);
  }
  if (params?.categoryId && params.categoryId !== 'all') {
    list = list.filter((p) => p.categorySlug === params.categoryId || p.categoryName === params.categoryId);
  }
  if (params?.search && params.search.trim().length > 0) {
    const q = params.search.trim().toLowerCase();
    list = list.filter((p) => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
  }
  return list;
}

/**
 * Fetch Instagram Feed dynamically (from GitHub Raw or local fallback, zero server cost)
 */
export async function getInstagramFeed(): Promise<InstagramFeed> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(`${GITHUB_RAW_BASE}/assets/instagram-feed.json`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      return data as InstagramFeed;
    }
  } catch (e) {
    // Serverless mode: graceful fallback to local bundled file
  }
  return instagramFeedData as unknown as InstagramFeed;
}

/**
 * Submit order (works 100% serverless, creates local Order and enables 1-tap WhatsApp ticketing)
 */
export async function submitOrder(orderPayload: any): Promise<Order> {
  const fallbackOrderNumber = `YLC-${Date.now().toString().slice(-6)}`;
  const totalCents = (orderPayload.items || []).reduce(
    (acc: number, item: any) => acc + (item.unitPriceCents || 0) * (item.quantity || 1),
    0
  );

  const branch = VERIFIED_BRANCHES.find((b) => b.id === orderPayload.branchId) || VERIFIED_BRANCHES[0];
  const now = new Date().toISOString();

  const localOrder: Order = {
    id: `local-order-${Date.now()}`,
    orderNumber: fallbackOrderNumber,
    branchId: orderPayload.branchId,
    branchName: branch.name,
    customerName: orderPayload.customerName,
    customerPhone: orderPayload.customerPhone,
    orderType: orderPayload.orderType,
    deliveryAddress: orderPayload.deliveryAddress,
    status: 'received',
    statusHistory: [
      {
        status: 'received',
        timestamp: now,
        note: 'Siparişiniz alındı, hazırlanmak üzere sıraya eklendi.',
      },
    ],
    items: (orderPayload.items || []).map((i: any, idx: number) => ({
      id: `item-${idx}`,
      productId: i.productId,
      productName: i.name,
      variantName: i.name,
      quantity: i.quantity,
      unitPriceCents: i.unitPriceCents,
      totalPriceCents: i.unitPriceCents * i.quantity,
    })),
    subtotalCents: totalCents,
    deliveryFeeCents: 0,
    totalCents,
    paymentMethod: orderPayload.paymentMethod || 'card_on_delivery',
    paymentStatus: 'pending',
    createdAt: now,
    updatedAt: now,
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1200);
    const res = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderPayload),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    // Serverless zero-cost mode
  }

  return localOrder;
}

/**
 * Track order
 */
export async function trackOrder(orderNumber: string): Promise<Order | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1200);
    const res = await fetch(`${API_BASE_URL}/orders/${orderNumber}`, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (res.ok) return await res.json();
  } catch (e) {
    // Fallback
  }
  return null;
}

/**
 * Submit custom cake (works 100% serverless, creates local ticket and enables 1-tap WhatsApp message)
 */
export async function submitCustomCake(cakePayload: any): Promise<CustomCakeRequest> {
  const fallbackRequestNumber = `CAKE-${Date.now().toString().slice(-6)}`;
  const now = new Date().toISOString();
  const localRequest: CustomCakeRequest = {
    id: `local-cake-${Date.now()}`,
    requestNumber: fallbackRequestNumber,
    branchId: cakePayload.branchId,
    customerName: cakePayload.customerName,
    customerPhone: cakePayload.customerPhone,
    deliveryDate: cakePayload.deliveryDate,
    servingSize: cakePayload.servingSize,
    flavorPreference: cakePayload.flavorPreference,
    cakeMessage: cakePayload.cakeMessage,
    notes: cakePayload.notes,
    status: 'submitted',
    createdAt: now,
    updatedAt: now,
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1200);
    const res = await fetch(`${API_BASE_URL}/custom-cakes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cakePayload),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    // Serverless mode
  }

  return localRequest;
}

/**
 * Formats order into an official WhatsApp receipt message
 */
export function formatOrderWhatsAppMessage(order: {
  orderNumber: string;
  branchName: string;
  customerName: string;
  customerPhone: string;
  orderType: 'delivery' | 'pickup';
  deliveryAddress?: string;
  items: Array<{ name: string; quantity: number; unitPriceCents: number }>;
  totalCents: number;
}): string {
  const itemsText = order.items
    .map(
      (it) => `• ${it.quantity}x ${it.name} (${((it.unitPriceCents * it.quantity) / 100).toFixed(2)} TL)`
    )
    .join('\n');

  return (
    `*YALÇIN PASTANELERİ - SİPARİŞ FİŞİ*\n` +
    `--------------------------------\n` +
    `Sipariş No: *${order.orderNumber}*\n` +
    `Şube: *${order.branchName}*\n` +
    `Tür: *${order.orderType === 'delivery' ? 'Paket Servis' : 'Gel-Al (Şubeden Teslim)'}*\n` +
    `Müşteri: *${order.customerName}*\n` +
    `Telefon: *${order.customerPhone}*\n` +
    (order.deliveryAddress ? `Adres: *${order.deliveryAddress}*\n` : '') +
    `--------------------------------\n` +
    `*Sipariş Kalemleri:*\n` +
    `${itemsText}\n` +
    `--------------------------------\n` +
    `*TOPLAM TUTAR: ${((order.totalCents) / 100).toFixed(2)} TL*\n` +
    `Ödeme: Kapıda Kart / Nakit\n\n` +
    `_Siparişimi onaylıyorum, lütfen hazırlayınız._`
  );
}

/**
 * Formats custom cake into an official WhatsApp inquiry message
 */
export function formatCustomCakeWhatsAppMessage(cake: {
  requestNumber: string;
  branchName: string;
  customerName: string;
  customerPhone: string;
  deliveryDate: string;
  servingSize: string;
  flavorPreference: string;
  cakeMessage?: string;
  notes?: string;
}): string {
  return (
    `*YALÇIN PASTANELERİ - BUTİK PASTA TALEBİ*\n` +
    `--------------------------------\n` +
    `Talep No: *${cake.requestNumber}*\n` +
    `Şube: *${cake.branchName}*\n` +
    `Müşteri: *${cake.customerName}*\n` +
    `Telefon: *${cake.customerPhone}*\n` +
    `Teslim Tarihi: *${cake.deliveryDate}*\n` +
    `Porsiyon: *${cake.servingSize}*\n` +
    `Lezzet: *${cake.flavorPreference}*\n` +
    (cake.cakeMessage ? `Üzerine Yazılacak Mesaj: *${cake.cakeMessage}*\n` : '') +
    (cake.notes ? `Özel Notlar: *${cake.notes}*\n` : '') +
    `--------------------------------\n` +
    `_Özel pasta siparişim için fiyat ve onay bilgisi rica ediyorum._`
  );
}
