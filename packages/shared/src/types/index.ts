// Verification status per AGENTS.md rule 1.2
export type VerificationStatus = 'verified' | 'provisional' | 'unknown' | 'deprecated';

export interface Branch {
  id: string;
  name: string;
  slug: string;
  district: string;
  city: string;
  address: string;
  phone: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  openingHours: string;
  orderHours: string;
  status: VerificationStatus;
  sourceUrl: string;
  features: string[];
  isDeliveryAvailable: boolean;
  isPickupAvailable: boolean;
  minimumOrderCents: number; // in kuruş
  deliveryFeeCents: number;  // in kuruş
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  displayOrder: number;
  imageUrl?: string | null;
  localAsset?: string | null;
  description?: string | null;
  branchSpecific?: string | null; // e.g. 'adnan-menderes'
  status: VerificationStatus;
}

export interface Product {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  description?: string | null;
  ingredients?: string | null;
  allergens?: string[] | null;
  rawImageUrl?: string | null;
  localAsset?: string | null;
  basePriceCents: number; // e.g. 28000 for 280.00 TL
  isAvailable: boolean;
  isDeliveryAvailable: boolean;
  status: VerificationStatus;
  sourceUrl: string;
  unit: string; // 'adet', 'porsiyon', 'dilim', 'kg'
}

export interface ProductVariant {
  id: string;
  productId: string;
  name: string;
  unit: string;
  priceCents: number;
  isDefault: boolean;
}

export interface CartItem {
  productId: string;
  variantId?: string;
  name: string;
  unitPriceCents: number;
  quantity: number;
  totalPriceCents: number;
  notes?: string;
  imageUrl?: string | null;
}

export interface Cart {
  branchId: string;
  items: CartItem[];
  subtotalCents: number;
  deliveryFeeCents: number;
  totalCents: number;
  itemCount: number;
}

export type OrderType = 'delivery' | 'pickup';

export type OrderStatus =
  | 'received'
  | 'confirmed'
  | 'preparing'
  | 'out_for_delivery'
  | 'ready_for_pickup'
  | 'completed'
  | 'cancelled';

export interface OrderItem {
  productId: string;
  productName: string;
  variantName?: string;
  unitPriceCents: number;
  quantity: number;
  totalPriceCents: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  branchId: string;
  branchName: string;
  orderType: OrderType;
  status: OrderStatus;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  deliveryAddress?: string;
  deliveryNotes?: string;
  items: OrderItem[];
  subtotalCents: number;
  deliveryFeeCents: number;
  totalCents: number;
  idempotencyKey?: string;
  paymentMethod: 'cash_on_delivery' | 'card_on_delivery' | 'online_card';
  paymentStatus: 'pending' | 'authorized' | 'paid' | 'failed' | 'refunded';
  createdAt: string; // ISO 8601 UTC
  updatedAt: string;
  statusHistory: {
    status: OrderStatus;
    timestamp: string;
    note?: string;
  }[];
}

export type CustomCakeStatus =
  | 'submitted'
  | 'reviewing'
  | 'quoted'
  | 'accepted'
  | 'in_production'
  | 'delivered'
  | 'rejected';

export interface CustomCakeRequest {
  id: string;
  requestNumber: string;
  branchId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  deliveryDate: string; // YYYY-MM-DD
  servingSize: string;   // e.g. "10-12 kişilik", "20-25 kişilik"
  flavorPreference: string; // "Çikolatalı", "Meyveli", "Karamel", vb.
  cakeMessage?: string;
  notes?: string;
  referenceImageUrls?: string[];
  status: CustomCakeStatus;
  quoteCents?: number | null;
  quoteNotes?: string | null;
  quotedAt?: string | null;
  acceptedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}
