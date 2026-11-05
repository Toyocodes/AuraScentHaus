import { z } from "zod";
import { GENDERS } from "../constants/index.js";
import { idSchema, koboSchema, paginationSchema, slugSchema } from "./common.js";

const notesSchema = z.array(z.string().trim().min(1).max(50)).max(20).default([]);

export const categorySchema = z.object({
  name: z.string().trim().min(1).max(80),
  slug: slugSchema.optional(), // generated from name if omitted
  description: z.string().trim().max(500).optional(),
  imageUrl: z.url().optional(),
});
export type CategoryInput = z.infer<typeof categorySchema>;

export const updateCategorySchema = categorySchema.partial();
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;

export const variantSchema = z.object({
  sizeMl: z.number().int().positive().max(1000),
  sku: z.string().trim().min(1).max(64),
  price: koboSchema,
  compareAtPrice: koboSchema.optional(),
  stock: z.number().int().nonnegative().default(0),
  isActive: z.boolean().default(true),
});
export type VariantInput = z.infer<typeof variantSchema>;

export const updateVariantSchema = variantSchema.partial();
export type UpdateVariantInput = z.infer<typeof updateVariantSchema>;

export const productSchema = z.object({
  name: z.string().trim().min(1).max(120),
  slug: slugSchema.optional(),
  brand: z.string().trim().max(80).optional(),
  description: z.string().trim().max(5000).default(""),
  gender: z.enum(GENDERS).default("UNISEX"),
  topNotes: notesSchema,
  heartNotes: notesSchema,
  baseNotes: notesSchema,
  categoryId: idSchema.optional(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  variants: z.array(variantSchema).min(1, "Add at least one size").optional(),
});
export type ProductInput = z.infer<typeof productSchema>;

export const updateProductSchema = productSchema.omit({ variants: true }).partial();
export type UpdateProductInput = z.infer<typeof updateProductSchema>;

export const PRODUCT_SORTS = ["newest", "price_asc", "price_desc", "name"] as const;
export type ProductSort = (typeof PRODUCT_SORTS)[number];

export const productQuerySchema = paginationSchema.extend({
  search: z.string().trim().max(100).optional(),
  category: slugSchema.optional(),
  gender: z.enum(GENDERS).optional(),
  featured: z.stringbool().optional(),
  sort: z.enum(PRODUCT_SORTS).default("newest"),
});
export type ProductQuery = z.infer<typeof productQuerySchema>;
