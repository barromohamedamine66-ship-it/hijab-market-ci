'use client';
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { LocalCartItem } from '@/lib/supabase/types';
import { supabase } from '@/lib/supabase/client';

interface CartContextValue {
  items: LocalCartItem[];
  total: number;
  count: number;
  addItem: (item: LocalCartItem) => void;
  removeItem: (productId: string, color?: string, size?: string) => void;
  updateQuantity: (productId: string, quantity: number, color?: string, size?: string) => void;
  clearCart: () => void;
  isInCart: (productId: string) => boolean;
  syncWithSupabase: (userId: string) => Promise<void>;
}

const CART_KEY = 'hijab_market_cart';

const CartContext = createContext<CartContextValue | undefined>(undefined);

const itemKey = (item: Pick<LocalCartItem, 'product_id' | 'selected_color' | 'selected_size'>) =>
  `${item.product_id}__${item.selected_color || ''}__${item.selected_size || ''}`;

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<LocalCartItem[]>([]);

  // Chargement depuis localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_KEY);
      if (stored) setItems(JSON.parse(stored));
    } catch (_) {}
  }, []);

  // Sauvegarde dans localStorage à chaque changement
  useEffect(() => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(items));
    } catch (_) {}
  }, [items]);

  const addItem = useCallback((newItem: LocalCartItem) => {
    setItems(prev => {
      const key = itemKey(newItem);
      const exists = prev.find(i => itemKey(i) === key);
      if (exists) {
        return prev.map(i =>
          itemKey(i) === key ? { ...i, quantity: Math.min(i.quantity + newItem.quantity, 99) } : i
        );
      }
      return [...prev, newItem];
    });
  }, []);

  const removeItem = useCallback((productId: string, color?: string, size?: string) => {
    setItems(prev => prev.filter(i => itemKey(i) !== itemKey({ product_id: productId, selected_color: color, selected_size: size })));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number, color?: string, size?: string) => {
    if (quantity <= 0) { removeItem(productId, color, size); return; }
    setItems(prev =>
      prev.map(i =>
        itemKey(i) === itemKey({ product_id: productId, selected_color: color, selected_size: size })
          ? { ...i, quantity: Math.min(quantity, 99) }
          : i
      )
    );
  }, [removeItem]);

  const clearCart = useCallback(() => {
    setItems([]);
    try { localStorage.removeItem(CART_KEY); } catch (_) {}
  }, []);

  const isInCart = useCallback((productId: string) => items.some(i => i.product_id === productId), [items]);

  /** Synchronise le panier local avec Supabase après connexion */
  const syncWithSupabase = useCallback(async (userId: string) => {
    if (!items.length) return;
    const inserts = items.map(item => ({
      user_id: userId,
      product_id: item.product_id,
      quantity: item.quantity,
      selected_color: item.selected_color || null,
      selected_size: item.selected_size || null,
    }));
    await supabase.from('cart_items').upsert(inserts, { onConflict: 'user_id,product_id,selected_color,selected_size' });
  }, [items]);

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, total, count, addItem, removeItem, updateQuantity, clearCart, isInCart, syncWithSupabase }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart doit être utilisé dans un <CartProvider>');
  return ctx;
}
