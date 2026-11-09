import { formatSize, MAX_CART_ITEM_QUANTITY, type CartDTO, type CartItemDTO } from "@aurascenthaus/shared";
import type { BagAddInput } from "./types";

/*
 * How the bag should look straight after a click, before the server answers. The server's
 * answer always replaces this afterwards, so these only need to be a good guess, never the truth.
 */

export const EMPTY_CART: CartDTO = { items: [], itemCount: 0, subtotal: 0, updatedAt: null };

/** Most of a size anyone can have: what's in stock, and never more than the per-item limit. */
export const maxQuantity = (stock: number) => Math.max(0, Math.min(stock, MAX_CART_ITEM_QUANTITY));

function withItems(cart: CartDTO, items: CartItemDTO[]): CartDTO {
  return {
    ...cart,
    items,
    itemCount: items.reduce((n, i) => n + i.quantity, 0),
    subtotal: items.reduce((n, i) => n + i.lineTotal, 0),
  };
}

/** Sets a quantity (clamped to stock). 0 removes the item. */
export function setQuantityIn(cart: CartDTO, variantId: string, quantity: number): CartDTO {
  const items = cart.items
    .map((i) => {
      if (i.variantId !== variantId) return i;
      const q = Math.min(quantity, maxQuantity(i.stock));
      return { ...i, quantity: q, lineTotal: q * i.unitPrice };
    })
    .filter((i) => i.quantity > 0);
  return withItems(cart, items);
}

export function removeFrom(cart: CartDTO, variantId: string): CartDTO {
  return withItems(
    cart,
    cart.items.filter((i) => i.variantId !== variantId),
  );
}

/** Adds to an existing line, or appends a new one (the server lists items oldest first). */
export function addTo(cart: CartDTO, item: CartItemDTO, quantity: number): CartDTO {
  const existing = cart.items.find((i) => i.variantId === item.variantId);
  if (existing) return setQuantityIn(cart, item.variantId, existing.quantity + quantity);

  const q = Math.min(quantity, maxQuantity(item.stock));
  if (q <= 0) return cart;
  return withItems(cart, [...cart.items, { ...item, quantity: q, lineTotal: q * item.unitPrice }]);
}

/** A bag line built from the product page, for showing an addition before the server confirms it. */
export function toCartItem({ product, variant }: BagAddInput): CartItemDTO {
  return {
    variantId: variant.id,
    quantity: 0,
    unitPrice: variant.price,
    lineTotal: 0,
    sizeMl: variant.sizeMl,
    sizeUnit: variant.sizeUnit,
    sizeLabel: formatSize(variant.sizeMl, variant.sizeUnit),
    stock: variant.stock,
    available: true,
    product: { id: product.id, name: product.name, slug: product.slug, image: product.images[0]?.url ?? null },
  };
}
