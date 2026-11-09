import type { Request, Response } from "express";
import { scentFamilySchema, updateScentFamilySchema } from "@aurascenthaus/shared";
import { parseBody } from "../../middlewares/validate.js";
import { ApiError } from "../../utils/api-error.js";
import { uploadScentFamilyImage } from "../uploads/uploads.service.js";
import * as scentFamilies from "./scent-families.service.js";

/** GET /api/scent-families */
export async function list(_req: Request, res: Response) {
  res.json({ data: await scentFamilies.listPublicScentFamilies() });
}

/** GET /api/admin/scent-families (includes inactive ones) */
export async function adminList(_req: Request, res: Response) {
  res.json({ data: await scentFamilies.listAdminScentFamilies() });
}

export async function create(req: Request, res: Response) {
  const input = parseBody(scentFamilySchema, req);
  res.status(201).json({ data: await scentFamilies.createScentFamily(input) });
}

export async function update(req: Request<{ id: string }>, res: Response) {
  const input = parseBody(updateScentFamilySchema, req);
  res.json({ data: await scentFamilies.updateScentFamily(req.params.id, input) });
}

/** POST /api/admin/scent-families/:id/image  (multipart, field "image") */
export async function uploadImage(req: Request<{ id: string }>, res: Response) {
  if (!req.file) throw ApiError.badRequest("Attach an image (field: image)");
  const imageUrl = await uploadScentFamilyImage(req.params.id, req.file);
  res.json({ data: await scentFamilies.setScentFamilyImage(req.params.id, imageUrl) });
}

export async function remove(req: Request<{ id: string }>, res: Response) {
  await scentFamilies.deleteScentFamily(req.params.id);
  res.status(204).end();
}
