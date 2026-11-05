import { z } from "zod";
import { MAX_CART_ITEM_QUANTITY } from "../constants/index.js";
import { idSchema } from "./common.js";

const quantity = z.number().int().min(1).max(MAX_CART_ITEM_QUANTITY);

export const addCartItemSchema = z.object({
  variantId: idSchema,
  quantity: quantity.default(1),
});
export type AddCartItemInput = z.infer<typeof addCartItemSchema>;

/** quantity 0 removes the item. */
export const updateCartItemSchema = z.object({
  quantity: z.number().int().min(0).max(MAX_CART_ITEM_QUANTITY),
});
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;

/** Guest cart (from localStorage), merged into the account cart after login. */
export const mergeCartSchema = z.object({
  items: z.array(z.object({ variantId: idSchema, quantity })).max(50),
});
export type MergeCartInput = z.infer<typeof mergeCartSchema>;
