import React from 'react';
import Link from 'next/link';
import { MapPin, Phone, Instagram, Clock, ShieldCheck, Heart } from 'lucide-react';
import { BRAND_INFO, VERIFIED_BRANCHES } from '@yalcin/shared';
import { getAssetUrl } from '@/lib/assets';

export function Footer() {
  return (
    <footer className="bg-primary text-white border-t border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand Col */}
          <div className="space-y-4">
            <img
              src={getAssetUrl('/assets/brand/logo.png')}
              alt="Yalçın Pastaneleri"
              className="h-12 w-auto brightness-0 invert"
            />
            <p className="text-neutral-400 text-sm leading-relaxed">
              1997’den beri Pastaneci Emine Abla’nın geleneksel ustalığı ve sevgiyle hazırlanan lezzetleriyle, Yalçın Ailenizin Pastanesi olarak Osmaniye’de hizmetinizdeyiz.
            </p>
            <div className="flex items-center gap-2 text-xs text-neutral-300">
              <ShieldCheck className="w-4 h-4 text-accent" />
              <span>Doğrulanmış Resmî İşletme Kaydı</span>
            </div>
          </div>

          {/* Branch 1: Raufbey */}
          <div className="space-y-3">
            <h4 className="text-base font-semibold text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-accent" />
              Raufbey Şubesi (Merkez)
            </h4>
            <p className="text-neutral-400 text-xs leading-relaxed">
              {VERIFIED_BRANCHES[0].address}
            </p>
            <div className="text-neutral-300 text-xs flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-accent" />
              <a href={`tel:${VERIFIED_BRANCHES[0].phone}`} className="hover:text-white transition">
                {VERIFIED_BRANCHES[0].phone}
              </a>
            </div>
            <div className="text-neutral-400 text-xs flex items-center gap-2">
              <Clock className="w-3.5 h-3.5" />
              <span>{VERIFIED_BRANCHES[0].openingHours}</span>
            </div>
          </div>

          {/* Branch 2: Adnan Menderes */}
          <div className="space-y-3">
            <h4 className="text-base font-semibold text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-accent" />
              Adnan Menderes Şubesi
            </h4>
            <p className="text-neutral-400 text-xs leading-relaxed">
              {VERIFIED_BRANCHES[1].address}
            </p>
            <div className="text-neutral-300 text-xs flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-accent" />
              <a href={`tel:${VERIFIED_BRANCHES[1].phone}`} className="hover:text-white transition">
                {VERIFIED_BRANCHES[1].phone}
              </a>
            </div>
            <div className="text-neutral-400 text-xs flex items-center gap-2">
              <Clock className="w-3.5 h-3.5" />
              <span>{VERIFIED_BRANCHES[1].openingHours}</span>
            </div>
          </div>

          {/* Quick Links & Social */}
          <div className="space-y-4">
            <h4 className="text-base font-semibold text-white">Hızlı Bağlantılar</h4>
            <ul className="space-y-2 text-xs text-neutral-400">
              <li>
                <Link href="/menu" className="hover:text-white transition">Güncel QR Menü</Link>
              </li>
              <li>
                <Link href="/ozel-pasta" className="hover:text-white transition">Özel Gün Pastası Talebi</Link>
              </li>
              <li>
                <Link href="/subeler" className="hover:text-white transition">Şube Bilgileri & Yol Tarifi</Link>
              </li>
              <li>
                <Link href="/hakkimizda" className="hover:text-white transition">Hakkımızda & Emine Abla</Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-white transition">Yönetici Paneli (Personel)</Link>
              </li>
            </ul>

            <div className="pt-2">
              <a
                href={BRAND_INFO.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs text-white transition"
              >
                <Instagram className="w-4 h-4 text-pink-400" />
                <span>@yalcinpastaneleri</span>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-neutral-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <div>
            © {new Date().getFullYear()} Yalçın Pastaneleri. Tüm hakları saklıdır.
          </div>
          <div className="flex items-center gap-4">
            <span>Osmaniye Merkez</span>
            <span>•</span>
            <span>Tüm fiyatlar Türk Lirası (₺) cinsindendir</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
