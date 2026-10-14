import { Branch, Category, Product, Order, CustomCakeRequest, VERIFIED_BRANCHES } from '@yalcin/shared';
import catalogData from '../../../assets/catalog.json';

// In development, uses machine LAN IP for physical device connection
export const API_BASE_URL = 'http://192.168.1.106:4000/api';

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

/**
 * Normalizes an item from catalogData into MobileProduct
 */
function normalizeCatalogProduct(item: any, catName: string, id: string): MobileProduct {
  const isAdnanOnly = catName.toUpperCase().includes('ADNAN MENDERES');
  const cleanCatName = catName.replace(/\s*\(\s*ADNAN MENDERES[^\)]*\)/i, '').trim();
  const slug = cleanCatName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  
  // Use authentic image URL from qrmenu or fallback to API local asset
  const imageUrl = item.raw_image_url || `${API_BASE_URL.replace('/api', '')}/${item.local_asset || ''}`;

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
 * Fetch branches from API with instant fallback
 */
export async function getBranches(): Promise<Branch[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);
    const res = await fetch(`${API_BASE_URL}/branches`, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (res.ok) return await res.json();
  } catch (e) {
    // Graceful fallback to verified branches
  }
  return VERIFIED_BRANCHES;
}

/**
 * Fetch categories from API with instant fallback
 */
export async function getCategories(branchId?: string): Promise<MobileCategory[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);
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
    // Fallback
  }
  const all = getAllOfflineCategories();
  if (branchId === 'raufbey') {
    return all.filter((c) => !c.isAdnanOnly);
  }
  return all;
}

/**
 * Fetch products from API with instant offline fallback
 */
export async function getProducts(params?: {
  branchId?: string;
  categoryId?: string;
  search?: string;
}): Promise<MobileProduct[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);
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
          imageUrl: p.rawImageUrl || `${API_BASE_URL.replace('/api', '')}/${p.localAsset || ''}`,
          categoryName: p.categoryName || 'Genel',
          categorySlug: p.categorySlug || 'genel',
          isAdnanOnly: false,
          isAvailable: p.isAvailable !== false,
        }));
      }
    }
  } catch (e) {
    // Fallback
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

export async function submitOrder(orderPayload: any): Promise<Order> {
  const res = await fetch(`${API_BASE_URL}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderPayload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Sipariş iletilemedi' }));
    throw new Error(err.error || 'Sipariş iletilemedi');
  }
  return res.json();
}

export async function trackOrder(orderNumber: string): Promise<Order> {
  const res = await fetch(`${API_BASE_URL}/orders/${orderNumber}`);
  if (!res.ok) throw new Error('Sipariş bulunamadı');
  return res.json();
}

export async function submitCustomCake(cakePayload: any): Promise<CustomCakeRequest> {
  const res = await fetch(`${API_BASE_URL}/custom-cakes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cakePayload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Özel pasta talebi iletilemedi' }));
    throw new Error(err.error || 'Özel pasta talebi iletilemedi');
  }
  return res.json();
}
