import { Branch, Category, Product, Order, CustomCakeRequest, VERIFIED_BRANCHES } from '@yalcin/shared';
import catalogData from '../../../../assets/catalog.json';
import { getAssetUrl } from './assets';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/emrek0ca/yalcin-pastaneleri/main';

function getOfflineCategories(): Category[] {
  return catalogData.categories.map((c: any, idx: number) => {
    const isAdnanOnly = c.name.toUpperCase().includes('ADNAN MENDERES');
    const clean = c.name.replace(/\s*\(\s*ADNAN MENDERES[^\)]*\)/i, '').trim();
    const slug = clean.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const firstItem = c.items[0];
    return {
      id: `cat-${idx}`,
      name: clean,
      slug,
      displayOrder: idx + 1,
      imageUrl: firstItem?.local_asset ? getAssetUrl(firstItem.local_asset) : firstItem?.raw_image_url || undefined,
      description: clean,
      branchSpecific: isAdnanOnly ? 'adnan-menderes' : undefined,
      status: 'verified',
    };
  });
}

function getOfflineProducts(): Product[] {
  const products: Product[] = [];
  catalogData.categories.forEach((cat: any, cIdx: number) => {
    const isAdnanOnly = cat.name.toUpperCase().includes('ADNAN MENDERES');
    const cleanCatName = cat.name.replace(/\s*\(\s*ADNAN MENDERES[^\)]*\)/i, '').trim();
    const catSlug = cleanCatName.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    cat.items.forEach((item: any, iIdx: number) => {
      const priceCents = item.price_cents || item.base_price_cents || 0;
      products.push({
        id: `prod-${cIdx}-${iIdx}`,
        categoryId: `cat-${cIdx}`,
        name: item.title || item.name,
        slug: (item.title || item.name).toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description: item.description || '',
        basePriceCents: priceCents,
        rawImageUrl: item.raw_image_url || null,
        localAsset: item.local_asset ? getAssetUrl(item.local_asset) : null,
        isAvailable: true,
        isDeliveryAvailable: true,
        status: 'verified',
        sourceUrl: 'https://qrmenu.yalcinpastaneleri.com/',
        unit: 'porsiyon',
      });
    });
  });
  return products;
}

export async function fetchBranches(): Promise<Branch[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1200);
    const res = await fetch(`${API_BASE}/branches`, {
      next: { revalidate: 60 },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (res.ok) return await res.json();
  } catch (err) {
    // Zero-cost serverless fallback
  }
  return VERIFIED_BRANCHES;
}

export async function fetchCategories(branchId?: string): Promise<Category[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1200);
    const url = branchId ? `${API_BASE}/categories?branchId=${branchId}` : `${API_BASE}/categories`;
    const res = await fetch(url, { next: { revalidate: 60 }, signal: controller.signal });
    clearTimeout(timeoutId);
    if (res.ok) return await res.json();
  } catch (err) {
    // Zero-cost serverless fallback
  }

  const all = getOfflineCategories();
  if (branchId === 'raufbey') {
    return all.filter((c) => c.branchSpecific !== 'adnan-menderes');
  }
  return all;
}

export async function fetchProducts(params?: {
  categoryId?: string;
  branchId?: string;
  search?: string;
  limit?: number;
}): Promise<Product[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1200);
    const query = new URLSearchParams();
    if (params?.categoryId) query.set('categoryId', params.categoryId);
    if (params?.branchId) query.set('branchId', params.branchId);
    if (params?.search) query.set('search', params.search);
    if (params?.limit) query.set('limit', params.limit.toString());

    const res = await fetch(`${API_BASE}/products?${query.toString()}`, {
      cache: 'no-store',
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (res.ok) return await res.json();
  } catch (err) {
    // Zero-cost serverless fallback
  }

  let list = getOfflineProducts();
  if (params?.branchId === 'raufbey') {
    list = list.filter((p) => !p.name.includes('( ADNAN MENDERES'));
  }
  if (params?.categoryId && params.categoryId !== 'all') {
    list = list.filter(
      (p) => p.categoryId === params.categoryId
    );
  }
  if (params?.search && params.search.trim()) {
    const q = params.search.trim().toLowerCase();
    list = list.filter(
      (p) => p.name.toLowerCase().includes(q) || (p.description && p.description.toLowerCase().includes(q))
    );
  }
  if (params?.limit) {
    list = list.slice(0, params.limit);
  }
  return list;
}

export async function fetchProductById(id: string): Promise<Product | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1200);
    const res = await fetch(`${API_BASE}/products/${id}`, {
      cache: 'no-store',
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (res.ok) return await res.json();
  } catch (err) {
    // Zero-cost serverless fallback
  }

  const all = getOfflineProducts();
  return all.find((p) => p.id === id || p.slug === id) || null;
}

