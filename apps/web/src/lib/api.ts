import { Branch, Category, Product, Order, CustomCakeRequest } from '@yalcin/shared';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export async function fetchBranches(): Promise<Branch[]> {
  try {
    const res = await fetch(`${API_BASE}/branches`, { next: { revalidate: 60 } });
    if (!res.ok) throw new Error('Şubeler alınamadı');
    return res.json();
  } catch (err) {
    console.error('Error fetching branches:', err);
    return [];
  }
}

export async function fetchCategories(branchId?: string): Promise<Category[]> {
  try {
    const url = branchId ? `${API_BASE}/categories?branchId=${branchId}` : `${API_BASE}/categories`;
    const res = await fetch(url, { next: { revalidate: 60 } });
    if (!res.ok) throw new Error('Kategoriler alınamadı');
    return res.json();
  } catch (err) {
    console.error('Error fetching categories:', err);
    return [];
  }
}

export async function fetchProducts(params?: {
  categoryId?: string;
  branchId?: string;
  search?: string;
  limit?: number;
}): Promise<Product[]> {
  try {
    const query = new URLSearchParams();
    if (params?.categoryId) query.set('categoryId', params.categoryId);
    if (params?.branchId) query.set('branchId', params.branchId);
    if (params?.search) query.set('search', params.search);
    if (params?.limit) query.set('limit', params.limit.toString());

    const res = await fetch(`${API_BASE}/products?${query.toString()}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Ürünler alınamadı');
    return res.json();
  } catch (err) {
    console.error('Error fetching products:', err);
    return [];
  }
}

export async function fetchProductById(id: string): Promise<Product | null> {
  try {
    const res = await fetch(`${API_BASE}/products/${id}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
  } catch (err) {
    console.error('Error fetching product:', err);
    return null;
  }
}

export async function validateCart(branchId: string, items: any[]) {
  const res = await fetch(`${API_BASE}/cart/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ branchId, items }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Sepet doğrulanamadı');
  }
  return res.json();
}

export async function createOrder(payload: any): Promise<Order> {
  const res = await fetch(`${API_BASE}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Sipariş oluşturulamadı');
  }
  return res.json();
}

export async function fetchOrderByRef(orderRef: string): Promise<Order> {
  const res = await fetch(`${API_BASE}/orders/${orderRef}`, { cache: 'no-store' });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Sipariş bulunamadı');
  }
  return res.json();
}

export async function createCustomCakeRequest(payload: any): Promise<CustomCakeRequest> {
  const res = await fetch(`${API_BASE}/custom-cakes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Talep iletilemedi');
  }
  return res.json();
}

export async function fetchAdminStats() {
  const res = await fetch(`${API_BASE}/stats`, { cache: 'no-store' });
  if (!res.ok) throw new Error('İstatistikler alınamadı');
  return res.json();
}

export async function fetchAdminOrders(branchId?: string, status?: string) {
  const query = new URLSearchParams();
  if (branchId) query.set('branchId', branchId);
  if (status) query.set('status', status);
  const res = await fetch(`${API_BASE}/orders?${query.toString()}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Siparişler alınamadı');
  return res.json();
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
  const res = await fetch(`${API_BASE}/custom-cakes`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Özel pasta talepleri alınamadı');
  return res.json();
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
