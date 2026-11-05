import type { Request, Response } from "express";
import { addCartItemSchema, mergeCartSchema, updateCartItemSchema } from "@aurascenthaus/shared";
import { parseBody } from "../../middlewares/validate.js";
import * as cart from "./cart.service.js";

type VariantParams = { variantId: string };

/** GET /api/cart */
export async function get(req: Request, res: Response) {
  res.json({ data: await cart.getCart(req.user!.id) });
}

/** POST /api/cart/items  { variantId, quantity } */
export async function addItem(req: Request, res: Response) {
  const { variantId, quantity } = parseBody(addCartItemSchema, req);
  res.json({ data: await cart.addItem(req.user!.id, variantId, quantity) });
}

/** PATCH /api/cart/items/:variantId  { quantity }  (0 removes) */
export async function updateItem(req: Request<VariantParams>, res: Response) {
  const { quantity } = parseBody(updateCartItemSchema, req);
  res.json({ data: await cart.setItemQuantity(req.user!.id, req.params.variantId, quantity) });
}

/** DELETE /api/cart/items/:variantId */
export async function removeItem(req: Request<VariantParams>, res: Response) {
  res.json({ data: await cart.removeItem(req.user!.id, req.params.variantId) });
}

/** DELETE /api/cart */
export async function clear(req: Request, res: Response) {
  res.json({ data: await cart.clearCart(req.user!.id) });
}

/** POST /api/cart/merge  { items: [{ variantId, quantity }] }: call right after login */
export async function merge(req: Request, res: Response) {
  const input = parseBody(mergeCartSchema, req);
  res.json({ data: await cart.mergeGuestCart(req.user!.id, input) });
}
