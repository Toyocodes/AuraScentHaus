import type { Request, Response } from "express";
import {
  categoryListQuerySchema,
  categorySchema,
  deleteCategoryQuerySchema,
  updateCategorySchema,
} from "@aurascenthaus/shared";
import { parseBody, parseQuery } from "../../middlewares/validate.js";
import { ApiError } from "../../utils/api-error.js";
import { uploadCategoryImage } from "../uploads/uploads.service.js";
import * as categories from "./categories.service.js";

/** GET /api/categories?tree=true  Active categories that have products on sale. */
export async function list(req: Request, res: Response) {
  const { tree } = parseQuery(categoryListQuerySchema, req);
  res.json({ data: tree ? await categories.getPublicCategoryTree() : await categories.listPublicCategories() });
}

export async function getBySlug(req: Request<{ slug: string }>, res: Response) {
  res.json({ data: await categories.getCategoryBySlug(req.params.slug) });
}

/** GET /api/admin/categories?tree=true  Everything, including empty and inactive categories. */
export async function adminList(req: Request, res: Response) {
  const { tree } = parseQuery(categoryListQuerySchema, req);
  res.json({ data: tree ? await categories.getAdminCategoryTree() : await categories.listAdminCategories() });
}

export async function create(req: Request, res: Response) {
  const input = parseBody(categorySchema, req);
  res.status(201).json({ data: await categories.createCategory(input) });
}

export async function update(req: Request<{ id: string }>, res: Response) {
  const input = parseBody(updateCategorySchema, req);
  res.json({ data: await categories.updateCategory(req.params.id, input) });
}

/** POST /api/admin/categories/:id/image  (multipart, field "image") */
export async function uploadImage(req: Request<{ id: string }>, res: Response) {
  if (!req.file) throw ApiError.badRequest("Attach an image (field: image)");
  const imageUrl = await uploadCategoryImage(req.params.id, req.file);
  res.json({ data: await categories.setCategoryImage(req.params.id, imageUrl) });
}

/** DELETE /api/admin/categories/:id?reassignTo=<categoryId> */
export async function remove(req: Request<{ id: string }>, res: Response) {
  const { reassignTo } = parseQuery(deleteCategoryQuerySchema, req);
  await categories.deleteCategory(req.params.id, reassignTo);
  res.status(204).end();
}
