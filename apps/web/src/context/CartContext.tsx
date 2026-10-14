'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem } from '@yalcin/shared';
import { useBranch } from './BranchContext';

interface CartContextType {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, 'totalPriceCents'>) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  subtotalCents: number;
  subtotalFormatted: string;
  totalCount: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { selectedBranch } = useBranch();

  // Load cart from storage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('yalcin_cart');
      if (saved) {
        setItems(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to parse cart', e);
    }
  }, []);

  // Save to storage
  useEffect(() => {
    try {
      localStorage.setItem('yalcin_cart', JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save cart', e);
    }
  }, [items]);

  const addToCart = (newItem: Omit<CartItem, 'totalPriceCents'>) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.productId === newItem.productId);
      if (existingIndex > -1) {
        const updated = [...prev];
        const existing = updated[existingIndex];
        const newQty = existing.quantity + newItem.quantity;
        updated[existingIndex] = {
          ...existing,
          quantity: newQty,
          totalPriceCents: existing.unitPriceCents * newQty,
          notes: newItem.notes || existing.notes,
        };
        return updated;
      } else {
        return [
          ...prev,
          {
            ...newItem,
            totalPriceCents: newItem.unitPriceCents * newItem.quantity,
          },
        ];
      }
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems((prev) =>
      prev.map((i) => {
        if (i.productId === productId) {
          return {
            ...i,
            quantity,
            totalPriceCents: i.unitPriceCents * quantity,
          };
        }
        return i;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const subtotalCents = items.reduce((sum, item) => sum + item.totalPriceCents, 0);
  const subtotalFormatted = (subtotalCents / 100).toLocaleString('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }) + ' ₺';

  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        subtotalCents,
        subtotalFormatted,
        totalCount,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
