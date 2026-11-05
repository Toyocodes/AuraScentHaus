import type { Request, Response } from "express";
import * as uploads from "./uploads.service.js";

/** POST /api/admin/products/:id/images  (multipart, field "images", optional text field "alt") */
export async function uploadProductImages(req: Request<{ id: string }>, res: Response) {
  const files = (req.files as Express.Multer.File[] | undefined) ?? [];
  const alt = typeof req.body?.alt === "string" ? req.body.alt.slice(0, 200) : undefined;
  res.status(201).json({ data: await uploads.uploadProductImages(req.params.id, files, alt) });
}

/** DELETE /api/admin/products/:id/images/:imageId */
export async function deleteProductImage(req: Request<{ id: string; imageId: string }>, res: Response) {
  await uploads.deleteProductImage(req.params.id, req.params.imageId);
  res.status(204).end();
}
