import type {
  ProductDetailDTO,
  ProductImageDTO,
  ProductListItemDTO,
  VariantDTO,
} from "@aurascenthaus/shared";
import type { Prisma, ProductImage, ProductVariant } from "../../generated/prisma/client.js";

/** Prisma `include` for product cards. */
export const productListInclude = {
  category: { select: { id: true, name: true, slug: true } },
  images: { orderBy: { position: "asc" }, take: 1 },
} satisfies Prisma.ProductInclude;

/** Prisma `include` for the product page / admin edit. */
export const productDetailInclude = {
  category: { select: { id: true, name: true, slug: true } },
  images: { orderBy: { position: "asc" } },
  variants: { orderBy: { sizeMl: "asc" } },
} satisfies Prisma.ProductInclude;

type ListRow = Prisma.ProductGetPayload<{ include: typeof productListInclude }>;
type DetailRow = Prisma.ProductGetPayload<{ include: typeof productDetailInclude }>;

export function toImageDTO(i: ProductImage): ProductImageDTO {
  return { id: i.id, url: i.url, alt: i.alt, position: i.position };
}

export function toVariantDTO(v: ProductVariant): VariantDTO {
  return {
    id: v.id,
    sizeMl: v.sizeMl,
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
  };
}

/** `includeInactiveVariants` is for admins; shoppers only see active sizes. */
export function toProductDetail(p: DetailRow, includeInactiveVariants = false): ProductDetailDTO {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    brand: p.brand,
    gender: p.gender,
    isFeatured: p.isFeatured,
    isActive: p.isActive,
    category: p.category,
    description: p.description,
    topNotes: p.topNotes,
    heartNotes: p.heartNotes,
    baseNotes: p.baseNotes,
    images: p.images.map(toImageDTO),
    variants: p.variants.filter((v) => includeInactiveVariants || v.isActive).map(toVariantDTO),
  };
}
