import React, { createContext, useContext, useState, useEffect } from 'react';
import { Branch, CartItem, Order, CustomCakeRequest, VERIFIED_BRANCHES } from '@yalcin/shared';

interface MobileContextType {
  selectedBranch: Branch;
  setSelectedBranch: (branch: Branch) => void;
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, 'totalPriceCents'>) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  subtotalCents: number;
  subtotalFormatted: string;
  isCartModalOpen: boolean;
  setIsCartModalOpen: (open: boolean) => void;
  ordersHistory: Order[];
  addOrderToHistory: (order: Order) => void;
}

const MobileContext = createContext<MobileContextType | undefined>(undefined);

export function MobileProvider({ children }: { children: React.ReactNode }) {
  const [selectedBranch, setSelectedBranch] = useState<Branch>(VERIFIED_BRANCHES[0]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  const [ordersHistory, setOrdersHistory] = useState<Order[]>([]);

  const addToCart = (newItem: Omit<CartItem, 'totalPriceCents'>) => {
    setCartItems((prev) => {
      const idx = prev.findIndex((i) => i.productId === newItem.productId);
      if (idx > -1) {
        const copy = [...prev];
        const updatedQty = copy[idx].quantity + newItem.quantity;
        copy[idx] = {
          ...copy[idx],
          quantity: updatedQty,
          totalPriceCents: copy[idx].unitPriceCents * updatedQty,
        };
        return copy;
      }
      return [
        ...prev,
        {
          ...newItem,
          totalPriceCents: newItem.unitPriceCents * newItem.quantity,
        },
      ];
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems((prev) =>
      prev.map((i) =>
        i.productId === productId
          ? { ...i, quantity, totalPriceCents: i.unitPriceCents * quantity }
          : i
      )
    );
  };

  const removeFromCart = (productId: string) => {
    setCartItems((prev) => prev.filter((i) => i.productId !== productId));
  };

  const clearCart = () => setCartItems([]);

  const addOrderToHistory = (order: Order) => {
    setOrdersHistory((prev) => [order, ...prev]);
  };

  const subtotalCents = cartItems.reduce((acc, it) => acc + it.totalPriceCents, 0);
  const subtotalFormatted = (subtotalCents / 100).toFixed(2) + ' ₺';

  return (
    <MobileContext.Provider
      value={{
        selectedBranch,
        setSelectedBranch,
        cartItems,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        subtotalCents,
        subtotalFormatted,
        isCartModalOpen,
        setIsCartModalOpen,
        ordersHistory,
        addOrderToHistory,
      }}
    >
      {children}
    </MobileContext.Provider>
  );
}

export function useMobile() {
  const ctx = useContext(MobileContext);
  if (!ctx) throw new Error('useMobile must be used within MobileProvider');
  return ctx;
}
