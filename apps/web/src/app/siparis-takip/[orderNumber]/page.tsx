'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { CheckCircle2, Clock, Phone, MapPin, Package, ArrowLeft, RefreshCw, AlertCircle } from 'lucide-react';
import { fetchOrderByRef } from '@/lib/api';

export default function OrderTrackingPage() {
  const params = useParams();
  const orderNumber = params.orderNumber as string;

  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOrder = async () => {
    if (!orderNumber) return;
    try {
      const data = await fetchOrderByRef(orderNumber);
      setOrder(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Sipariş bilgisi yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrder();
    const interval = setInterval(loadOrder, 8000); // 8-second live poll
    return () => clearInterval(interval);
  }, [orderNumber]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <RefreshCw className="w-8 h-8 text-accent animate-spin mx-auto" />
        <p className="text-secondary text-sm">Sipariş durumu sorgulanıyor...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
        <h1 className="text-2xl font-bold text-primary">Sipariş Bulunamadı</h1>
        <p className="text-secondary text-sm">
          {error || 'Belirtilen sipariş numarasına ait bir kayıt bulunamadı.'}
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-light transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Ana Sayfaya Dön</span>
        </Link>
      </div>
    );
  }

  const steps = [
    { key: 'received', title: 'Sipariş Alındı', desc: 'Siparişiniz şubeye ulaştı' },
    { key: 'confirmed', title: 'Onaylandı', desc: 'Şube tarafından teyit edildi' },
    { key: 'preparing', title: 'Hazırlanıyor', desc: 'Ustalarımız taze olarak hazırlıyor' },
    {
      key: order.order_type === 'pickup' ? 'ready_for_pickup' : 'out_for_delivery',
      title: order.order_type === 'pickup' ? 'Teslimata Hazır' : 'Yola Çıktı',
      desc: order.order_type === 'pickup' ? 'Şubeden teslim alabilirsiniz' : 'Kuryemiz adresinize teslim ediyor',
    },
    { key: 'completed', title: 'Teslim Edildi', desc: 'Afiyet olsun!' },
  ];

  const statusOrder = ['received', 'confirmed', 'preparing', order.order_type === 'pickup' ? 'ready_for_pickup' : 'out_for_delivery', 'completed'];
  const currentIndex = statusOrder.indexOf(order.status);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <Link
          href="/"
          className="text-xs font-semibold text-secondary hover:text-primary flex items-center gap-1.5 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Ana Sayfa</span>
        </Link>
        <span className="text-xs text-secondary flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          Canlı Takip Aktif
        </span>
      </div>

      {/* Hero Status Card */}
      <div className="bg-white rounded-2xl border border-border p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
          <div>
            <span className="text-xs font-bold text-accent uppercase tracking-wider">
              {order.branchName || 'Yalçın Pastaneleri'}
            </span>
            <h1 className="text-2xl font-extrabold text-primary mt-0.5">
              Sipariş #{order.order_number}
            </h1>
            <p className="text-xs text-secondary mt-1">
              {new Date(order.created_at).toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' })}
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-extrabold text-primary">
              {(order.total_cents / 100).toFixed(2)} ₺
            </div>
            <div className="text-xs font-semibold text-secondary uppercase mt-0.5">
              {order.payment_method === 'online_card' ? 'Online Ödeme' : 'Kapıda Ödeme'}
            </div>
          </div>
        </div>

        {/* Status Tracker Stepper */}
        <div className="space-y-4 pt-2">
          <h3 className="text-xs font-bold text-secondary uppercase tracking-wider">
            Sipariş Durumu
          </h3>
          <div className="space-y-4">
            {steps.map((step, idx) => {
              const isPastOrCurrent = currentIndex >= idx;
              const isCurrent = currentIndex === idx;

              return (
                <div key={step.key} className="flex items-start gap-4">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold transition-colors ${
                      isPastOrCurrent
                        ? 'bg-accent text-white shadow-sm'
                        : 'bg-background-alt text-secondary border border-border'
                    }`}
                  >
                    {isPastOrCurrent ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                  </div>
                  <div className="flex-1">
                    <h4
                      className={`text-sm font-bold ${
                        isCurrent ? 'text-accent' : isPastOrCurrent ? 'text-primary' : 'text-secondary/60'
                      }`}
                    >
                      {step.title}
                    </h4>
                    <p className="text-xs text-secondary mt-0.5">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Itemized Receipt */}
      <div className="bg-white rounded-2xl border border-border p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-primary flex items-center gap-2 border-b border-border pb-3">
          <Package className="w-4 h-4 text-accent" />
          Sipariş İçeriği
        </h3>

        <div className="divide-y divide-border/60 text-xs">
          {order.items?.map((item: any) => (
            <div key={item.id} className="py-2.5 flex items-center justify-between">
              <div>
                <span className="font-semibold text-primary">{item.quantity}x {item.product_name}</span>
                {item.notes && <p className="text-[11px] text-secondary mt-0.5">Not: {item.notes}</p>}
              </div>
              <span className="font-bold text-primary">
                {(item.total_price_cents / 100).toFixed(2)} ₺
              </span>
            </div>
          ))}
        </div>

        <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
          <span className="text-secondary">Teslimat Adresi:</span>
          <span className="font-medium text-primary text-right max-w-xs truncate">
            {order.delivery_address || 'Şubeden Gel-Al'}
          </span>
        </div>
      </div>

      {/* Branch Contact Quick Card */}
      <div className="bg-background-alt rounded-2xl border border-border p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-xs font-bold text-primary">Sorularınız için Şubeyi Arayın</h4>
          <p className="text-xs text-secondary mt-0.5">
            Sipariş hazırlık süreci hakkında bilgi almak için şube hattımızla görüşebilirsiniz.
          </p>
        </div>
        <a
          href={`tel:${order.branchPhone || '05446486040'}`}
          className="px-4 py-2.5 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-light transition flex items-center gap-2 shrink-0"
        >
          <Phone className="w-3.5 h-3.5" />
          <span>{order.branchPhone || '0544 648 60 40'}</span>
        </a>
      </div>
    </div>
  );
}
