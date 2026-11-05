import { z } from "zod";
import { GENDERS, PRODUCT_SORTS, type Gender, type ProductSort } from "@aurascenthaus/shared";
import { ALL_GENDERS } from "./filter-options";

export const productFilterSchema = z.object({
  search: z.string().trim().max(100),
  gender: z.enum([ALL_GENDERS, ...GENDERS]),
  sort: z.enum(PRODUCT_SORTS),
});
export type ProductFilterValues = z.infer<typeof productFilterSchema>;

/** What the parent receives: ready to pass to `useProducts(params)`. */
export interface ProductFilterParams {
  search?: string;
  gender?: Gender;
  sort: ProductSort;
}

export const DEFAULT_FILTERS: ProductFilterValues = { search: "", gender: ALL_GENDERS, sort: "newest" };

export function toFilterParams(values: ProductFilterValues): ProductFilterParams {
  return {
    search: values.search || undefined,
    gender: values.gender === ALL_GENDERS ? undefined : values.gender,
    sort: values.sort,
  };
}
