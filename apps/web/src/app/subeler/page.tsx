import React from 'react';
import { MapPin, Phone, Clock, Navigation, CheckCircle2, ShieldCheck } from 'lucide-react';
import { VERIFIED_BRANCHES } from '@yalcin/shared';

export default function BranchesPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-light text-accent text-xs font-semibold">
          <ShieldCheck className="w-4 h-4" />
          <span>Doğrulanmış İşletme Lokasyonları</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-primary">Şubelerimiz</h1>
        <p className="text-secondary text-sm leading-relaxed">
          Osmaniye’de iki ayrı noktada, değişmeyen Yalçın Pastaneleri kalitesi ve güler yüzlü hizmetiyle sizleri ağırlıyoruz.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {VERIFIED_BRANCHES.map((b) => (
          <div
            key={b.id}
            className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-md transition duration-300 flex flex-col justify-between"
          >
            <div className="p-8 space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-primary">{b.name}</h2>
                  <p className="text-xs text-secondary mt-1">{b.district}, {b.city}</p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Açık & Hizmette
                </span>
              </div>

              <div className="space-y-3 text-xs sm:text-sm">
                <div className="flex items-start gap-3 text-secondary">
                  <MapPin className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                  <span className="text-primary font-medium">{b.address}</span>
                </div>

                <div className="flex items-center gap-3 text-secondary">
                  <Phone className="w-5 h-5 text-accent shrink-0" />
                  <a href={`tel:${b.phone}`} className="text-primary font-semibold hover:text-accent transition">
                    {b.phone}
                  </a>
                </div>

                <div className="flex items-center gap-3 text-secondary">
                  <Clock className="w-5 h-5 text-accent shrink-0" />
                  <span>Çalışma Saatleri: <strong className="text-primary">{b.openingHours}</strong> (Sipariş: {b.orderHours})</span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-secondary uppercase tracking-wider mb-2">
                  Şube Özellikleri
                </h4>
                <div className="flex flex-wrap gap-2">
                  {b.features.map((f) => (
                    <span
                      key={f}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-background-alt border border-border text-xs text-primary font-medium"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-accent" />
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 bg-background-alt border-t border-border flex items-center justify-between">
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(b.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-light text-white text-xs font-semibold transition flex items-center gap-2"
              >
                <Navigation className="w-4 h-4" />
                <span>Haritada Gör & Yol Tarifi</span>
              </a>

              <a
                href={`tel:${b.phone}`}
                className="text-xs font-semibold text-accent hover:underline flex items-center gap-1"
              >
                <Phone className="w-4 h-4" />
                <span>Hemen Ara</span>
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
