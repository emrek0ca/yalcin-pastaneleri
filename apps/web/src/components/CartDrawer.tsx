'use client';

import React from 'react';
import Link from 'next/link';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, AlertCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useBranch } from '../context/BranchContext';

export function CartDrawer() {
  const { items, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, subtotalCents, subtotalFormatted } = useCart();
  const { selectedBranch } = useBranch();

  if (!isCartOpen) return null;

  const isMinMet = subtotalCents >= selectedBranch.minimumOrderCents;
  const remainingForMinCents = Math.max(0, selectedBranch.minimumOrderCents - subtotalCents);
  const remainingFormatted = (remainingForMinCents / 100).toFixed(2) + ' ₺';

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-border">
          {/* Header */}
          <div className="px-6 py-5 border-b border-border flex items-center justify-between bg-background-alt">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-accent" />
              <h2 className="text-lg font-semibold text-primary">Sipariş Sepetiniz</h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 rounded-lg text-secondary hover:text-primary hover:bg-neutral-200 transition"
              aria-label="Kapat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Branch notification badge */}
          <div className="px-6 py-2.5 bg-neutral-100 border-b border-border text-xs text-secondary flex items-center justify-between">
            <span>Sipariş Şubesi: <strong className="text-primary">{selectedBranch.name}</strong></span>
          </div>

          {/* Items list */}
          <div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-border/60">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 rounded-full bg-background-alt flex items-center justify-center text-secondary mb-4">
                  <ShoppingBag className="w-8 h-8 opacity-40" />
                </div>
                <h3 className="text-base font-semibold text-primary mb-1">Sepetiniz Boş</h3>
                <p className="text-sm text-secondary max-w-xs mb-6">
                  Taptaze pastalar, tatlılar ve lezzetli menümüzden ürün seçin.
                </p>
                <Link
                  href="/menu"
                  onClick={() => setIsCartOpen(false)}
                  className="px-5 py-2.5 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary-light transition"
                >
                  Menüyü İncele
                </Link>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.productId} className="py-4 flex gap-4 items-center">
                  <div className="w-16 h-16 rounded-lg bg-neutral-100 overflow-hidden relative shrink-0 border border-border">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-secondary text-[10px]">
                        Görsel
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-primary truncate">{item.name}</h4>
                    <div className="text-xs text-secondary mt-0.5">
                      {(item.unitPriceCents / 100).toFixed(2)} ₺ / adet
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center border border-border rounded-lg bg-background-alt">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="p-1 hover:text-accent transition"
                          aria-label="Azalt"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-2.5 text-xs font-medium text-primary">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="p-1 hover:text-accent transition"
                          aria-label="Artır"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.productId)}
                        className="text-secondary hover:text-red-600 transition p-1"
                        title="Ürünü Çıkar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="text-right font-semibold text-sm text-primary shrink-0">
                    {(item.totalPriceCents / 100).toFixed(2)} ₺
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="px-6 py-5 border-t border-border bg-background-alt space-y-4">
              {!isMinMet && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <span>
                    Paket servis için minimum sepet tutarı <strong>{(selectedBranch.minimumOrderCents / 100).toFixed(2)} ₺</strong>dir. Sepete <strong>{remainingFormatted}</strong> daha ürün eklemelisiniz.
                  </span>
                </div>
              )}

              <div className="flex justify-between items-baseline text-sm">
                <span className="text-secondary">Ara Toplam</span>
                <span className="text-xl font-bold text-primary">{subtotalFormatted}</span>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href="/sepet"
                  onClick={() => setIsCartOpen(false)}
                  className="w-full py-3.5 px-4 bg-accent hover:bg-accent-hover text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2 shadow-sm transition"
                >
                  Siparişi Onayla & Ödeme
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
