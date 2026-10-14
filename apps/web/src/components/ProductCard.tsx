'use client';

import React, { useState } from 'react';
import { Plus, Check, Info } from 'lucide-react';
import { Product } from '@yalcin/shared';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: Product;
  onOpenDetails?: (product: Product) => void;
}

export function ProductCard({ product, onOpenDetails }: ProductCardProps) {
  const { addToCart } = useCart();
  const [isAdded, setIsAdded] = useState(false);

  const priceFormatted = (product.basePriceCents / 100).toLocaleString('tr-TR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }) + ' ₺';

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart({
      productId: product.id,
      name: product.name,
      unitPriceCents: product.basePriceCents,
      quantity: 1,
      imageUrl: product.localAsset || product.rawImageUrl,
    });
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1200);
  };

  return (
    <div
      onClick={() => onOpenDetails && onOpenDetails(product)}
      className="group bg-white rounded-xl border border-border/80 overflow-hidden hover:border-neutral-300 hover:shadow-lg transition-all duration-300 flex flex-col cursor-pointer"
    >
      {/* Product Image Frame */}
      <div className="aspect-[4/3] w-full bg-background-alt overflow-hidden relative">
        {product.localAsset ? (
          <img
            src={product.localAsset}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center text-secondary bg-neutral-50">
            <span className="text-xs font-medium text-neutral-400">Görsel Hazırlanıyor</span>
            <span className="text-[10px] text-neutral-300 mt-1">Yalçın Pastaneleri</span>
          </div>
        )}

        {/* Price Tag */}
        <div className="absolute bottom-2.5 right-2.5 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-lg text-xs font-bold text-primary shadow-sm border border-black/5">
          {priceFormatted}
        </div>
      </div>

      {/* Product Body */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-semibold text-primary line-clamp-1 group-hover:text-accent transition-colors">
            {product.name}
          </h3>
          {product.description && (
            <p className="text-xs text-secondary mt-1 line-clamp-2 leading-relaxed">
              {product.description}
            </p>
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between">
          <span className="text-[11px] text-secondary font-medium">
            1 {product.unit || 'porsiyon'}
          </span>

          <button
            onClick={handleAdd}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              isAdded
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-primary hover:bg-accent text-white shadow-sm'
            }`}
            aria-label={`${product.name} sepete ekle`}
          >
            {isAdded ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Eklendi</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span>Ekle</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
