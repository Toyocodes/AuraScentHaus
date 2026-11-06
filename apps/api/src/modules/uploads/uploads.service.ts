import { randomUUID } from "node:crypto";
import { prisma } from "../../config/prisma.js";
import { storage } from "../../config/storage.js";
import { ApiError } from "../../utils/api-error.js";
import { toImageDTO } from "../products/products.mapper.js";
import { ALLOWED_IMAGE_TYPES } from "./uploads.middleware.js";

export async function uploadProductImages(productId: string, files: Express.Multer.File[], alt?: string) {
  if (files.length === 0) throw ApiError.badRequest("Attach at least one image (field: images)");

  const product = await prisma.product.findUnique({ where: { id: productId }, select: { id: true } });
  if (!product) throw ApiError.notFound("Product");

  const last = await prisma.productImage.findFirst({
    where: { productId },
    orderBy: { position: "desc" },
    select: { position: true },
  });
  let position = (last?.position ?? -1) + 1;

  const bucket = storage();
  const created = [];

  for (const file of files) {
    const path = `products/${productId}/${randomUUID()}.${ALLOWED_IMAGE_TYPES[file.mimetype]}`;
    const { error } = await bucket.upload(path, file.buffer, {
      contentType: file.mimetype,
      cacheControl: "31536000", // file names are unique, so cache forever
      upsert: false,
    });
    if (error) throw new ApiError(502, `Image upload failed: ${error.message}`, "UPLOAD_FAILED");

    const { data } = bucket.getPublicUrl(path);
    created.push(
      await prisma.productImage.create({
        data: { productId, url: data.publicUrl, storagePath: path, alt: alt ?? null, position: position++ },
      }),
    );
  }

  return created.map(toImageDTO);
}

/** Upload a category's picture and return its public URL. */
export async function uploadCategoryImage(categoryId: string, file: Express.Multer.File): Promise<string> {
  const category = await prisma.category.findUnique({ where: { id: categoryId }, select: { id: true } });
  if (!category) throw ApiError.notFound("Category");

  const bucket = storage();
  const path = `categories/${categoryId}/${randomUUID()}.${ALLOWED_IMAGE_TYPES[file.mimetype]}`;
  const { error } = await bucket.upload(path, file.buffer, {
    contentType: file.mimetype,
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) throw new ApiError(502, `Image upload failed: ${error.message}`, "UPLOAD_FAILED");
  return bucket.getPublicUrl(path).data.publicUrl;
}

export async function deleteProductImage(productId: string, imageId: string) {
  const image = await prisma.productImage.findFirst({ where: { id: imageId, productId } });
  if (!image) throw ApiError.notFound("Image");
  await prisma.productImage.delete({ where: { id: imageId } });
  await deleteStoredImages([image.storagePath]);
}

/** Best effort: a failed storage delete shouldn't fail the request. */
export async function deleteStoredImages(paths: string[]) {
  if (paths.length === 0) return;
  try {
    const { error } = await storage().remove(paths);
    if (error) console.warn("Storage cleanup failed:", error.message);
  } catch (err) {
    console.warn("Storage cleanup skipped:", (err as Error).message);
  }
}
