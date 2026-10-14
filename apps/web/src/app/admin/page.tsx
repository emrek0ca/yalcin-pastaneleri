'use client';

import React, { useState, useEffect } from 'react';
import { RefreshCw, CheckCircle, Clock, Cake, Package, AlertCircle, Phone, MapPin, DollarSign, ChevronRight } from 'lucide-react';
import { fetchAdminOrders, updateOrderStatus, fetchCustomCakes, quoteCustomCake, fetchAdminStats } from '@/lib/api';
import { VERIFIED_BRANCHES } from '@yalcin/shared';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<'orders' | 'cakes' | 'stats'>('orders');
  const [orders, setOrders] = useState<any[]>([]);
  const [cakes, setCakes] = useState<any[]>([]);
  const [stats, setStats] = useState<any | null>(null);
  const [branchFilter, setBranchFilter] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Quote modal state
  const [activeCakeForQuote, setActiveCakeForQuote] = useState<any | null>(null);
  const [quoteAmountTry, setQuoteAmountTry] = useState<string>('');
  const [quoteNotes, setQuoteNotes] = useState<string>('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [ordersData, cakesData, statsData] = await Promise.all([
        fetchAdminOrders(branchFilter || undefined),
        fetchCustomCakes(),
        fetchAdminStats().catch(() => null),
      ]);
      setOrders(ordersData);
      setCakes(cakesData);
      setStats(statsData);
    } catch (e) {
      console.error('Admin data fetch error', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000); // 10s auto poll
    return () => clearInterval(interval);
  }, [branchFilter]);

  const handleStatusChange = async (orderId: string, nextStatus: string) => {
    setActionLoading(orderId);
    try {
      await updateOrderStatus(orderId, nextStatus);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Durum güncellenemedi');
    } finally {
      setActionLoading(null);
    }
  };

  const handleQuoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCakeForQuote) return;
    const cents = Math.round(parseFloat(quoteAmountTry) * 100);
    if (isNaN(cents) || cents <= 0) {
      alert('Geçerli bir tutar giriniz');
      return;
    }

    try {
      await quoteCustomCake(activeCakeForQuote.id, cents, quoteNotes);
      setActiveCakeForQuote(null);
      setQuoteAmountTry('');
      setQuoteNotes('');
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Teklif sunulamadı');
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; class: string }> = {
      received: { label: 'Yeni Alındı', class: 'bg-blue-50 text-blue-800 border-blue-200' },
      confirmed: { label: 'Onaylandı', class: 'bg-indigo-50 text-indigo-800 border-indigo-200' },
      preparing: { label: 'Hazırlanıyor', class: 'bg-amber-50 text-amber-800 border-amber-200' },
      out_for_delivery: { label: 'Yolda (Kurye)', class: 'bg-purple-50 text-purple-800 border-purple-200' },
      ready_for_pickup: { label: 'Hazır (Gel-Al)', class: 'bg-purple-50 text-purple-800 border-purple-200' },
      completed: { label: 'Tamamlandı', class: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
      cancelled: { label: 'İptal', class: 'bg-red-50 text-red-800 border-red-200' },
    };
    const c = config[status] || { label: status, class: 'bg-neutral-100 text-neutral-800 border-border' };
    return (
      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${c.class}`}>
        {c.label}
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-accent">Yalçın Pastaneleri Operasyon</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-primary mt-0.5">Yönetici Paneli</h1>
          <p className="text-secondary text-xs sm:text-sm mt-1">
            Şube siparişleri, özel gün pastası teklifleri ve operasyonel canlı akış.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-background-alt border border-border text-xs font-semibold text-primary hover:bg-neutral-100 flex items-center gap-1.5 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Yenile</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-border space-y-1 shadow-sm">
            <div className="text-xs font-semibold text-secondary">Toplam Sipariş</div>
            <div className="text-2xl font-extrabold text-primary">{stats.totalOrders}</div>
          </div>
          <div className="p-5 rounded-2xl bg-white border border-border space-y-1 shadow-sm">
            <div className="text-xs font-semibold text-secondary">Bekleyen Sipariş</div>
            <div className="text-2xl font-extrabold text-accent">{stats.pendingOrders}</div>
          </div>
          <div className="p-5 rounded-2xl bg-white border border-border space-y-1 shadow-sm">
            <div className="text-xs font-semibold text-secondary">Özel Pasta Talepleri</div>
            <div className="text-2xl font-extrabold text-primary">{stats.pendingCakeRequests}</div>
          </div>
          <div className="p-5 rounded-2xl bg-white border border-border space-y-1 shadow-sm">
            <div className="text-xs font-semibold text-secondary">Toplam Ciro</div>
            <div className="text-2xl font-extrabold text-emerald-700">
              {(stats.totalRevenueCents / 100).toLocaleString('tr-TR', { maximumFractionDigits: 0 })} ₺
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-border">
        <button
          onClick={() => setActiveTab('orders')}
          className={`py-3 px-4 text-xs font-bold border-b-2 transition ${
            activeTab === 'orders'
              ? 'border-accent text-accent'
              : 'border-transparent text-secondary hover:text-primary'
          }`}
        >
          Canlı Siparişler ({orders.length})
        </button>

        <button
          onClick={() => setActiveTab('cakes')}
          className={`py-3 px-4 text-xs font-bold border-b-2 transition ${
            activeTab === 'cakes'
              ? 'border-accent text-accent'
              : 'border-transparent text-secondary hover:text-primary'
          }`}
        >
          Özel Gün Pastası Talepleri ({cakes.length})
        </button>
      </div>

      {/* TAB 1: ORDERS */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          {/* Branch filter */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-secondary">Şube Filtresi:</span>
            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              className="px-3 py-1.5 bg-background-alt border border-border rounded-xl text-xs text-primary font-medium"
            >
              <option value="">Tüm Şubeler</option>
              {VERIFIED_BRANCHES.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {orders.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-border space-y-2">
              <Package className="w-8 h-8 text-neutral-300 mx-auto" />
              <h3 className="text-sm font-bold text-primary">Henüz Sipariş Yok</h3>
              <p className="text-xs text-secondary">Müşterilerden gelen siparişler burada anlık olarak listelenecektir.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {orders.map((o) => (
                <div
                  key={o.id}
                  className="bg-white rounded-2xl border border-border p-5 space-y-4 shadow-sm hover:border-neutral-400 transition"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-primary">#{o.order_number}</span>
                        {getStatusBadge(o.status)}
                      </div>
                      <div className="text-xs text-secondary mt-1">
                        {new Date(o.created_at).toLocaleString('tr-TR', { timeZone: 'Europe/Istanbul' })}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-base font-extrabold text-primary">
                        {(o.total_cents / 100).toFixed(2)} ₺
                      </div>
                      <div className="text-[10px] text-secondary uppercase font-semibold">
                        {o.order_type === 'delivery' ? 'Paket Servis' : 'Gel-Al'}
                      </div>
                    </div>
                  </div>

                  {/* Customer details */}
                  <div className="bg-background-alt p-3 rounded-xl border border-border text-xs space-y-1">
                    <div className="font-semibold text-primary">{o.customer_name}</div>
                    <div className="flex items-center gap-1.5 text-secondary">
                      <Phone className="w-3.5 h-3.5 text-accent" />
                      <a href={`tel:${o.customer_phone}`} className="hover:underline font-mono">
                        {o.customer_phone}
                      </a>
                    </div>
                    {o.delivery_address && (
                      <div className="flex items-start gap-1.5 text-secondary pt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-accent shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{o.delivery_address}</span>
                      </div>
                    )}
                  </div>

                  {/* Action buttons based on state machine */}
                  <div className="pt-2 border-t border-border flex flex-wrap gap-2">
                    {o.status === 'received' && (
                      <button
                        onClick={() => handleStatusChange(o.id, 'confirmed')}
                        disabled={actionLoading === o.id}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition"
                      >
                        Siparişi Onayla
                      </button>
                    )}

                    {o.status === 'confirmed' && (
                      <button
                        onClick={() => handleStatusChange(o.id, 'preparing')}
                        disabled={actionLoading === o.id}
                        className="px-3 py-1.5 rounded-lg bg-amber-600 text-white text-xs font-semibold hover:bg-amber-700 transition"
                      >
                        Hazırlanıyor Yap
                      </button>
                    )}

                    {o.status === 'preparing' && (
                      <button
                        onClick={() =>
                          handleStatusChange(o.id, o.order_type === 'pickup' ? 'ready_for_pickup' : 'out_for_delivery')
                        }
                        disabled={actionLoading === o.id}
                        className="px-3 py-1.5 rounded-lg bg-purple-600 text-white text-xs font-semibold hover:bg-purple-700 transition"
                      >
                        {o.order_type === 'pickup' ? 'Teslimata Hazırla' : 'Kuryeye Ver (Yola Çıktı)'}
                      </button>
                    )}

                    {(o.status === 'out_for_delivery' || o.status === 'ready_for_pickup') && (
                      <button
                        onClick={() => handleStatusChange(o.id, 'completed')}
                        disabled={actionLoading === o.id}
                        className="px-3 py-1.5 rounded-lg bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-800 transition"
                      >
                        Tamamlandı (Teslim Edildi)
                      </button>
                    )}

                    {o.status !== 'completed' && o.status !== 'cancelled' && (
                      <button
                        onClick={() => {
                          if (confirm('Bu siparişi iptal etmek istediğinize emin misiniz?')) {
                            handleStatusChange(o.id, 'cancelled');
                          }
                        }}
                        disabled={actionLoading === o.id}
                        className="px-3 py-1.5 rounded-lg border border-red-200 text-red-600 text-xs font-semibold hover:bg-red-50 transition"
                      >
                        İptal Et
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: CUSTOM CAKES */}
      {activeTab === 'cakes' && (
        <div className="space-y-6">
          {cakes.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-border space-y-2">
              <Cake className="w-8 h-8 text-neutral-300 mx-auto" />
              <h3 className="text-sm font-bold text-primary">Özel Pasta Talebi Bulunmuyor</h3>
              <p className="text-xs text-secondary">Gelen pasta teklif istekleri burada görüntülenecektir.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {cakes.map((c) => (
                <div
                  key={c.id}
                  className="bg-white rounded-2xl border border-border p-5 space-y-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="text-xs font-mono font-bold text-accent">#{c.request_number}</span>
                      <h3 className="text-sm font-bold text-primary mt-0.5">{c.customer_name}</h3>
                      <div className="text-xs text-secondary">{c.customer_phone}</div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-neutral-100 text-neutral-800">
                      {c.status}
                    </span>
                  </div>

                  <div className="bg-background-alt p-3 rounded-xl border border-border text-xs space-y-1.5 text-secondary">
                    <div><strong className="text-primary">Teslim Tarihi:</strong> {c.delivery_date}</div>
                    <div><strong className="text-primary">Porsiyon:</strong> {c.serving_size}</div>
                    <div><strong className="text-primary">Lezzet Tercihi:</strong> {c.flavor_preference}</div>
                    {c.cake_message && <div><strong className="text-primary">Yazı:</strong> "{c.cake_message}"</div>}
                    {c.notes && <div><strong className="text-primary">Notlar:</strong> {c.notes}</div>}
                  </div>

                  {c.quote_cents ? (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900">
                      <strong>Verilen Teklif:</strong> {(c.quote_cents / 100).toFixed(2)} ₺ <br />
                      <span className="text-[11px] text-emerald-700">{c.quote_notes}</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => setActiveCakeForQuote(c)}
                      className="w-full py-2.5 px-4 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-semibold transition"
                    >
                      Fiyat Teklifi Ver
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Quote Modal */}
      {activeCakeForQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-border space-y-4">
            <h3 className="text-base font-bold text-primary">
              Özel Pasta Teklifi Sun: #{activeCakeForQuote.request_number}
            </h3>

            <form onSubmit={handleQuoteSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-primary mb-1">
                  Teklif Tutarı (TL) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="Örn: 850"
                  value={quoteAmountTry}
                  onChange={(e) => setQuoteAmountTry(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-background-alt border border-border rounded-xl text-xs text-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-primary mb-1">
                  Usta Açıklaması / Detaylar *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="İçerik, kaplama ve teslimat saatine dair usta notu..."
                  value={quoteNotes}
                  onChange={(e) => setQuoteNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-background-alt border border-border rounded-xl text-xs text-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveCakeForQuote(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-secondary hover:text-primary"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-semibold"
                >
                  Teklifi Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
