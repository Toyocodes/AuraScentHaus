import { z } from "zod";
import {
  GENDERS,
  koboToNaira,
  nairaToKobo,
  type ProductDetailDTO,
  type ProductInput,
  type VariantInput,
} from "@aurascenthaus/shared";

/** Value of `categoryId` for "No category". */
export const NO_CATEGORY = "none";

/** One size row. Price is typed in naira and sent to the API in kobo. */
export const variantFormSchema = z.object({
  sizeMl: z.coerce.number<string | number>().int("Whole ml only").positive("Enter a size").max(1000),
  sku: z.string().trim().min(1, "Enter a SKU").max(64),
  price: z.coerce.number<string | number>().positive("Enter a price"),
  stock: z.coerce.number<string | number>().int("Whole numbers only").min(0, "Can't be negative"),
});
export type VariantFormValues = z.input<typeof variantFormSchema>;
export type ParsedVariantValues = z.output<typeof variantFormSchema>;

export const EMPTY_VARIANT: VariantFormValues = { sizeMl: "50", sku: "", price: "", stock: "0" };

export function toVariantInput(v: ParsedVariantValues): VariantInput {
  return { sizeMl: v.sizeMl, sku: v.sku, price: nairaToKobo(v.price), stock: v.stock, isActive: true };
}

export const productFormSchema = z.object({
  name: z.string().trim().min(1, "Enter a name").max(120),
  brand: z.string().trim().max(80),
  description: z.string().trim().max(5000),
  gender: z.enum(GENDERS),
  categoryId: z.string(),
  /** Comma-separated notes, e.g. "Bergamot, Pink Pepper". */
  topNotes: z.string(),
  heartNotes: z.string(),
  baseNotes: z.string(),
  isActive: z.boolean(),
  isFeatured: z.boolean(),
  /** Only used when creating. Existing products manage sizes in the variant manager. */
  variants: z.array(variantFormSchema),
});
export type ProductFormValues = z.input<typeof productFormSchema>;
export type ParsedProductValues = z.output<typeof productFormSchema>;

const splitNotes = (value: string) =>
  value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

export function toProductInput(values: ParsedProductValues, { withVariants }: { withVariants: boolean }): ProductInput {
  return {
    name: values.name,
    brand: values.brand || undefined,
    description: values.description,
    gender: values.gender,
    categoryId: values.categoryId === NO_CATEGORY ? undefined : values.categoryId,
    topNotes: splitNotes(values.topNotes),
    heartNotes: splitNotes(values.heartNotes),
    baseNotes: splitNotes(values.baseNotes),
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
    categoryId: product?.category?.id ?? NO_CATEGORY,
    topNotes: product?.topNotes.join(", ") ?? "",
    heartNotes: product?.heartNotes.join(", ") ?? "",
    baseNotes: product?.baseNotes.join(", ") ?? "",
    isActive: product?.isActive ?? true,
    isFeatured: product?.isFeatured ?? false,
    variants: product ? [] : [EMPTY_VARIANT],
  };
}

/** For the inline price/stock editor of an existing size. */
export const variantStockSchema = variantFormSchema.pick({ price: true, stock: true });
export type VariantStockValues = z.input<typeof variantStockSchema>;

export const toVariantStockValues = (v: { price: number; stock: number }): VariantStockValues => ({
  price: String(koboToNaira(v.price)),
  stock: String(v.stock),
});
