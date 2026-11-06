import {
  formatSize,
  type SellableVariantDTO,
  type ProductInput,
  type ProductQuery,
  type UpdateProductInput,
  type UpdateVariantInput,
  type VariantInput,
} from "@aurascenthaus/shared";
import { prisma, type Tx } from "../../config/prisma.js";
import type { Prisma } from "../../generated/prisma/client.js";
import { ApiError } from "../../utils/api-error.js";
import { paginated, toSkipTake } from "../../utils/pagination.js";
import { slugify, uniqueSlug } from "../../utils/slugify.js";
import { deleteStoredImages } from "../uploads/uploads.service.js";
import { loadCategoryRows } from "../categories/categories.service.js";
import { activeCategoryIds, inheritedFlags, subtreeIds } from "../categories/category-tree.js";
import {
  categoryIsVisible,
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

/** Which categories to show: limited to the requested branch, and to active ones for shoppers. */
async function categoryFilter(slug: string | undefined, admin: boolean): Promise<Prisma.ProductWhereInput> {
  if (!slug && admin) return {};

  const rows = await loadCategoryRows();
  const active = activeCategoryIds(rows);
  if (!slug) {
    // Hide deactivated categories, but keep any product that has no category at all.
    return { OR: [{ categoryId: null }, { categoryId: { in: active } }] };
  }

  const root = rows.find((c) => c.slug === slug);
  if (!root) return { categoryId: { in: [] } };
  const branch = subtreeIds(rows, root.id);
  return { categoryId: { in: admin ? branch : branch.filter((id) => active.includes(id)) } };
}

export async function listProducts(query: ProductQuery, opts: { admin?: boolean } = {}) {
  const admin = Boolean(opts.admin);
  const where: Prisma.ProductWhereInput = {
    ...(!admin && { isActive: true, priceFrom: { not: null } }),
    ...(await categoryFilter(query.category, admin)),
    ...(query.scent?.length && {
      scentFamilies: { some: { slug: { in: query.scent }, ...(!admin && { isActive: true }) } },
    }),
    ...(query.gender && { gender: query.gender }),
    ...(query.featured !== undefined && { isFeatured: query.featured }),
    ...((query.minPrice !== undefined || query.maxPrice !== undefined) && {
      priceFrom: {
        ...(!admin && { not: null }),
        ...(query.minPrice !== undefined && { gte: query.minPrice }),
        ...(query.maxPrice !== undefined && { lte: query.maxPrice }),
      },
    }),
    ...(query.inStock && { variants: { some: { isActive: true, stock: { gt: 0 } } } }),
    ...(query.search && {
      AND: [
        {
          OR: [
            { name: { contains: query.search, mode: "insensitive" } },
            { brand: { contains: query.search, mode: "insensitive" } },
          ],
        },
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
  if (!product || !product.isActive || !categoryIsVisible(product.category)) throw ApiError.notFound("Product");
  return toProductDetail(product);
}

export async function getProductById(id: string) {
  const product = await prisma.product.findUnique({ where: { id }, include: productDetailInclude });
  if (!product) throw ApiError.notFound("Product");
  return toProductDetail(product, true);
}

// ─── Admin mutations ─────────────────────────────────────────

// ─── The fragrance-pyramid rule ──────────────────────────────

type NoteFields = Pick<UpdateProductInput, "topNotes" | "heartNotes" | "baseNotes">;

const hasNotes = (input: NoteFields) => [input.topNotes, input.heartNotes, input.baseNotes].some((notes) => notes?.length);

async function allowsNotes(categoryId: string | null): Promise<boolean> {
  if (!categoryId) return false;
  const rows = await loadCategoryRows();
  if (!rows.some((c) => c.id === categoryId)) throw ApiError.badRequest("That category doesn't exist", "INVALID_CATEGORY");
  return inheritedFlags(rows, categoryId).hasFragrancePyramid;
}

const NOTES_NOT_ALLOWED = () =>
  ApiError.badRequest("Top, heart and base notes are only for products in a fragrance-pyramid category", "NOTES_NOT_ALLOWED");

/** Link scent families, naming the problem clearly if one doesn't exist. */
async function assertScentFamiliesExist(ids: string[] | undefined) {
  if (!ids?.length) return;
  const found = await prisma.scentFamily.count({ where: { id: { in: ids } } });
  if (found !== new Set(ids).size) throw ApiError.badRequest("One of those scent families doesn't exist", "INVALID_SCENT_FAMILY");
}

export async function createProduct(input: ProductInput) {
  const { variants = [], scentFamilyIds, ...data } = input;
  if (!(await allowsNotes(data.categoryId)) && hasNotes(data)) throw NOTES_NOT_ALLOWED();
  await assertScentFamiliesExist(scentFamilyIds);
  const slug = data.slug ? slugify(data.slug) : await uniqueSlug(data.name, slugTaken);

  const product = await prisma.$transaction(async (tx) => {
    const created = await tx.product.create({
      data: {
        ...data,
        slug,
        variants: { create: variants },
        ...(scentFamilyIds && { scentFamilies: { connect: scentFamilyIds.map((id) => ({ id })) } }),
      },
    });
    await refreshPriceFrom(created.id, tx);
    return created;
  });

  return getProductById(product.id);
}

/**
 * Moving a product out of a fragrance-pyramid category keeps its notes in the database, hidden
 * from shoppers, so they come back if it moves back. That's why notes are left out of the
 * update there rather than cleared. Sending actual notes for such a product is refused.
 */
export async function updateProduct(id: string, input: UpdateProductInput) {
  const existing = await prisma.product.findUnique({ where: { id }, select: { categoryId: true } });
  if (!existing) throw ApiError.notFound("Product");

  const { scentFamilyIds, topNotes, heartNotes, baseNotes, ...rest } = input;
  const notes = { topNotes, heartNotes, baseNotes };
  const allowed = await allowsNotes(input.categoryId ?? existing.categoryId);
  if (!allowed && hasNotes(notes)) throw NOTES_NOT_ALLOWED();
  await assertScentFamiliesExist(scentFamilyIds);

  await prisma.product.update({
    where: { id },
    data: {
      ...rest,
      ...(input.slug && { slug: slugify(input.slug) }),
      ...(allowed && notes),
      ...(scentFamilyIds && { scentFamilies: { set: scentFamilyIds.map((familyId) => ({ id: familyId })) } }),
    },
  });
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
    orderBy: [{ product: { name: "asc" } }, { sizeUnit: "asc" }, { sizeMl: "asc" }],
  });
  return variants.map((v) => ({
    variantId: v.id,
    productId: v.product.id,
    productName: v.product.name,
    sizeMl: v.sizeMl,
    sizeUnit: v.sizeUnit,
    sizeLabel: formatSize(v.sizeMl, v.sizeUnit),
    sku: v.sku,
    price: v.price,
    stock: v.stock,
    isActive: v.isActive && v.product.isActive,
  }));
}
