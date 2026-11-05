import type {
  SellableVariantDTO,
  ProductInput,
  ProductQuery,
  UpdateProductInput,
  UpdateVariantInput,
  VariantInput,
} from "@aurascenthaus/shared";
import { prisma, type Tx } from "../../config/prisma.js";
import type { Prisma } from "../../generated/prisma/client.js";
import { ApiError } from "../../utils/api-error.js";
import { paginated, toSkipTake } from "../../utils/pagination.js";
import { slugify, uniqueSlug } from "../../utils/slugify.js";
import { deleteStoredImages } from "../uploads/uploads.service.js";
import {
  productDetailInclude,
  productListInclude,
  toProductDetail,
  toProductListItem,
  toVariantDTO,
} from "./products.mapper.js";

const slugTaken = async (slug: string) => !!(await prisma.product.findUnique({ where: { slug } }));

/** Recompute Product.priceFrom (cheapest active variant). Call after any variant change. */
export async function refreshPriceFrom(productId: string, db: Tx | typeof prisma = prisma) {
  const cheapest = await db.productVariant.findFirst({
    where: { productId, isActive: true },
    orderBy: { price: "asc" },
    select: { price: true },
  });
  await db.product.update({ where: { id: productId }, data: { priceFrom: cheapest?.price ?? null } });
}

// ─── Queries ─────────────────────────────────────────────────

export async function listProducts(query: ProductQuery, opts: { admin?: boolean } = {}) {
  const where: Prisma.ProductWhereInput = {
    ...(!opts.admin && { isActive: true, priceFrom: { not: null } }),
    ...(query.category && { category: { slug: query.category } }),
    ...(query.gender && { gender: query.gender }),
    ...(query.featured !== undefined && { isFeatured: query.featured }),
    ...(query.search && {
      OR: [
        { name: { contains: query.search, mode: "insensitive" } },
        { brand: { contains: query.search, mode: "insensitive" } },
      ],
    }),
  };

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    query.sort === "price_asc"
      ? { priceFrom: { sort: "asc", nulls: "last" } }
      : query.sort === "price_desc"
        ? { priceFrom: { sort: "desc", nulls: "last" } }
        : query.sort === "name"
          ? { name: "asc" }
          : { createdAt: "desc" };

  const [rows, total] = await prisma.$transaction([
    prisma.product.findMany({ where, orderBy, include: productListInclude, ...toSkipTake(query) }),
    prisma.product.count({ where }),
  ]);

  return paginated(rows.map(toProductListItem), total, query);
}

export async function getProductBySlug(slug: string) {
  const product = await prisma.product.findUnique({ where: { slug }, include: productDetailInclude });
  if (!product || !product.isActive) throw ApiError.notFound("Product");
  return toProductDetail(product);
}

export async function getProductById(id: string) {
  const product = await prisma.product.findUnique({ where: { id }, include: productDetailInclude });
  if (!product) throw ApiError.notFound("Product");
  return toProductDetail(product, true);
}

// ─── Admin mutations ─────────────────────────────────────────

export async function createProduct(input: ProductInput) {
  const { variants = [], ...data } = input;
  const slug = data.slug ? slugify(data.slug) : await uniqueSlug(data.name, slugTaken);

  const product = await prisma.$transaction(async (tx) => {
    const created = await tx.product.create({
      data: { ...data, slug, variants: { create: variants } },
    });
    await refreshPriceFrom(created.id, tx);
    return created;
  });

  return getProductById(product.id);
}

export async function updateProduct(id: string, input: UpdateProductInput) {
  const data = { ...input, ...(input.slug && { slug: slugify(input.slug) }) };
  await prisma.product.update({ where: { id }, data });
  return getProductById(id);
}

export async function deleteProduct(id: string) {
  const images = await prisma.productImage.findMany({ where: { productId: id }, select: { storagePath: true } });
  // Past orders keep their snapshot (OrderItem.variantId is set to null).
  await prisma.product.delete({ where: { id } });
  await deleteStoredImages(images.map((i) => i.storagePath));
}

export async function addVariant(productId: string, input: VariantInput) {
  const variant = await prisma.$transaction(async (tx) => {
    const v = await tx.productVariant.create({ data: { ...input, productId } });
    await refreshPriceFrom(productId, tx);
    return v;
  });
  return toVariantDTO(variant);
}

export async function updateVariant(productId: string, variantId: string, input: UpdateVariantInput) {
  const variant = await prisma.$transaction(async (tx) => {
    const existing = await tx.productVariant.findFirst({ where: { id: variantId, productId } });
    if (!existing) throw ApiError.notFound("Variant");
    const v = await tx.productVariant.update({ where: { id: variantId }, data: input });
    await refreshPriceFrom(productId, tx);
    return v;
  });
  return toVariantDTO(variant);
}

export async function deleteVariant(productId: string, variantId: string) {
  await prisma.$transaction(async (tx) => {
    const { count } = await tx.productVariant.deleteMany({ where: { id: variantId, productId } });
    if (count === 0) throw ApiError.notFound("Variant");
    await refreshPriceFrom(productId, tx);
  });
}

/** Every size of every product, for the in-store order form (in-store can also sell hidden stock). */
export async function listSellableVariants(): Promise<SellableVariantDTO[]> {
  const variants = await prisma.productVariant.findMany({
    include: { product: { select: { id: true, name: true, isActive: true } } },
    orderBy: [{ product: { name: "asc" } }, { sizeMl: "asc" }],
  });
  return variants.map((v) => ({
    variantId: v.id,
    productId: v.product.id,
    productName: v.product.name,
    sizeMl: v.sizeMl,
    sku: v.sku,
    price: v.price,
    stock: v.stock,
    isActive: v.isActive && v.product.isActive,
  }));
}
