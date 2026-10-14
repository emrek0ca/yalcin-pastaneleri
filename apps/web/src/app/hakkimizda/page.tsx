import React from 'react';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      {/* Header */}
      <div className="space-y-3 border-b border-border pb-8">
        <p className="text-xs font-semibold tracking-wider uppercase text-accent">
          1997’den Bugüne Osmaniye’de
        </p>
        <h1 className="text-3xl sm:text-5xl font-bold text-primary tracking-tight">
          Pastaneci Emine Abla’nın <br />
          Lezzet Hikayesi
        </h1>
        <p className="text-secondary text-base leading-relaxed max-w-2xl pt-2">
          1997 yılında başlayan tatlı yolculuğumuz, bugün Osmaniye’de ailenizin pastanesi olarak sofralarınıza eşlik etmeye devam ediyor.
        </p>
      </div>

      {/* Story Sections */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
        <div className="md:col-span-7 space-y-4 text-sm sm:text-base text-secondary leading-relaxed">
          <h2 className="text-xl font-bold text-primary tracking-tight">
            Gelenekten Geleceğe, Ödünsüz Kalite
          </h2>
          <p>
            Yalçın Pastaneleri, kurucumuz Emine Yalçın’ın (“Pastaneci Emine Abla”) el emeği ve mutfak sevgisiyle temellerini attığı, samimiyet ve dürüstlük ilkesi üzerine kurulu köklü bir aile işletmesidir.
          </p>
          <p>
            Kurulduğumuz ilk günden bu yana Osmaniye’de taze tatlı, çıtır baklava, günlük yaş pasta ve zengin kahvaltı lezzetlerini hemşerilerimize ulaştırmaktan gurur duyuyoruz.
          </p>
          <p>
            Raufbey ve Adnan Menderes şubelerimizde hem klasik pastane kültürünü hem de dünya mutfağının seçkin yemeklerini misafirlerimize sunuyoruz.
          </p>
        </div>

        <div className="md:col-span-5 rounded-lg overflow-hidden border border-border bg-white shadow-xs">
          <img
            src="/assets/categories/275365032.jpeg"
            alt="Yalçın Pastaneleri Geleneksel Baklava Ustalığı"
            className="w-full h-64 object-cover"
          />
          <div className="p-4 border-t border-border">
            <h4 className="text-xs font-bold text-primary">Geleneksel Ustalık</h4>
            <p className="text-xs text-secondary mt-0.5">
              Hakiki Antep fıstığı, doğal tereyağı ve günlük üretim anlayışı.
            </p>
          </div>
        </div>
      </div>

      {/* Values Grid (Clean editorial style, zero icon clutter) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-8 border-t border-border">
        <div className="space-y-1.5">
          <h3 className="text-sm font-bold text-primary">Taze & Doğal Üretim</h3>
          <p className="text-xs text-secondary leading-relaxed">
            Ürünlerimizde yapay koruyucular yerine daima taze ve kaliteli yerel hammaddeleri tercih ediyoruz.
          </p>
        </div>

        <div className="space-y-1.5">
          <h3 className="text-sm font-bold text-primary">Ailenizin Pastanesi</h3>
          <p className="text-xs text-secondary leading-relaxed">
            Müşterilerimizi misafirimiz olarak görüyor; samimi, güvenilir ve dürüst esnaflık geleneğini sürdürüyoruz.
          </p>
        </div>

        <div className="space-y-1.5">
          <h3 className="text-sm font-bold text-primary">Özel Günlerin Ortağı</h3>
          <p className="text-xs text-secondary leading-relaxed">
            Doğum günlerinden nişan törenlerine, en mutlu anlarınıza butik pastalarımızla eşlik ediyoruz.
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="pt-6 border-t border-border flex items-center justify-between">
        <span className="text-xs text-secondary">Yalçın Pastaneleri lezzetlerini keşfedin.</span>
        <Link
          href="/menu"
          className="px-5 py-2.5 rounded-lg bg-primary hover:bg-neutral-800 text-white text-xs font-medium transition"
        >
          Menüyü İnceleyin
        </Link>
      </div>
    </div>
  );
}
