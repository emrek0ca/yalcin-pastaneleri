'use client';

import React, { useState } from 'react';
import { MapPin, Phone, Instagram, Send, CheckCircle2 } from 'lucide-react';
import { BRAND_INFO, VERIFIED_BRANCHES } from '@yalcin/shared';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-primary">İletişim</h1>
        <p className="text-secondary text-sm leading-relaxed">
          Soru, öneri, toplu sipariş veya özel organizasyon talepleriniz için bize dilediğiniz zaman ulaşabilirsiniz.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Contact Info Col */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl border border-border p-6 sm:p-8 space-y-6 shadow-sm">
            <h2 className="text-lg font-bold text-primary border-b border-border pb-3">
              Şube İletişim Hatlarımız
            </h2>

            {VERIFIED_BRANCHES.map((b) => (
              <div key={b.id} className="space-y-2">
                <h3 className="text-sm font-bold text-primary">{b.name}</h3>
                <div className="flex items-start gap-2.5 text-xs text-secondary">
                  <MapPin className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                  <span>{b.address}</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs">
                  <Phone className="w-4 h-4 text-accent shrink-0" />
                  <a href={`tel:${b.phone}`} className="font-semibold text-primary hover:text-accent transition">
                    {b.phone}
                  </a>
                </div>
              </div>
            ))}

            <div className="pt-4 border-t border-border">
              <h4 className="text-xs font-bold text-secondary uppercase tracking-wider mb-2">
                Sosyal Medya
              </h4>
              <a
                href={BRAND_INFO.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-pink-50 border border-pink-200 text-pink-700 text-xs font-semibold hover:bg-pink-100 transition"
              >
                <Instagram className="w-4 h-4" />
                <span>Instagram: @yalcinpastaneleri</span>
              </a>
            </div>
          </div>
        </div>

        {/* Feedback Form Col */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-border p-6 sm:p-8 shadow-sm">
          <h2 className="text-lg font-bold text-primary border-b border-border pb-3 mb-6">
            Bize Mesaj Gönderin
          </h2>

          {submitted ? (
            <div className="p-8 text-center bg-emerald-50 border border-emerald-200 rounded-xl space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h3 className="text-base font-bold text-emerald-900">Mesajınız Alındı!</h3>
              <p className="text-xs text-emerald-700 max-w-sm mx-auto">
                Geri bildiriminiz için teşekkür ederiz. Müşteri ilişkileri ekibimiz en kısa sürede dönüş sağlayacaktır.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-primary mb-1">
                    Adınız ve Soyadınız *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ad Soyad"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-background-alt border border-border rounded-xl text-xs sm:text-sm text-primary focus:outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-primary mb-1">
                    Telefon Numaranız *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="05XXXXXXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-background-alt border border-border rounded-xl text-xs sm:text-sm text-primary focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-primary mb-1">
                  Mesajınız *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Görüş, öneri veya talebinizi yazabilirsiniz..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-background-alt border border-border rounded-xl text-xs sm:text-sm text-primary focus:outline-none focus:border-accent"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-6 rounded-xl bg-primary hover:bg-primary-light text-white text-xs font-semibold transition flex items-center justify-center gap-2 shadow-sm"
              >
                <Send className="w-4 h-4" />
                <span>Mesajı İlet</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