export async function validateCart(branchId: string, items: any[]) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1200);
    const res = await fetch(`${API_BASE}/cart/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ branchId, items }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (res.ok) return await res.json();
  } catch (err) {
    // Zero-cost serverless fallback: accept items
  }

  const subtotalCents = items.reduce(
    (acc: number, it: any) => acc + (it.unitPriceCents || 0) * (it.quantity || 1),
    0
  );
  return {
    valid: true,
    subtotalCents,
    deliveryFeeCents: 0,
    totalCents: subtotalCents,
    items,
  };
}

export async function createOrder(payload: any): Promise<Order> {
  const fallbackOrderNumber = `YLC-${Date.now().toString().slice(-6)}`;
  const branch = VERIFIED_BRANCHES.find((b) => b.id === payload.branchId) || VERIFIED_BRANCHES[0];
  const now = new Date().toISOString();
  const totalCents = (payload.items || []).reduce(
    (acc: number, item: any) => acc + (item.unitPriceCents || 0) * (item.quantity || 1),
    0
  );

  const localOrder: Order = {
    id: `local-order-${Date.now()}`,
    orderNumber: fallbackOrderNumber,
    branchId: payload.branchId,
    branchName: branch.name,
    customerName: payload.customerName,
    customerPhone: payload.customerPhone,
    orderType: payload.orderType,
    deliveryAddress: payload.deliveryAddress,
    status: 'received',
    statusHistory: [
      {
        status: 'received',
        timestamp: now,
        note: 'Siparişiniz alındı, hazırlanmak üzere sıraya eklendi.',
      },
    ],
    items: (payload.items || []).map((i: any, idx: number) => ({
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
    paymentMethod: payload.paymentMethod || 'card_on_delivery',
    paymentStatus: 'pending',
    createdAt: now,
    updatedAt: now,
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1200);
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (res.ok) {
      const serverOrder = await res.json();
      saveOrderToStorage(serverOrder);
      return serverOrder;
    }
  } catch (err) {
    // Zero-cost serverless fallback
  }

  saveOrderToStorage(localOrder);
  return localOrder;
}

function saveOrderToStorage(order: Order) {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('yalcin_orders');
      const list = stored ? JSON.parse(stored) : [];
      list.unshift(order);
      localStorage.setItem('yalcin_orders', JSON.stringify(list.slice(0, 50)));
    } catch (e) {
      // Storage error
    }
  }
}

export async function fetchOrderByRef(orderRef: string): Promise<Order> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1200);
    const res = await fetch(`${API_BASE}/orders/${orderRef}`, {
      cache: 'no-store',
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (res.ok) return await res.json();
  } catch (err) {
    // Zero-cost serverless fallback
  }

  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('yalcin_orders');
      if (stored) {
        const list: Order[] = JSON.parse(stored);
        const match = list.find((o) => o.orderNumber === orderRef || o.id === orderRef);
        if (match) return match;
      }
    } catch (e) {
      // Storage error
    }
  }

  throw new Error('Sipariş bulunamadı');
}

export async function createCustomCakeRequest(payload: any): Promise<CustomCakeRequest> {
  const fallbackNumber = `CAKE-${Date.now().toString().slice(-6)}`;
  const now = new Date().toISOString();
  const localCake: CustomCakeRequest = {
    id: `local-cake-${Date.now()}`,
    requestNumber: fallbackNumber,
    branchId: payload.branchId,
    customerName: payload.customerName,
    customerPhone: payload.customerPhone,
    deliveryDate: payload.deliveryDate,
    servingSize: payload.servingSize,
    flavorPreference: payload.flavorPreference,
    cakeMessage: payload.cakeMessage,
    notes: payload.notes,
    status: 'submitted',
    createdAt: now,
    updatedAt: now,
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1200);
    const res = await fetch(`${API_BASE}/custom-cakes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (res.ok) return await res.json();
  } catch (err) {
    // Zero-cost serverless fallback
  }

  return localCake;
}

export async function fetchAdminStats() {
  try {
    const res = await fetch(`${API_BASE}/stats`, { cache: 'no-store' });
    if (res.ok) return await res.json();
  } catch (err) {
    // Offline admin fallback
  }
  return {
    totalOrders: 0,
    totalRevenueCents: 0,
    pendingOrders: 0,
    pendingCakeRequests: 0,
    activeBranches: 2,
  };
}

export async function fetchAdminOrders(branchId?: string, status?: string) {
  try {
    const query = new URLSearchParams();
    if (branchId) query.set('branchId', branchId);
    if (status) query.set('status', status);
    const res = await fetch(`${API_BASE}/orders?${query.toString()}`, { cache: 'no-store' });
    if (res.ok) return await res.json();
  } catch (err) {
    // Offline
  }
  return [];
}

export async function updateOrderStatus(orderId: string, status: string, note?: string) {
  const res = await fetch(`${API_BASE}/orders/${orderId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, note }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Durum güncellenemedi');
  }
  return res.json();
}

export async function fetchCustomCakes() {
  try {
    const res = await fetch(`${API_BASE}/custom-cakes`, { cache: 'no-store' });
    if (res.ok) return await res.json();
  } catch (err) {
    // Offline
  }
  return [];
}

export async function quoteCustomCake(id: string, quoteCents: number, quoteNotes: string) {
  const res = await fetch(`${API_BASE}/custom-cakes/${id}/quote`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ quoteCents, quoteNotes }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Teklif sunulamadı');
  }
  return res.json();
}
