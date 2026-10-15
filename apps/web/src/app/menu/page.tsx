'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Search, X, Check, Plus } from 'lucide-react';
import { ProductCard } from '@/components/ProductCard';
import { useBranch } from '@/context/BranchContext';
import { useCart } from '@/context/CartContext';
import { Product } from '@yalcin/shared';
import catalogData from '../../../../../assets/catalog.json';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { getAssetUrl } from '@/lib/assets';

export default function MenuPage() {
  const { selectedBranch, setSelectedBranchId, branches } = useBranch();
  const { addToCart } = useCart();

  const [categories, setCategories] = useState<any[]>(catalogData.categories || []);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeModalProduct, setActiveModalProduct] = useState<Product | null>(null);
  const [modalAdded, setModalAdded] = useState(false);
  const [liveProducts, setLiveProducts] = useState<Product[] | null>(null);

  // Initial bundle normalized items as immediate fallback
  const initialProducts: Product[] = useMemo(() => {
    const list: Product[] = [];
    catalogData.categories.forEach((cat: any, catIdx: number) => {
      const isAdnanSpecific = cat.name.toUpperCase().includes('ADNAN MENDERES');
      cat.items.forEach((item: any, itemIdx: number) => {
        list.push({
          id: `prod-${catIdx + 1}-${itemIdx + 1}`,
          categoryId: `cat-${catIdx + 1}`,
          name: item.title,
          slug: item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          description: item.description || null,
          rawImageUrl: item.raw_image_url || null,
          localAsset: item.local_asset ? getAssetUrl(item.local_asset) : null,
          basePriceCents: item.price_cents,
          isAvailable: true,
          isDeliveryAvailable: true,
          status: 'verified',
          sourceUrl: 'https://qrmenu.yalcinpastaneleri.com/',
          unit: 'adet',
          ...( { isAdnanOnly: isAdnanSpecific } as any)
        });
      });
    });
    return list;
  }, []);

  // Fetch real-time products from Cloud Firestore
  useEffect(() => {
    let isMounted = true;
    async function loadFirestoreData() {
      try {
        const prodSnap = await getDocs(collection(db, 'products'));
        if (!prodSnap.empty && isMounted) {
          const fetched: Product[] = [];
          prodSnap.forEach((doc) => {
            const data = doc.data() as any;
            fetched.push({
              id: data.id || doc.id,
              categoryId: data.categoryId,
              name: data.name,
              slug: data.slug,
              description: data.description || null,
              rawImageUrl: data.rawImageUrl || null,
              localAsset: data.localAsset ? getAssetUrl(data.localAsset) : null,
              basePriceCents: Number(data.basePriceCents),
              isAvailable: data.isAvailable ?? true,
              isDeliveryAvailable: data.isDeliveryAvailable ?? true,
              status: data.status || 'verified',
              sourceUrl: data.sourceUrl || 'https://qrmenu.yalcinpastaneleri.com/',
              unit: data.unit || 'adet',
              ...( { isAdnanOnly: data.isAdnanOnly } as any)
            });
          });
          setLiveProducts(fetched);
        }
      } catch (err) {
        // Quietly falls back to bundle
      }
    }
    loadFirestoreData();
    return () => { isMounted = false; };
  }, []);

  const allProducts = liveProducts || initialProducts;

  // Filter products by branch, category and search
  const filteredProducts = useMemo(() => {
    return allProducts.filter((p: any) => {
      // 1. Branch filter: if selectedBranch is 'raufbey', exclude Adnan Menderes hot kitchen items
      if (selectedBranch.id === 'raufbey' && p.isAdnanOnly) {
        return false;
      }

      // 2. Category filter
      if (selectedCategory !== 'all') {
        const catObj = categories.find((c) => c.name === selectedCategory);
        if (catObj && !catObj.items.some((it: any) => it.title === p.name)) {
          return false;
        }
      }

      // 3. Search filter
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesDesc = (p.description || '').toLowerCase().includes(q);
        if (!matchesName && !matchesDesc) return false;
      }

      return true;
    });
  }, [allProducts, selectedBranch.id, selectedCategory, searchQuery, categories]);

  const handleModalAdd = () => {
    if (!activeModalProduct) return;
    addToCart({
      productId: activeModalProduct.id,
      name: activeModalProduct.name,
      unitPriceCents: activeModalProduct.basePriceCents,
      quantity: 1,
      imageUrl: getAssetUrl(activeModalProduct.localAsset || activeModalProduct.rawImageUrl),
    });
    setModalAdded(true);
    setTimeout(() => {
      setModalAdded(false);
      setActiveModalProduct(null);
    }, 900);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-bold text-primary tracking-tight">Menü & Sipariş</h1>
          <p className="text-secondary text-xs sm:text-sm mt-1">
            Yalçın Pastaneleri’nin günlük taze üretimleri ve mutfak menüsü.
          </p>
        </div>

        {/* Branch Selector */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-secondary">Şube:</span>
          <select
            value={selectedBranch.id}
            onChange={(e) => setSelectedBranchId(e.target.value)}
            className="bg-background-alt border border-border px-3 py-1.5 rounded-md font-semibold text-primary focus:outline-none cursor-pointer"
          >
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Raufbey Menu Note (Clean Text Notice) */}
      {selectedBranch.id === 'raufbey' && (
        <div className="bg-neutral-50 border border-neutral-200 rounded-md p-3 text-xs text-secondary leading-relaxed">
          Raufbey Şubesi pastane, fırın, şerbetli ve sütlü tatlılar sunmaktadır. Pizza, burger ve ızgara lezzetleri <strong>Adnan Menderes Şubesi</strong> menüsündedir.
        </div>
      )}

      {/* Search & Category Filter */}
      <div className="space-y-4">
        {/* Search Input */}
        <div className="relative max-w-sm">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Ürün veya lezzet ara..."
            className="w-full pl-9 pr-8 py-2 bg-background-alt border border-border rounded-md text-xs text-primary placeholder:text-secondary focus:outline-none focus:border-neutral-400 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-secondary hover:text-primary"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Categories Tab Strip (Apple-style minimal horizontal bar) */}
        <div className="flex items-center gap-1 overflow-x-auto pb-2 border-b border-border text-xs scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-md whitespace-nowrap transition-colors ${
              selectedCategory === 'all'
                ? 'bg-primary text-white font-semibold'
                : 'text-secondary hover:text-primary hover:bg-neutral-100 font-medium'
            }`}
          >
            Tümü ({allProducts.length})
          </button>

          {categories.map((c) => {
            const isAdnan = c.name.toUpperCase().includes('ADNAN MENDERES');
            if (selectedBranch.id === 'raufbey' && isAdnan) return null;

            const cleanName = c.name.replace(/\s*\(\s*ADNAN MENDERES[^\)]*\)/i, '').trim();
            const isActive = selectedCategory === c.name;

            return (
              <button
                key={c.name}
                onClick={() => setSelectedCategory(c.name)}
                className={`px-3 py-1.5 rounded-md whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-primary text-white font-semibold'
                    : 'text-secondary hover:text-primary hover:bg-neutral-100 font-medium'
                }`}
              >
                {cleanName}
              </button>
            );
          })}
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="py-16 text-center space-y-2">
          <p className="text-sm font-semibold text-primary">Seçilen kriterlere uygun ürün bulunamadı.</p>
          <p className="text-xs text-secondary">Arama terimini değiştirebilir veya başka bir kategori seçebilirsiniz.</p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSearchQuery('');
            }}
            className="mt-3 px-4 py-2 text-xs font-semibold text-accent hover:underline"
          >
            Filtreleri Temizle
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onOpenDetails={(p) => setActiveModalProduct(p)}
            />
          ))}
        </div>
      )}

      {/* Product Detail Modal */}
      {activeModalProduct && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setActiveModalProduct(null)}
        >
          <div
            className="bg-white rounded-xl max-w-lg w-full overflow-hidden shadow-2xl border border-border"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="aspect-[4/3] w-full bg-neutral-100 relative overflow-hidden">
              {activeModalProduct.localAsset || activeModalProduct.rawImageUrl ? (
                <img
                  src={getAssetUrl(activeModalProduct.localAsset || activeModalProduct.rawImageUrl)}
                  alt={activeModalProduct.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-secondary">
                  Görsel Hazırlanıyor
                </div>
              )}
              <button
                onClick={() => setActiveModalProduct(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 border border-border flex items-center justify-center text-primary hover:bg-white shadow-xs"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <h3 className="text-lg font-bold text-primary">{activeModalProduct.name}</h3>
                <p className="text-base font-bold text-accent mt-0.5">
                  {(activeModalProduct.basePriceCents / 100).toFixed(2)} ₺
                </p>
              </div>

              {activeModalProduct.description && (
                <p className="text-xs text-secondary leading-relaxed border-t border-border pt-3">
                  {activeModalProduct.description}
                </p>
              )}

              <div className="text-[11px] text-secondary flex items-center justify-between border-t border-border pt-3">
                <span>Porsiyon: 1 {activeModalProduct.unit || 'adet'}</span>
                <span>Kaynak: Resmî Katalog</span>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleModalAdd}
                  className={`w-full py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition ${
                    modalAdded ? 'bg-emerald-700 text-white' : 'bg-primary hover:bg-neutral-800 text-white'
                  }`}
                >
                  {modalAdded ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Sepete Eklendi</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Sepete Ekle — {(activeModalProduct.basePriceCents / 100).toFixed(2)} ₺</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
