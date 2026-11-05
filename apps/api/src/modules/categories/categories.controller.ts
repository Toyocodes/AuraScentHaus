import type { Request, Response } from "express";
import { categorySchema, updateCategorySchema } from "@aurascenthaus/shared";
import { parseBody } from "../../middlewares/validate.js";
import * as categories from "./categories.service.js";

export async function list(_req: Request, res: Response) {
  res.json({ data: await categories.listCategories() });
}

export async function getBySlug(req: Request<{ slug: string }>, res: Response) {
  res.json({ data: await categories.getCategoryBySlug(req.params.slug) });
}

export async function create(req: Request, res: Response) {
  const input = parseBody(categorySchema, req);
  res.status(201).json({ data: await categories.createCategory(input) });
}

export async function update(req: Request<{ id: string }>, res: Response) {
  const input = parseBody(updateCategorySchema, req);
  res.json({ data: await categories.updateCategory(req.params.id, input) });
}

export async function remove(req: Request<{ id: string }>, res: Response) {
  await categories.deleteCategory(req.params.id);
  res.status(204).end();
}
