"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { MAX_CART_ITEM_QUANTITY, type SizeUnit } from "@aurascenthaus/shared";

/**
 * Cart for visitors who aren't signed in, kept in localStorage.
 * After login, useMergeCart() moves it into the server cart (POST /api/cart/merge) and clears it,
 * so from then on the cart is the same on every device.
 */
export interface GuestCartItem {
  variantId: string;
  quantity: number;
  // Display snapshot (prices are re-checked by the server on merge/checkout)
  productId: string;
  name: string;
  slug: string;
  image: string | null;
  sizeMl: number;
  /** Missing on items saved before units existed: those are ml. */
  sizeUnit?: SizeUnit;
  unitPrice: number; // kobo
  stock: number;
}

interface GuestCartState {
  items: GuestCartItem[];
  add: (item: GuestCartItem) => void;
  setQuantity: (variantId: string, quantity: number) => void;
  remove: (variantId: string) => void;
  clear: () => void;
}

const clamp = (q: number, stock: number) => Math.max(0, Math.min(q, stock, MAX_CART_ITEM_QUANTITY));

export const useGuestCart = create<GuestCartState>()(
  persist(
    (set) => ({
      items: [],
      add: (item) =>
        set((s) => {
          const existing = s.items.find((i) => i.variantId === item.variantId);
          if (!existing) return { items: [...s.items, { ...item, quantity: clamp(item.quantity, item.stock) }] };
          return {
            items: s.items.map((i) =>
              i.variantId === item.variantId ? { ...i, quantity: clamp(i.quantity + item.quantity, item.stock) } : i,
            ),
          };
        }),
      setQuantity: (variantId, quantity) =>
        set((s) => ({
          items: s.items
            .map((i) => (i.variantId === variantId ? { ...i, quantity: clamp(quantity, i.stock) } : i))
            .filter((i) => i.quantity > 0),
        })),
      remove: (variantId) => set((s) => ({ items: s.items.filter((i) => i.variantId !== variantId) })),
      clear: () => set({ items: [] }),
    }),
    {
      name: "ash-guest-cart",
      storage: createJSONStorage(() => localStorage),
      // Rehydrated by <GuestCartHydrator> after mount, so server and client HTML match.
      skipHydration: true,
    },
  ),
);
