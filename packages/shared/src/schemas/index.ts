import { z } from 'zod';

// Turkish phone number pattern: 05XXXXXXXXX or +905XXXXXXXXX
const phoneRegex = /^(?:\+90|0)?5[0-9]{9}$/;

export const CartItemSchema = z.object({
  productId: z.string().min(1, 'Ürün ID zorunludur'),
  variantId: z.string().optional(),
  name: z.string().min(1),
  unitPriceCents: z.number().int().nonnegative(),
  quantity: z.number().int().min(1, 'Adet en az 1 olmalıdır'),
  notes: z.string().max(250).optional(),
  imageUrl: z.string().nullable().optional(),
});

export const CartValidateSchema = z.object({
  branchId: z.string().min(1, 'Şube seçimi zorunludur'),
  items: z.array(CartItemSchema),
});

export const CreateOrderSchema = z.object({
  branchId: z.string().min(1, 'Şube seçimi zorunludur'),
  orderType: z.enum(['delivery', 'pickup']),
  customerName: z.string().min(2, 'Ad Soyad en az 2 karakter olmalıdır').max(100),
  customerPhone: z.string().regex(phoneRegex, 'Geçerli bir Türkiye cep telefonu giriniz (05XXXXXXXXX)'),
  customerEmail: z.string().email('Geçerli bir e-posta giriniz').optional().or(z.literal('')),
  deliveryAddress: z.string().min(10, 'Açık adres en az 10 karakter olmalıdır').max(500).optional(),
  deliveryNotes: z.string().max(300).optional(),
  items: z.array(CartItemSchema).min(1, 'Sepetinizde en az bir ürün bulunmalıdır'),
  paymentMethod: z.enum(['cash_on_delivery', 'card_on_delivery', 'online_card']),
  idempotencyKey: z.string().uuid().optional(),
}).refine((data) => {
  if (data.orderType === 'delivery') {
    return !!data.deliveryAddress && data.deliveryAddress.trim().length >= 10;
  }
  return true;
}, {
  message: 'Teslimat siparişlerinde açık adres zorunludur',
  path: ['deliveryAddress'],
});

export const CreateCustomCakeRequestSchema = z.object({
  branchId: z.string().min(1, 'Şube seçimi zorunludur'),
  customerName: z.string().min(2, 'Ad Soyad en az 2 karakter olmalıdır').max(100),
  customerPhone: z.string().regex(phoneRegex, 'Geçerli bir cep telefonu giriniz (05XXXXXXXXX)'),
  customerEmail: z.string().email('Geçerli bir e-posta giriniz').optional().or(z.literal('')),
  deliveryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Tarih YYYY-AA-GG formatında olmalıdır'),
  servingSize: z.string().min(1, 'Kişi sayısı tercihi seçiniz'),
  flavorPreference: z.string().min(1, 'Pasta lezzet/içerik tercihi seçiniz'),
  cakeMessage: z.string().max(100, 'Pasta üzeri yazı en fazla 100 karakter olabilir').optional(),
  notes: z.string().max(1000, 'Özel istekler en fazla 1000 karakter olabilir').optional(),
  referenceImageUrls: z.array(z.string().url()).optional(),
});

export const UpdateOrderStatusSchema = z.object({
  status: z.enum([
    'received',
    'confirmed',
    'preparing',
    'out_for_delivery',
    'ready_for_pickup',
    'completed',
    'cancelled',
  ]),
  note: z.string().max(250).optional(),
});

export const QuoteCustomCakeSchema = z.object({
  quoteCents: z.number().int().positive('Teklif tutarı pozitif bir değer olmalıdır'),
  quoteNotes: z.string().min(3, 'Teklif açıklaması girilmelidir').max(500),
});

export const RegisterDeviceSchema = z.object({
  token: z.string().min(10, 'FCM token zorunludur'),
  platform: z.enum(['ios', 'android', 'web']),
  customerId: z.string().optional(),
});
