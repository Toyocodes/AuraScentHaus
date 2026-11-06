import {
  formatSize,
  type ProductDetailDTO,
  type ProductImageDTO,
  type ProductListItemDTO,
  type VariantDTO,
} from "@aurascenthaus/shared";
import type { Prisma, ProductImage, ProductVariant } from "../../generated/prisma/client.js";

const scentFamiliesInclude = {
  orderBy: { position: "asc" },
  select: { id: true, name: true, slug: true, isActive: true },
} satisfies Prisma.ScentFamilyFindManyArgs;

/** The settings that pass down the category tree, for a category and its parents (3 levels at most). */
const inheritedFields = { isActive: true, hasFragrancePyramid: true, usesGender: true } as const;
const categoryWithParents = {
  select: {
    id: true,
    name: true,
    slug: true,
    defaultSizeUnit: true,
    ...inheritedFields,
    parent: { select: { ...inheritedFields, parent: { select: inheritedFields } } },
  },
} satisfies Prisma.CategoryDefaultArgs;

/** Prisma `include` for product cards. */
export const productListInclude = {
  category: { select: { id: true, name: true, slug: true } },
  scentFamilies: scentFamiliesInclude,
  images: { orderBy: { position: "asc" }, take: 1 },
} satisfies Prisma.ProductInclude;

/** Prisma `include` for the product page / admin edit. */
export const productDetailInclude = {
  category: categoryWithParents,
  scentFamilies: scentFamiliesInclude,
  images: { orderBy: { position: "asc" } },
  variants: { orderBy: [{ sizeUnit: "asc" }, { sizeMl: "asc" }] },
} satisfies Prisma.ProductInclude;

type ListRow = Prisma.ProductGetPayload<{ include: typeof productListInclude }>;
type DetailRow = Prisma.ProductGetPayload<{ include: typeof productDetailInclude }>;

/** The category and each of its parents. */
function categoryChain(category: DetailRow["category"]) {
  return category ? [category, category.parent, category.parent?.parent].filter((c) => c != null) : [];
}

/** Shoppers can't reach a product whose category (or a parent of it) has been deactivated. */
export const categoryIsVisible = (category: DetailRow["category"]) => categoryChain(category).every((c) => c.isActive);

const hasPyramid = (category: DetailRow["category"]) => categoryChain(category).some((c) => c.hasFragrancePyramid);
const usesGender = (category: DetailRow["category"]) => categoryChain(category).some((c) => c.usesGender);

const toScentRefs = (families: Array<{ id: string; name: string; slug: string; isActive: boolean }>, includeInactive = false) =>
  families.filter((f) => includeInactive || f.isActive).map(({ id, name, slug }) => ({ id, name, slug }));

export function toImageDTO(i: ProductImage): ProductImageDTO {
  return { id: i.id, url: i.url, alt: i.alt, position: i.position };
}

export function toVariantDTO(v: ProductVariant): VariantDTO {
  return {
    id: v.id,
    sizeMl: v.sizeMl,
    sizeUnit: v.sizeUnit,
    sizeLabel: formatSize(v.sizeMl, v.sizeUnit),
    sku: v.sku,
    price: v.price,
    compareAtPrice: v.compareAtPrice,
    stock: v.stock,
    isActive: v.isActive,
  };
}

export function toProductListItem(p: ListRow): ProductListItemDTO {
  const image = p.images[0];
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    brand: p.brand,
    gender: p.gender,
    isFeatured: p.isFeatured,
    isActive: p.isActive,
    image: image ? toImageDTO(image) : null,
    priceFrom: p.priceFrom,
    category: p.category,
    scentFamilies: toScentRefs(p.scentFamilies),
  };
}

/**
 * `forAdmin` includes hidden sizes and scent families, and the stored notes even outside a
 * fragrance-pyramid category, so they can return if the product moves back. Shoppers get
 * empty arrays there.
 */
export function toProductDetail(p: DetailRow, forAdmin = false): ProductDetailDTO {
  const showNotes = forAdmin || hasPyramid(p.category);
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    brand: p.brand,
    gender: p.gender,
    isFeatured: p.isFeatured,
    isActive: p.isActive,
    category: p.category && {
      id: p.category.id,
      name: p.category.name,
      slug: p.category.slug,
      hasFragrancePyramid: hasPyramid(p.category),
      usesGender: usesGender(p.category),
      defaultSizeUnit: p.category.defaultSizeUnit,
    },
    scentFamilies: toScentRefs(p.scentFamilies, forAdmin),
    description: p.description,
    topNotes: showNotes ? p.topNotes : [],
    heartNotes: showNotes ? p.heartNotes : [],
    baseNotes: showNotes ? p.baseNotes : [],
    images: p.images.map(toImageDTO),
    variants: p.variants.filter((v) => forAdmin || v.isActive).map(toVariantDTO),
  };
}
