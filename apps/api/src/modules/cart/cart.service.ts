import { MAX_CART_ITEM_QUANTITY, type CartDTO, type MergeCartInput } from "@aurascenthaus/shared";
import { prisma } from "../../config/prisma.js";
import type { Prisma } from "../../generated/prisma/client.js";
import { ApiError } from "../../utils/api-error.js";

/**
 * The cart lives in the database, keyed by user, so it follows the customer
 * across every device they sign in on. Guests keep a local cart in the browser,
 * which is merged in via `mergeGuestCart` right after login.
 */

const cartInclude = {
  items: {
    orderBy: { createdAt: "asc" },
    include: {
      variant: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              isActive: true,
              images: { orderBy: { position: "asc" }, take: 1, select: { url: true } },
            },
          },
        },
      },
    },
  },
} satisfies Prisma.CartInclude;

type CartRow = Prisma.CartGetPayload<{ include: typeof cartInclude }>;

function toCartDTO(cart: CartRow | null): CartDTO {
  if (!cart) return { items: [], itemCount: 0, subtotal: 0, updatedAt: null };

  const items = cart.items.map((item) => {
    const { variant } = item;
    const available = variant.isActive && variant.product.isActive && variant.stock > 0;
    return {
      variantId: variant.id,
      quantity: item.quantity,
      unitPrice: variant.price,
      lineTotal: variant.price * item.quantity,
      sizeMl: variant.sizeMl,
      stock: variant.stock,
      available,
      product: {
        id: variant.product.id,
        name: variant.product.name,
        slug: variant.product.slug,
        image: variant.product.images[0]?.url ?? null,
      },
    };
  });

  const purchasable = items.filter((i) => i.available);
  return {
    items,
    itemCount: purchasable.reduce((n, i) => n + i.quantity, 0),
    subtotal: purchasable.reduce((sum, i) => sum + i.lineTotal, 0),
    updatedAt: cart.updatedAt.toISOString(),
  };
}

async function cartIdFor(userId: string): Promise<string> {
  const cart = await prisma.cart.upsert({
    where: { userId },
    update: {},
    create: { userId },
    select: { id: true },
  });
  return cart.id;
}

async function getPurchasableVariant(variantId: string) {
  const variant = await prisma.productVariant.findUnique({
    where: { id: variantId },
    include: { product: { select: { isActive: true, name: true } } },
  });
  if (!variant || !variant.isActive || !variant.product.isActive) {
    throw ApiError.notFound("Product size");
  }
  return variant;
}

function assertStock(stock: number, wanted: number, name: string) {
  if (stock <= 0) throw ApiError.conflict(`${name} is out of stock`, "OUT_OF_STOCK", { stock });
  if (wanted > stock) throw ApiError.conflict(`Only ${stock} of ${name} left`, "INSUFFICIENT_STOCK", { stock });
}

// ─── Public API ──────────────────────────────────────────────

export async function getCart(userId: string): Promise<CartDTO> {
  const cart = await prisma.cart.findUnique({ where: { userId }, include: cartInclude });
  return toCartDTO(cart);
}

/** Adds to the existing quantity. */
export async function addItem(userId: string, variantId: string, quantity: number) {
  const variant = await getPurchasableVariant(variantId);
  const cartId = await cartIdFor(userId);

  const existing = await prisma.cartItem.findUnique({ where: { cartId_variantId: { cartId, variantId } } });
  const next = Math.min((existing?.quantity ?? 0) + quantity, MAX_CART_ITEM_QUANTITY);
  assertStock(variant.stock, next, variant.product.name);

  await prisma.cartItem.upsert({
    where: { cartId_variantId: { cartId, variantId } },
    update: { quantity: next },
    create: { cartId, variantId, quantity: next },
  });
  await touch(cartId);
  return getCart(userId);
}

/** Sets an exact quantity; 0 removes the item. */
export async function setItemQuantity(userId: string, variantId: string, quantity: number) {
  if (quantity === 0) return removeItem(userId, variantId);

  const variant = await getPurchasableVariant(variantId);
  assertStock(variant.stock, quantity, variant.product.name);

  const cartId = await cartIdFor(userId);
  await prisma.cartItem.upsert({
    where: { cartId_variantId: { cartId, variantId } },
    update: { quantity },
    create: { cartId, variantId, quantity },
  });
  await touch(cartId);
  return getCart(userId);
}

export async function removeItem(userId: string, variantId: string) {
  await prisma.cartItem.deleteMany({ where: { variantId, cart: { userId } } });
  return getCart(userId);
}

export async function clearCart(userId: string) {
  await prisma.cartItem.deleteMany({ where: { cart: { userId } } });
  return getCart(userId);
}

/**
 * Merge a guest (localStorage) cart into the account cart after login.
 * Quantities are added together and clamped to stock; unavailable items are skipped.
 */
export async function mergeGuestCart(userId: string, input: MergeCartInput) {
  if (input.items.length === 0) return getCart(userId);

  const cartId = await cartIdFor(userId);
  const variantIds = [...new Set(input.items.map((i) => i.variantId))];

  const [variants, existing] = await Promise.all([
    prisma.productVariant.findMany({
      where: { id: { in: variantIds }, isActive: true, product: { isActive: true } },
      select: { id: true, stock: true },
    }),
    prisma.cartItem.findMany({ where: { cartId, variantId: { in: variantIds } } }),
  ]);

  const stockById = new Map(variants.map((v) => [v.id, v.stock]));
  const currentById = new Map(existing.map((i) => [i.variantId, i.quantity]));
  const incomingById = new Map<string, number>();
  for (const i of input.items) incomingById.set(i.variantId, (incomingById.get(i.variantId) ?? 0) + i.quantity);

  const ops = [];
  for (const [variantId, incoming] of incomingById) {
    const stock = stockById.get(variantId);
    if (!stock || stock <= 0) continue;
    const quantity = Math.min((currentById.get(variantId) ?? 0) + incoming, stock, MAX_CART_ITEM_QUANTITY);
    ops.push(
      prisma.cartItem.upsert({
        where: { cartId_variantId: { cartId, variantId } },
        update: { quantity },
        create: { cartId, variantId, quantity },
      }),
    );
  }

  if (ops.length > 0) await prisma.$transaction(ops);
  await touch(cartId);
  return getCart(userId);
}

/** Bumps Cart.updatedAt so other devices can tell the cart changed. */
async function touch(cartId: string) {
  await prisma.cart.update({ where: { id: cartId }, data: { updatedAt: new Date() } });
}
