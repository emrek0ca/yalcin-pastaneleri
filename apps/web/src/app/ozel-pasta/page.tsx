'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useBranch } from '@/context/BranchContext';
import { createCustomCakeRequest } from '@/lib/api';

export default function CustomCakePage() {
  const { selectedBranch, branches } = useBranch();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [servingSize, setServingSize] = useState('10-12 Kişilik');
  const [flavorPreference, setFlavorPreference] = useState('Çikolata & Antep Fıstığı');
  const [cakeMessage, setCakeMessage] = useState('');
  const [notes, setNotes] = useState('');
  const [referenceImageUrl, setReferenceImageUrl] = useState('');
  const [targetBranchId, setTargetBranchId] = useState(selectedBranch.id);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedData, setSubmittedData] = useState<any | null>(null);

  // Min date: 2 days in the future
  const minDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload = {
        branchId: targetBranchId,
        customerName,
        customerPhone,
        customerEmail: customerEmail || undefined,
        deliveryDate,
        servingSize,
        flavorPreference,
        cakeMessage: cakeMessage || undefined,
        notes: notes || undefined,
        referenceImageUrls: referenceImageUrl ? [referenceImageUrl] : [],
      };

      const result = await createCustomCakeRequest(payload);
      setSubmittedData(result);
    } catch (err: any) {
      setError(err.message || 'Talebiniz iletilirken bir hata meydana geldi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Header */}
      <div className="space-y-2 border-b border-border pb-6">
        <p className="text-xs uppercase tracking-wider font-semibold text-accent">
          Butik Pasta Atölyesi
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold text-primary tracking-tight">
          Özel Gün Pastası Talebi
        </h1>
        <p className="text-secondary text-xs sm:text-sm leading-relaxed max-w-xl">
          Doğum günü, nişan, düğün ve kutlamalarınız için detayları belirleyin; şubemiz talebinizi inceleyip size özel fiyat teklifini iletsin.
        </p>
      </div>

      {submittedData ? (
        <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-8 text-center space-y-4">
          <h2 className="text-lg font-bold text-primary">Talebiniz Alındı</h2>
          <p className="text-xs text-secondary max-w-md mx-auto">
            Talep Numaranız: <strong className="font-mono bg-white px-2 py-0.5 rounded border border-border text-primary">{submittedData.request_number || submittedData.requestNumber}</strong>
          </p>
          <p className="text-xs text-secondary max-w-md mx-auto leading-relaxed">
            Pasta ustalarımız talebinizi inceledikten sonra <strong>{submittedData.customer_phone || submittedData.customerPhone}</strong> numaralı telefonunuz üzerinden fiyat ve teslimat detayları ile ilgili sizinle iletişime geçecektir.
          </p>
          <div className="pt-4 flex items-center justify-center gap-3">
            <Link
              href="/"
              className="px-4 py-2 rounded-md bg-primary text-white text-xs font-medium hover:bg-neutral-800 transition"
            >
              Ana Sayfaya Dön
            </Link>
            <button
              onClick={() => setSubmittedData(null)}
              className="px-4 py-2 rounded-md bg-white border border-border text-primary text-xs font-medium hover:bg-neutral-50 transition"
            >
              Yeni Talep Oluştur
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-border p-6 sm:p-8 space-y-8">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-xs text-red-800">
              {error}
            </div>
          )}

          {/* Section 1: Cake Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-primary border-b border-border pb-2 uppercase tracking-wide">
              1. Pasta Özellikleri
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-primary mb-1">
                  Kişi Sayısı / Porsiyon
                </label>
                <select
                  value={servingSize}
                  onChange={(e) => setServingSize(e.target.value)}
                  className="w-full px-3 py-2 bg-background-alt border border-border rounded-md text-xs text-primary focus:outline-none focus:border-neutral-400"
                >
                  <option value="6-8 Kişilik">6 - 8 Kişilik (Küçük Aile)</option>
                  <option value="10-12 Kişilik">10 - 12 Kişilik (Standart)</option>
                  <option value="15-20 Kişilik">15 - 20 Kişilik (Kutlama)</option>
                  <option value="25-30 Kişilik">25 - 30 Kişilik (Büyük Davet)</option>
                  <option value="30+ Kişilik">30+ Kişilik (Nişan / Düğün)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-primary mb-1">
                  İçerik & Lezzet Tercihi
                </label>
                <select
                  value={flavorPreference}
                  onChange={(e) => setFlavorPreference(e.target.value)}
                  className="w-full px-3 py-2 bg-background-alt border border-border rounded-md text-xs text-primary focus:outline-none focus:border-neutral-400"
                >
                  <option value="Çikolata & Antep Fıstığı">Çikolata & Antep Fıstığı</option>
                  <option value="Orman Meyveli & Vanilya">Orman Meyveli & Vanilyalı Krema</option>
                  <option value="Çilek & Çikolata">Taze Çilek & Belçika Çikolatası</option>
                  <option value="Lotus Karamel & Bisküvi">Lotus Karamel & Bisküvi</option>
                  <option value="Muz & Krokan">Muz & Fındıklı Krokan</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-xs font-medium text-primary mb-1">
                  Teslim Tarihi (En az 2 gün önceden)
                </label>
                <input
                  type="date"
                  min={minDate}
                  required
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  className="w-full px-3 py-2 bg-background-alt border border-border rounded-md text-xs text-primary focus:outline-none focus:border-neutral-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-primary mb-1">
                  Teslim Alınacak Şube
                </label>
                <select
                  value={targetBranchId}
                  onChange={(e) => setTargetBranchId(e.target.value)}
                  className="w-full px-3 py-2 bg-background-alt border border-border rounded-md text-xs text-primary focus:outline-none focus:border-neutral-400"
                >
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-primary mb-1">
                Pasta Üzerine Yazılacak Mesaj (Opsiyonel)
              </label>
              <input
                type="text"
                maxLength={60}
                placeholder="Örn: İyi ki doğdun, Mutlu Yıllar..."
                value={cakeMessage}
                onChange={(e) => setCakeMessage(e.target.value)}
                className="w-full px-3 py-2 bg-background-alt border border-border rounded-md text-xs text-primary focus:outline-none focus:border-neutral-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-primary mb-1">
                Özel İstekler veya Tasarım Notları
              </label>
              <textarea
                rows={3}
                placeholder="Pastanın dış kaplaması, figür veya tema isteklerinizi belirtebilirsiniz..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 bg-background-alt border border-border rounded-md text-xs text-primary focus:outline-none focus:border-neutral-400"
              />
            </div>
          </div>

          {/* Section 2: Contact Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-primary border-b border-border pb-2 uppercase tracking-wide">
              2. İletişim Bilgileri
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-primary mb-1">
                  Adınız ve Soyadınız *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ad Soyad"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 bg-background-alt border border-border rounded-md text-xs text-primary focus:outline-none focus:border-neutral-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-primary mb-1">
                  Cep Telefonu * (05XXXXXXXXX)
                </label>
                <input
                  type="tel"
                  required
                  placeholder="05XXXXXXXXX"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-background-alt border border-border rounded-md text-xs text-primary focus:outline-none focus:border-neutral-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-primary mb-1">
                E-posta (Opsiyonel)
              </label>
              <input
                type="email"
                placeholder="ornek@domain.com"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="w-full px-3 py-2 bg-background-alt border border-border rounded-md text-xs text-primary focus:outline-none focus:border-neutral-400"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-6 bg-primary hover:bg-neutral-800 text-white text-xs font-semibold rounded-md transition disabled:opacity-50"
            >
              {loading ? 'Talebiniz İletiliyor...' : 'Özel Pasta Talebini Şubeye İlet'}
            </button>
            <p className="text-[11px] text-secondary text-center mt-2">
              Özel gün pastalarında net fiyat tasarım detaylarına göre hesaplanıp sizinle paylaşılır. Ön onayınız olmadan üretim başlatılmaz.
            </p>
          </div>
        </form>
      )}
    </div>
  );
}
