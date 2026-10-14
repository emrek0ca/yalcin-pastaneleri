'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShoppingBag, MapPin, Truck, Store, ArrowRight, AlertCircle, ShieldCheck, Check, CreditCard, Banknote } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useBranch } from '@/context/BranchContext';
import { createOrder } from '@/lib/api';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotalCents, subtotalFormatted, clearCart } = useCart();
  const { selectedBranch, branches, setSelectedBranchId } = useBranch();

  const [orderType, setOrderType] = useState<'delivery' | 'pickup'>('delivery');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash_on_delivery' | 'card_on_delivery' | 'online_card'>('card_on_delivery');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deliveryFeeCents = orderType === 'delivery' ? selectedBranch.deliveryFeeCents : 0;
  const totalCents = subtotalCents + deliveryFeeCents;
  const totalFormatted = (totalCents / 100).toLocaleString('tr-TR', { minimumFractionDigits: 2 }) + ' ₺';

  const isMinMet = orderType === 'pickup' || subtotalCents >= selectedBranch.minimumOrderCents;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (items.length === 0) {
      setError('Sepetinizde ürün bulunmuyor.');
      return;
    }

    if (orderType === 'delivery' && !isMinMet) {
      setError(`Paket servis için minimum sipariş tutarı ${(selectedBranch.minimumOrderCents / 100).toFixed(2)} ₺ olmalıdır.`);
      return;
    }

    setLoading(true);

    try {
      const payload = {
        branchId: selectedBranch.id,
        orderType,
        customerName,
        customerPhone,
        customerEmail: customerEmail || undefined,
        deliveryAddress: orderType === 'delivery' ? deliveryAddress : undefined,
        deliveryNotes: deliveryNotes || undefined,
        paymentMethod,
        items: items.map((i) => ({
          productId: i.productId,
          name: i.name,
          unitPriceCents: i.unitPriceCents,
          quantity: i.quantity,
          notes: i.notes,
        })),
      };

      const order = await createOrder(payload);
      clearCart();
      router.push(`/siparis-takip/${order.orderNumber || (order as any).order_number}`);
    } catch (err: any) {
      setError(err.message || 'Sipariş iletilirken bir hata oluştu.');
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-background-alt flex items-center justify-center text-secondary mx-auto">
          <ShoppingBag className="w-8 h-8 opacity-40" />
        </div>
        <h1 className="text-2xl font-bold text-primary">Sepetiniz Boş</h1>
        <p className="text-secondary text-sm">
          Sipariş oluşturmak için lütfen menümüzden dilediğiniz lezzetleri ekleyin.
        </p>
        <div className="pt-2">
          <Link
            href="/menu"
            className="px-6 py-3 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-light transition"
          >
            Menüyü Görüntüle
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-primary">Siparişi Tamamla</h1>
        <p className="text-secondary text-xs sm:text-sm mt-1">
          Teslimat ve iletişim bilgilerinizi girerek siparişinizi onaylayın.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Col: Order Forms */}
        <div className="lg:col-span-7 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* 1. Order Type & Branch */}
          <div className="bg-white rounded-2xl border border-border p-6 space-y-4 shadow-sm">
            <h2 className="text-sm font-bold text-primary flex items-center gap-2 border-b border-border pb-3">
              <Store className="w-4 h-4 text-accent" />
              1. Teslimat Yöntemi & Şube
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setOrderType('delivery')}
                className={`p-3.5 rounded-xl border text-left flex items-center gap-3 transition ${
                  orderType === 'delivery'
                    ? 'border-accent bg-accent-light/30 text-primary font-semibold'
                    : 'border-border bg-background-alt text-secondary'
                }`}
              >
                <Truck className={`w-5 h-5 ${orderType === 'delivery' ? 'text-accent' : 'text-secondary'}`} />
                <div>
                  <div className="text-xs font-bold">Paket Servis</div>
                  <div className="text-[11px] text-secondary">Adresinize gelsin</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setOrderType('pickup')}
                className={`p-3.5 rounded-xl border text-left flex items-center gap-3 transition ${
                  orderType === 'pickup'
                    ? 'border-accent bg-accent-light/30 text-primary font-semibold'
                    : 'border-border bg-background-alt text-secondary'
                }`}
              >
                <Store className={`w-5 h-5 ${orderType === 'pickup' ? 'text-accent' : 'text-secondary'}`} />
                <div>
                  <div className="text-xs font-bold">Gel & Al</div>
                  <div className="text-[11px] text-secondary">Şubeden teslim alın</div>
                </div>
              </button>
            </div>

            <div className="pt-2">
              <label className="block text-xs font-semibold text-secondary mb-1">
                Siparişin Hazırlanacağı Şube:
              </label>
              <select
                value={selectedBranch.id}
                onChange={(e) => setSelectedBranchId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-background-alt border border-border rounded-xl text-xs sm:text-sm font-medium text-primary focus:outline-none focus:border-accent"
              >
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} — {b.address}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 2. Customer Information */}
          <div className="bg-white rounded-2xl border border-border p-6 space-y-4 shadow-sm">
            <h2 className="text-sm font-bold text-primary flex items-center gap-2 border-b border-border pb-3">
              <ShieldCheck className="w-4 h-4 text-accent" />
              2. İletişim & Teslimat Bilgileri
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-primary mb-1">
                  Adınız ve Soyadınız *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ad Soyad"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-background-alt border border-border rounded-xl text-xs sm:text-sm text-primary focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-primary mb-1">
                  Cep Telefonunuz * (05XXXXXXXXX)
                </label>
                <input
                  type="tel"
                  required
                  placeholder="05XXXXXXXXX"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-background-alt border border-border rounded-xl text-xs sm:text-sm text-primary focus:outline-none focus:border-accent"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-primary mb-1">
                E-posta Adresiniz (Opsiyonel)
              </label>
              <input
                type="email"
                placeholder="ornek@domain.com"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-background-alt border border-border rounded-xl text-xs sm:text-sm text-primary focus:outline-none focus:border-accent"
              />
            </div>

            {orderType === 'delivery' && (
              <div>
                <label className="block text-xs font-semibold text-primary mb-1">
                  Teslimat Açık Adresi (Osmaniye Merkez) *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Mahalle, cadde, sokak, bina no, kat ve daire bilgisi..."
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-background-alt border border-border rounded-xl text-xs sm:text-sm text-primary focus:outline-none focus:border-accent"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-primary mb-1">
                Sipariş / Kurye Notu (Opsiyonel)
              </label>
              <input
                type="text"
                placeholder="Örn: Zili çalmayınız, kapıya bırakınız..."
                value={deliveryNotes}
                onChange={(e) => setDeliveryNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-background-alt border border-border rounded-xl text-xs sm:text-sm text-primary focus:outline-none focus:border-accent"
              />
            </div>
          </div>

          {/* 3. Payment Method */}
          <div className="bg-white rounded-2xl border border-border p-6 space-y-4 shadow-sm">
            <h2 className="text-sm font-bold text-primary flex items-center gap-2 border-b border-border pb-3">
              <CreditCard className="w-4 h-4 text-accent" />
              3. Ödeme Yöntemi
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('card_on_delivery')}
                className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition ${
                  paymentMethod === 'card_on_delivery'
                    ? 'border-accent bg-accent-light/30 font-semibold'
                    : 'border-border bg-background-alt text-secondary'
                }`}
              >
                <CreditCard className="w-5 h-5 text-accent mb-2" />
                <div className="text-xs font-bold text-primary">Kapıda Kredi Kartı</div>
                <div className="text-[10px] text-secondary mt-0.5">POS cihazı ile</div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('cash_on_delivery')}
                className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition ${
                  paymentMethod === 'cash_on_delivery'
                    ? 'border-accent bg-accent-light/30 font-semibold'
                    : 'border-border bg-background-alt text-secondary'
                }`}
              >
                <Banknote className="w-5 h-5 text-emerald-600 mb-2" />
                <div className="text-xs font-bold text-primary">Kapıda Nakit</div>
                <div className="text-[10px] text-secondary mt-0.5">Nakit ödeme</div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('online_card')}
                className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition ${
                  paymentMethod === 'online_card'
                    ? 'border-accent bg-accent-light/30 font-semibold'
                    : 'border-border bg-background-alt text-secondary'
                }`}
              >
                <ShieldCheck className="w-5 h-5 text-primary mb-2" />
                <div className="text-xs font-bold text-primary">Online Kart</div>
                <div className="text-[10px] text-secondary mt-0.5">3D Secure ile</div>
              </button>
            </div>
          </div>
        </div>

        {/* Right Col: Order Summary */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-border p-6 space-y-6 shadow-sm sticky top-28">
          <h2 className="text-base font-bold text-primary flex items-center justify-between border-b border-border pb-3">
            <span>Sipariş Özeti</span>
            <span className="text-xs font-normal text-secondary">{items.length} Kalem</span>
          </h2>

          <div className="divide-y divide-border/60 max-h-72 overflow-y-auto pr-1">
            {items.map((item) => (
              <div key={item.productId} className="py-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-primary">{item.quantity}x</span>
                  <div>
                    <div className="font-medium text-primary">{item.name}</div>
                    <div className="text-[11px] text-secondary">
                      {(item.unitPriceCents / 100).toFixed(2)} ₺ / adet
                    </div>
                  </div>
                </div>
                <span className="font-bold text-primary">
                  {(item.totalPriceCents / 100).toFixed(2)} ₺
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-border pt-4 space-y-2 text-xs">
            <div className="flex justify-between text-secondary">
              <span>Ara Toplam</span>
              <span>{subtotalFormatted}</span>
            </div>
            <div className="flex justify-between text-secondary">
              <span>Teslimat Ücreti</span>
              <span>{deliveryFeeCents === 0 ? 'Ücretsiz' : `${(deliveryFeeCents / 100).toFixed(2)} ₺`}</span>
            </div>
            <div className="flex justify-between text-base font-extrabold text-primary pt-2 border-t border-border">
              <span>Toplam Tutar</span>
              <span className="text-accent">{totalFormatted}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 px-6 bg-accent hover:bg-accent-hover text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2 shadow-sm transition disabled:opacity-50"
          >
            {loading ? (
              <span>Siparişiniz İletiliyor...</span>
            ) : (
              <>
                <span>Siparişi Onayla & Gönder</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
