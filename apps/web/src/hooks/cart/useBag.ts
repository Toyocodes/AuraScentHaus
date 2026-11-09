"use client";

import { useMemo } from "react";
import { useIsMutating } from "@tanstack/react-query";
import { formatSize } from "@aurascenthaus/shared";
import { useGuestCart, type GuestCartItem } from "@/store/guest-cart";
import { useMe } from "../auth/useMe";
import { useHasMounted } from "../helper/useHasMounted";
import { EMPTY_CART, toCartItem } from "./optimistic-cart";
import type { BagAddInput, CartDTO, CartItemDTO } from "./types";
import { useAddToCart } from "./useAddToCart";
import { useCart } from "./useCart";
import { CART_WRITE_KEY } from "./useCartWrite";
import { useRemoveCartItem } from "./useRemoveCartItem";
import { useUpdateCartItem } from "./useUpdateCartItem";

/**
 * One bag for the whole storefront, whoever is browsing:
 * - signed in: the server cart (same on every device)
 * - signed out: the guest cart in localStorage (moved into the account at sign-in)
 *
 * Components call `add`, `setQuantity`, `remove` and `restore` without caring which one it is.
 * Every change shows on screen straight away. For a signed-in bag it then saves in the background,
 * and the returned promise rejects if the server refuses (the bag goes back to the server's version).
 */
export function useBag() {
  const hasMounted = useHasMounted();
  const { data: user, isPending: isUserPending } = useMe();
  const isSignedIn = Boolean(user);

  const serverCart = useCart({ enabled: isSignedIn });
  const addToCart = useAddToCart();
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveCartItem();
  const savingCount = useIsMutating({ mutationKey: CART_WRITE_KEY });

  const guestItems = useGuestCart((s) => s.items);
  const guest = useGuestCart.getState(); // actions only; they never change

  // The guest bag lives in this browser, so the server can't know it: start empty, like its HTML.
  const guestCart = useMemo(() => toCartDTO(hasMounted ? guestItems : []), [guestItems, hasMounted]);

  const cart = isSignedIn ? (serverCart.data ?? EMPTY_CART) : guestCart;

  const addLine = async (item: CartItemDTO, quantity: number) => {
    if (isSignedIn) {
      await addToCart.mutateAsync({ variantId: item.variantId, quantity, preview: item });
      return;
    }
    guest.add({
      variantId: item.variantId,
      quantity,
      productId: item.product.id,
      name: item.product.name,
      slug: item.product.slug,
      image: item.product.image,
      sizeMl: item.sizeMl,
      sizeUnit: item.sizeUnit,
      unitPrice: item.unitPrice,
      stock: item.stock,
    });
  };

  return {
    cart,
    isSignedIn,
    /** Still finding out who is browsing, or loading their server cart. */
    isPending: !hasMounted || isUserPending || (isSignedIn && serverCart.isPending),
    isError: isSignedIn && serverCart.isError,
    error: serverCart.error,
    refetch: serverCart.refetch,
    /** Changes are still being saved. Checkout waits for this, so it never uses an old quantity. */
    isSaving: isSignedIn && savingCount > 0,

    /** Add a size to the bag. Rejects if the server refuses (e.g. not enough stock). */
    add: ({ product, variant, quantity = 1 }: BagAddInput) => addLine(toCartItem({ product, variant }), quantity),

    /** Quantity 0 removes the item. */
    setQuantity: async (variantId: string, quantity: number) => {
      if (isSignedIn) await updateItem.mutateAsync({ variantId, quantity });
      else guest.setQuantity(variantId, quantity);
    },

    remove: async (variantId: string) => {
      if (isSignedIn) await removeItem.mutateAsync(variantId);
      else guest.remove(variantId);
    },

    /** Puts back a line that was just removed ("Undo"). */
    restore: (item: CartItemDTO) => addLine(item, item.quantity),
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
    sizeUnit: i.sizeUnit ?? "ML",
    sizeLabel: formatSize(i.sizeMl, i.sizeUnit),
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
