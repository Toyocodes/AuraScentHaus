import { z } from "zod";
import { GENDERS, SIZE_UNITS } from "../constants/index.js";
import { idSchema, koboSchema, paginationSchema, slugSchema } from "./common.js";

/*
 * No `.default()` on these create/update fields, on purpose. In Zod 4 a default still applies
 * after `.partial()`, so a PATCH of just the price would also reset stock to 0. The database
 * column defaults fill in anything left out when creating.
 */

const notesSchema = z.array(z.string().trim().min(1).max(50)).max(20);

// ─── Categories ──────────────────────────────────────────────

export const categorySchema = z.object({
  name: z.string().trim().min(1).max(80),
  slug: slugSchema.optional(), // generated from name if omitted
  description: z.string().trim().max(500).nullable().optional(),
  imageUrl: z.url().nullable().optional(),
  /** null or left out = a main category. */
  parentId: idSchema.nullable().optional(),
  position: z.number().int().min(0).max(9999).optional(),
  isActive: z.boolean().optional(),
  usesGender: z.boolean().optional(),
  defaultSizeUnit: z.enum(SIZE_UNITS).optional(),
});
export type CategoryInput = z.infer<typeof categorySchema>;

export const updateCategorySchema = categorySchema.partial();
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;

export const categoryListQuerySchema = z.object({
  tree: z.stringbool().optional(),
});
export type CategoryListQuery = z.infer<typeof categoryListQuerySchema>;

/** DELETE /admin/categories/:id?reassignTo=… moves its products there first. */
export const deleteCategoryQuerySchema = z.object({
  reassignTo: idSchema.optional(),
});
export type DeleteCategoryQuery = z.infer<typeof deleteCategoryQuerySchema>;

// ─── Scent families ──────────────────────────────────────────

export const scentFamilySchema = z.object({
  name: z.string().trim().min(1).max(60),
  slug: slugSchema.optional(),
  description: z.string().trim().max(500).nullable().optional(),
  position: z.number().int().min(0).max(9999).optional(),
  isActive: z.boolean().optional(),
});
export type ScentFamilyInput = z.infer<typeof scentFamilySchema>;

export const updateScentFamilySchema = scentFamilySchema.partial();
export type UpdateScentFamilyInput = z.infer<typeof updateScentFamilySchema>;

// ─── Sizes ───────────────────────────────────────────────────

export const variantSchema = z.object({
  /** The amount, measured in `sizeUnit`. The name is kept for compatibility. */
  sizeMl: z.number().int().positive().max(5000),
  sizeUnit: z.enum(SIZE_UNITS).optional(),
  sku: z.string().trim().min(1).max(64),
  price: koboSchema,
  compareAtPrice: koboSchema.nullable().optional(),
  stock: z.number().int().nonnegative().optional(),
  isActive: z.boolean().optional(),
});
export type VariantInput = z.infer<typeof variantSchema>;

export const updateVariantSchema = variantSchema.partial();
export type UpdateVariantInput = z.infer<typeof updateVariantSchema>;

// ─── Products ────────────────────────────────────────────────

const productFields = z.object({
  name: z.string().trim().min(1).max(120),
  slug: slugSchema.optional(),
  brand: z.string().trim().max(80).optional(),
  description: z.string().trim().max(5000).optional(),
  gender: z.enum(GENDERS).optional(),
  /** Only allowed in categories with the fragrance pyramid (the API checks). */
  topNotes: notesSchema.optional(),
  heartNotes: notesSchema.optional(),
  baseNotes: notesSchema.optional(),
  categoryId: idSchema,
  scentFamilyIds: z.array(idSchema).max(12).optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
});

export const productSchema = productFields.extend({
  variants: z.array(variantSchema).min(1, "Add at least one size").optional(),
});
export type ProductInput = z.infer<typeof productSchema>;

export const updateProductSchema = productFields.partial();
export type UpdateProductInput = z.infer<typeof updateProductSchema>;

export const PRODUCT_SORTS = ["newest", "price_asc", "price_desc", "name"] as const;
export type ProductSort = (typeof PRODUCT_SORTS)[number];

export const productQuerySchema = paginationSchema.extend({
  search: z.string().trim().max(100).optional(),
  /** Category slug. A main category includes all its subcategories. */
  category: slugSchema.optional(),
  /** Scent family slugs, comma separated. A product matching any of them is included. */
  scent: z
    .string()
    .transform((value) => value.split(",").map((s) => s.trim()).filter(Boolean))
    .pipe(z.array(slugSchema).max(12))
    .optional(),
  gender: z.enum(GENDERS).optional(),
  featured: z.stringbool().optional(),
  /** In kobo, compared with the product's cheapest size. */
  minPrice: z.coerce.number().int().nonnegative().optional(),
  maxPrice: z.coerce.number().int().nonnegative().optional(),
  inStock: z.stringbool().optional(),
  sort: z.enum(PRODUCT_SORTS).default("newest"),
});
export type ProductQuery = z.infer<typeof productQuerySchema>;
