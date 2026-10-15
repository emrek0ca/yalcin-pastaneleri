import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { VERIFIED_BRANCHES } from '@yalcin/shared';
import { getAssetUrl } from '@/lib/assets';

export default function HomePage() {
  const featuredCategories = [
    {
      name: 'Şerbetli Tatlılar',
      slug: 'serbetli-tatlilar',
      desc: 'Fıstıklı baklava, şöbiyet, katmer ve geleneksel lezzetler.',
      image: getAssetUrl('/assets/categories/275365032.jpeg'),
    },
    {
      name: 'Adet Pastalar',
      slug: 'adet-pastalar',
      desc: 'Orman meyveli, pavlova, San Sebastian ve cheesecake çeşitleri.',
      image: getAssetUrl('/assets/categories/895267197.jpeg'),
    },
    {
      name: 'Sütlü Tatlılar',
      slug: 'sutlu-tatlilar',
      desc: 'Profiterol, kazandibi, fıstıklı ve meyveli kup tatlılar.',
      image: getAssetUrl('/assets/categories/110181517.jpeg'),
    },
    {
      name: 'Çikolata & Atölye',
      slug: 'cikolata-cesitleri',
      desc: 'Özel yapım Dubai çikolatası ve el yapımı spesiyaller.',
      image: getAssetUrl('/assets/categories/254860235.jpeg'),
    },
    {
      name: 'Kahvaltı & Fırın',
      slug: 'kahvaltilar',
      desc: 'Serpme kahvaltı, sıcak sıkmalar ve çıtır börekler.',
      image: getAssetUrl('/assets/categories/2067783193.jpeg'),
    },
    {
      name: 'Restoran & Mutfak',
      slug: 'pizza',
      desc: 'Adnan Menderes şubemizde pizza, burger ve dünya mutfağı.',
      image: getAssetUrl('/assets/categories/1008122358.jpeg'),
    },
  ];

  const signatureProducts = [
    {
      name: 'Fıstıklı Baklava',
      category: 'Şerbetli Tatlılar',
      price: '250 ₺',
      desc: 'Hakiki Antep fıstığı ve çıtır yufkasıyla 4 dilim porsiyon.',
      image: getAssetUrl('/assets/products/1438944075.jpeg'),
    },
    {
      name: 'Orman Meyveli Pasta',
      category: 'Adet Pastalar',
      price: '280 ₺',
      desc: 'Taze mevsim orman meyveleri ve hafif pastacı kreması.',
      image: getAssetUrl('/assets/products/523353097.jpeg'),
    },
    {
      name: 'Dubai Çikolatası',
      category: 'Çikolata Çeşitleri',
      price: '350 ₺',
      desc: 'Kavrulmuş kadayıf ve Antep fıstığı ezmesi dolgulu.',
      image: getAssetUrl('/assets/products/2070389173.jpeg'),
    },
    {
      name: 'Lotus Cheesecake',
      category: 'Adet Pastalar',
      price: '320 ₺',
      desc: 'Orijinal bisküvi tabanı ve karamelli Lotus kreması.',
      image: getAssetUrl('/assets/products/629237750.jpeg'),
    },
  ];

  return (
    <div className="space-y-24 pb-24">
      {/* 1. Hero Section: Ferah, relax ve zengin sinematik video deneyimi */}
      <section className="relative overflow-hidden bg-black lg:bg-background-alt lg:border-b lg:border-border">
        {/* Mobile Full-Screen Video Background (Video nefes alıyor, yüzler ve detaylar net açık) */}
        <div className="absolute inset-0 lg:hidden pointer-events-none">
          <video
            src={getAssetUrl('/assets/videos/emine-abla-uretim.mp4')}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="w-full h-full object-cover"
          />
          {/* Yalnızca en altta yumuşak, hafif karartma */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Mobile view: Sade, rahat, ferah alt panel; Desktop view: Geniş 2 kolon */}
          <div className="relative min-h-[82vh] sm:min-h-[86vh] lg:min-h-[580px] flex flex-col justify-end pb-8 sm:pb-12 lg:pb-0 lg:grid lg:grid-cols-12 lg:gap-14 lg:items-center lg:py-16 xl:py-20">
            
            {/* Left Column (Brand Narrative & Actions) */}
            <div className="z-10 text-white lg:text-primary lg:col-span-7 space-y-3 sm:space-y-4 lg:space-y-6 text-left">
              <p className="text-[11px] sm:text-xs font-semibold tracking-widest uppercase text-white/80 lg:text-accent">
                1997’den beri Pastaneci Emine Abla
              </p>

              <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold tracking-tight leading-[1.1] text-white lg:text-primary">
                Osmaniye’nin <br />
                <span className="text-amber-100 lg:text-accent">Ailenizin Pastanesi.</span>
              </h1>

              {/* Desktop paragraph (Mobilde video ferah kalsın diye gizlenip hemen aşağıya taşındı) */}
              <p className="hidden lg:block text-secondary text-base lg:text-lg max-w-xl leading-relaxed">
                Çeyrek asrı aşkın ustalıkla hazırlanan geleneksel baklavalar, taptaze günlük pastalar, özel tasarım kutlama pastaları ve dünya mutfağından seçkin lezzetler.
              </p>

              {/* Action Buttons: Sade, zarif, hafif */}
              <div className="flex items-center gap-3 pt-2">
                <Link
                  href="/menu"
                  className="px-5 sm:px-6 py-3 rounded-lg bg-white lg:bg-primary text-primary lg:text-white font-semibold text-xs sm:text-sm tracking-wide transition shadow-sm hover:opacity-90"
                >
                  Menüyü İncele
                </Link>

                <Link
                  href="/ozel-pasta"
                  className="px-5 sm:px-6 py-3 rounded-lg bg-white/15 lg:bg-white border border-white/30 lg:border-border text-white lg:text-primary backdrop-blur-md hover:bg-white/25 lg:hover:border-neutral-400 font-semibold text-xs sm:text-sm tracking-wide transition shadow-sm"
                >
                  Özel Gün Pastası
                </Link>
              </div>

              {/* Desktop Statistics (Mobilde video üstü kalabalığı engellemek için desktop'ta durur) */}
              <div className="hidden lg:flex pt-6 items-center gap-8 text-xs text-secondary border-t border-border/80">
                <div>
                  <span className="font-bold text-primary text-base">1997</span> Kuruluş Yılı
                </div>
                <div className="text-border">•</div>
                <div>
                  <span className="font-bold text-primary text-base">2 Şube</span> Raufbey & Adnan Menderes
                </div>
                <div className="text-border">•</div>
                <div>
                  <span className="font-bold text-primary text-base">170+ Çeşit</span> Menü & Üretim
                </div>
              </div>
            </div>

            {/* Right Column (Masaüstünde şık çerçevesiz video) */}
            <div className="hidden lg:block lg:col-span-5">
              <div className="w-full h-[500px] xl:h-[540px] rounded-2xl overflow-hidden bg-black shadow-lg">
                <video
                  src={getAssetUrl('/assets/videos/emine-abla-uretim.mp4')}
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="auto"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Hero Altı Ferah Bilgi & Hikaye Şeridi (Gözü yormayan geniş boşluklar) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-2xl bg-background-alt border border-border/80 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-3">
            <span className="text-xs font-semibold tracking-wider uppercase text-accent">Gelenekten Geleceğe</span>
            <h2 className="text-xl sm:text-2xl font-bold text-primary tracking-tight">
              Her Sabah Fırından Çıkan Taze Ustalık
            </h2>
            <p className="text-xs sm:text-sm text-secondary leading-relaxed max-w-xl">
              Yalçın Pastaneleri, kurucumuz Emine Yalçın’ın el emeği ve mutfak sevgisiyle temellerini attığı, samimiyet ve dürüstlük ilkesi üzerine kurulu bir aile işletmesidir. Hakiki yerel malzemeler ve çeyrek asırlık tariflerle Osmaniye sofralarındayız.
            </p>
          </div>

          <div className="lg:col-span-5 grid grid-cols-3 gap-4 border-t lg:border-t-0 lg:border-l border-border pt-6 lg:pt-0 lg:pl-8">
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight">1997</div>
              <div className="text-[11px] text-secondary mt-1">Kuruluş Yılı</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight">2 Şube</div>
              <div className="text-[11px] text-secondary mt-1">Raufbey & Adnan</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight">170+</div>
              <div className="text-[11px] text-secondary mt-1">Taze Çeşit</div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 pb-4 border-b border-border">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight">Kategoriler</h2>
            <p className="text-secondary text-xs sm:text-sm mt-1">
              Baklavalardan butik pastalara, kahvaltılardan dünya mutfağına.
            </p>
          </div>
          <Link
            href="/menu"
            className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:text-accent-hover transition mt-2 sm:mt-0"
          >
            <span>Tümünü Gör</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredCategories.map((cat) => (
            <Link
              key={cat.name}
              href={`/menu?category=${cat.slug}`}
              className="group rounded-lg border border-border overflow-hidden bg-white hover:border-neutral-400 transition duration-200 flex flex-col"
            >
              <div className="h-48 w-full bg-background-alt overflow-hidden">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300 ease-out"
                />
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-primary group-hover:text-accent transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-secondary mt-1.5 leading-relaxed">
                    {cat.desc}
                  </p>
                </div>
                <div className="mt-4 flex items-center text-xs font-medium text-accent gap-1">
                  <span>İncele</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Signature Products Showcase */}
      <section className="bg-background-alt py-16 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-3 border-b border-border">
            <div>
              <p className="text-xs font-semibold tracking-wider uppercase text-accent">İmza Lezzetler</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-primary mt-1 tracking-tight">Öne Çıkan Ürünler</h2>
            </div>
            <Link
              href="/menu"
              className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:text-accent-hover transition mt-2 sm:mt-0"
            >
              <span>Tüm Menü (170+ Ürün)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {signatureProducts.map((p) => (
              <div
                key={p.name}
                className="bg-white rounded-lg border border-border overflow-hidden flex flex-col"
              >
                <div className="aspect-[4/3] w-full bg-neutral-100 overflow-hidden relative">
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 right-2 bg-white px-2 py-0.5 rounded text-xs font-bold text-primary border border-border shadow-xs">
                    {p.price}
                  </div>
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-medium text-secondary uppercase tracking-wider">
                      {p.category}
                    </span>
                    <h3 className="text-sm font-bold text-primary mt-0.5">{p.name}</h3>
                    <p className="text-xs text-secondary mt-1 leading-relaxed">{p.desc}</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                    <span className="text-[11px] text-secondary">Günlük Taze</span>
                    <Link
                      href="/menu"
                      className="text-xs font-semibold text-accent hover:underline"
                    >
                      Sipariş Ver
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Custom Cake Feature Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-primary text-white rounded-xl p-8 sm:p-12 border border-neutral-800 shadow-md">
          <div className="max-w-2xl space-y-4">
            <p className="text-xs uppercase tracking-widest text-accent font-semibold">
              Butik & Özel Kutlama Pastaları
            </p>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight">
              Hayalinizdeki Pastayı Birlikte Tasarlayalım
            </h2>
            <p className="text-neutral-300 text-sm sm:text-base leading-relaxed">
              Doğum günleri, nişan, düğün ve tüm kutlamalarınız için dilediğiniz porsiyon, lezzet ve görsel referansla özel sipariş oluşturun. Pastacı ustalarımız talebinizi inceleyip size özel teklifi sunsun.
            </p>
            <div className="pt-2">
              <Link
                href="/ozel-pasta"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-accent hover:bg-accent-hover text-white text-sm font-medium transition"
              >
                <span>Özel Pasta Talebi Oluştur</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Two Branches Quick Overview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 pb-3 border-b border-border">
          <h2 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight">Şubelerimiz</h2>
          <p className="text-secondary text-xs sm:text-sm mt-1">
            Osmaniye’de iki noktada hizmetinizdeyiz.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {VERIFIED_BRANCHES.map((b) => (
            <div
              key={b.id}
              className="bg-white rounded-lg border border-border p-6 space-y-4"
            >
              <div>
                <h3 className="text-lg font-bold text-primary">{b.name}</h3>
                <p className="text-xs text-secondary mt-1">{b.address}</p>
              </div>

              <div className="text-xs text-secondary leading-relaxed border-t border-border pt-3">
                <span className="font-medium text-primary">Hizmetler: </span>
                {b.features.join(' • ')}
              </div>

              <div className="pt-2 border-t border-border flex items-center justify-between text-xs">
                <span className="text-secondary">Çalışma: {b.openingHours}</span>
                <a
                  href={`tel:${b.phone}`}
                  className="font-semibold text-accent hover:underline"
                >
                  {b.phone}
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
