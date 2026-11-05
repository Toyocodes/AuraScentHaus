"use client";

import { useMemo } from "react";
import { useGuestCart, type GuestCartItem } from "@/store/guest-cart";
import { useMe } from "../auth/useMe";
import type { BagAddInput, CartDTO, CartItemDTO } from "./types";
import { useAddToCart } from "./useAddToCart";
import { useCart } from "./useCart";
import { useRemoveCartItem } from "./useRemoveCartItem";
import { useUpdateCartItem } from "./useUpdateCartItem";

const EMPTY_CART: CartDTO = { items: [], itemCount: 0, subtotal: 0, updatedAt: null };

/**
 * One bag for the whole storefront, whoever is browsing:
 * - signed in: the server cart (same on every device)
 * - signed out: the guest cart in localStorage (moved into the account at sign-in)
 *
 * Components call `add`, `setQuantity` and `remove` without caring which one it is.
 */
export function useBag() {
  const { data: user, isPending: isUserPending } = useMe();
  const isSignedIn = Boolean(user);

  const serverCart = useCart({ enabled: isSignedIn });
  const addToCart = useAddToCart();
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveCartItem();

  const guestItems = useGuestCart((s) => s.items);
  const guest = useGuestCart.getState(); // actions only; they never change

  const guestCart = useMemo(() => toCartDTO(guestItems), [guestItems]);

  const cart = isSignedIn ? (serverCart.data ?? EMPTY_CART) : guestCart;

  return {
    cart,
    isSignedIn,
    /** Still finding out who is browsing, or loading their server cart. */
    isPending: isUserPending || (isSignedIn && serverCart.isPending),
    isError: isSignedIn && serverCart.isError,
    error: serverCart.error,
    refetch: serverCart.refetch,
    isUpdating: addToCart.isPending || updateItem.isPending || removeItem.isPending,

    /** Add a size to the bag. Rejects if the server refuses (e.g. not enough stock). */
    add: async ({ product, variant, quantity = 1 }: BagAddInput) => {
      if (isSignedIn) {
        await addToCart.mutateAsync({ variantId: variant.id, quantity });
        return;
      }
      guest.add({
        variantId: variant.id,
        quantity,
        productId: product.id,
        name: product.name,
        slug: product.slug,
        image: product.images[0]?.url ?? null,
        sizeMl: variant.sizeMl,
        unitPrice: variant.price,
        stock: variant.stock,
      });
    },

    /** Quantity 0 removes the item. */
    setQuantity: async (variantId: string, quantity: number) => {
      if (isSignedIn) await updateItem.mutateAsync({ variantId, quantity });
      else guest.setQuantity(variantId, quantity);
    },

    remove: async (variantId: string) => {
      if (isSignedIn) await removeItem.mutateAsync(variantId);
      else guest.remove(variantId);
    },
  };
}

/** The guest cart in the same shape as the server cart, so the UI renders both the same way. */
function toCartDTO(items: GuestCartItem[]): CartDTO {
  const cartItems: CartItemDTO[] = items.map((i) => ({
    variantId: i.variantId,
    quantity: i.quantity,
    unitPrice: i.unitPrice,
    lineTotal: i.unitPrice * i.quantity,
    sizeMl: i.sizeMl,
    stock: i.stock,
    available: true,
    product: { id: i.productId, name: i.name, slug: i.slug, image: i.image },
  }));

  return {
    items: cartItems,
    itemCount: cartItems.reduce((n, i) => n + i.quantity, 0),
    subtotal: cartItems.reduce((n, i) => n + i.lineTotal, 0),
    updatedAt: null,
  };
}
