import { z } from "zod";
import {
  GENDERS,
  koboToNaira,
  nairaToKobo,
  SIZE_UNITS,
  type ProductDetailDTO,
  type ProductInput,
  type SizeUnit,
  type VariantInput,
} from "@aurascenthaus/shared";

/** One size row. Price is typed in naira and sent to the API in kobo. */
export const variantFormSchema = z.object({
  sizeMl: z.coerce.number<string | number>().int("Whole numbers only").positive("Enter a size").max(5000),
  sizeUnit: z.enum(SIZE_UNITS),
  sku: z.string().trim().min(1, "Enter a SKU").max(64),
  price: z.coerce.number<string | number>().positive("Enter a price"),
  stock: z.coerce.number<string | number>().int("Whole numbers only").min(0, "Can't be negative"),
});
export type VariantFormValues = z.input<typeof variantFormSchema>;
export type ParsedVariantValues = z.output<typeof variantFormSchema>;

/** A new, blank size row in the given unit. */
export const emptyVariant = (sizeUnit: SizeUnit = "ML"): VariantFormValues => ({
  sizeMl: sizeUnit === "PIECE" ? "1" : "",
  sizeUnit,
  sku: "",
  price: "",
  stock: "0",
});

/** How the amount box is labelled for each unit. */
export const SIZE_FIELD_LABELS: Record<SizeUnit, string> = { ML: "ml", G: "g", PIECE: "Pieces" };
export const SIZE_UNIT_OPTIONS = SIZE_UNITS.map((u) => ({ value: u, label: SIZE_FIELD_LABELS[u] }));

export function toVariantInput(v: ParsedVariantValues): VariantInput {
  return { sizeMl: v.sizeMl, sizeUnit: v.sizeUnit, sku: v.sku, price: nairaToKobo(v.price), stock: v.stock, isActive: true };
}

export const productFormSchema = z.object({
  name: z.string().trim().min(1, "Enter a name").max(120),
  brand: z.string().trim().max(80),
  description: z.string().trim().max(5000),
  gender: z.enum(GENDERS),
  categoryId: z.string().min(1, "Choose a category"),
  scentFamilyIds: z.array(z.string()),
  /** Fragrance pyramid. Only sent for categories that have it. */
  topNotes: z.array(z.string()),
  heartNotes: z.array(z.string()),
  baseNotes: z.array(z.string()),
  isActive: z.boolean(),
  isFeatured: z.boolean(),
  /** Only used when creating. Existing products manage sizes in the variant manager. */
  variants: z.array(variantFormSchema),
});
export type ProductFormValues = z.input<typeof productFormSchema>;
export type ParsedProductValues = z.output<typeof productFormSchema>;

interface ToProductInputOptions {
  withVariants: boolean;
  /** Whether the chosen category has the fragrance pyramid. */
  allowNotes: boolean;
  /** Whether the chosen category uses men / women / unisex. */
  usesGender: boolean;
}

export function toProductInput(values: ParsedProductValues, { withVariants, allowNotes, usesGender }: ToProductInputOptions): ProductInput {
  return {
    name: values.name,
    brand: values.brand || undefined,
    description: values.description,
    gender: usesGender ? values.gender : "UNISEX",
    categoryId: values.categoryId,
    scentFamilyIds: values.scentFamilyIds,
    // Left out otherwise, so notes stored from an earlier category are kept for a move back.
    ...(allowNotes && { topNotes: values.topNotes, heartNotes: values.heartNotes, baseNotes: values.baseNotes }),
    isActive: values.isActive,
    isFeatured: values.isFeatured,
    ...(withVariants && { variants: values.variants.map(toVariantInput) }),
  };
}

/** Form defaults: blank for a new product, or filled from an existing one. */
export function toProductFormValues(product?: ProductDetailDTO): ProductFormValues {
  return {
    name: product?.name ?? "",
    brand: product?.brand ?? "",
    description: product?.description ?? "",
    gender: product?.gender ?? "UNISEX",
    categoryId: product?.category?.id ?? "",
    scentFamilyIds: product?.scentFamilies.map((s) => s.id) ?? [],
    topNotes: product?.topNotes ?? [],
    heartNotes: product?.heartNotes ?? [],
    baseNotes: product?.baseNotes ?? [],
    isActive: product?.isActive ?? true,
    isFeatured: product?.isFeatured ?? false,
    variants: product ? [] : [emptyVariant()],
  };
}

/** For the inline price/stock editor of an existing size. */
export const variantStockSchema = variantFormSchema.pick({ price: true, stock: true });
export type VariantStockValues = z.input<typeof variantStockSchema>;

export const toVariantStockValues = (v: { price: number; stock: number }): VariantStockValues => ({
  price: String(koboToNaira(v.price)),
  stock: String(v.stock),
});
