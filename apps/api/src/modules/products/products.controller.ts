import type { Request, Response } from "express";
import {
  productQuerySchema,
  productSchema,
  updateProductSchema,
  updateVariantSchema,
  variantSchema,
} from "@aurascenthaus/shared";
import { parseBody, parseQuery } from "../../middlewares/validate.js";
import * as products from "./products.service.js";

type IdParams = { id: string };
type VariantParams = { id: string; variantId: string };

// ─── Public ──────────────────────────────────────────────────

/** GET /api/products?search=&category=&gender=&featured=&sort=&page=&limit= */
export async function list(req: Request, res: Response) {
  res.json(await products.listProducts(parseQuery(productQuerySchema, req)));
}

/** GET /api/products/:slug */
export async function getBySlug(req: Request<{ slug: string }>, res: Response) {
  res.json({ data: await products.getProductBySlug(req.params.slug) });
}

// ─── Admin ───────────────────────────────────────────────────

/** GET /api/admin/products (includes inactive products) */
export async function adminList(req: Request, res: Response) {
  res.json(await products.listProducts(parseQuery(productQuerySchema, req), { admin: true }));
}

export async function adminGet(req: Request<IdParams>, res: Response) {
  res.json({ data: await products.getProductById(req.params.id) });
}

export async function create(req: Request, res: Response) {
  const input = parseBody(productSchema, req);
  res.status(201).json({ data: await products.createProduct(input) });
}

export async function update(req: Request<IdParams>, res: Response) {
  const input = parseBody(updateProductSchema, req);
  res.json({ data: await products.updateProduct(req.params.id, input) });
}

export async function remove(req: Request<IdParams>, res: Response) {
  await products.deleteProduct(req.params.id);
  res.status(204).end();
}

export async function addVariant(req: Request<IdParams>, res: Response) {
  const input = parseBody(variantSchema, req);
  res.status(201).json({ data: await products.addVariant(req.params.id, input) });
}

export async function updateVariant(req: Request<VariantParams>, res: Response) {
  const input = parseBody(updateVariantSchema, req);
  res.json({ data: await products.updateVariant(req.params.id, req.params.variantId, input) });
}

export async function deleteVariant(req: Request<VariantParams>, res: Response) {
  await products.deleteVariant(req.params.id, req.params.variantId);
  res.status(204).end();
}

/** GET /api/admin/products/sellable */
export async function sellable(_req: Request, res: Response) {
  res.json({ data: await products.listSellableVariants() });
}
