import { z } from "zod";
import { PRODUCT_SORTS } from "@aurascenthaus/shared";

/** The search box and sort dropdown above the products. */
export const productFilterSchema = z.object({
  search: z.string().trim().max(100),
  sort: z.enum(PRODUCT_SORTS),
});
export type ProductFilterValues = z.infer<typeof productFilterSchema>;

/** The price range. Empty boxes mean no limit. */
const priceBox = z
  .string()
  .trim()
  .refine((v) => v === "" || (Number.isFinite(Number(v)) && Number(v) >= 0), "Enter an amount");

export const priceFilterSchema = z
  .object({ min: priceBox, max: priceBox })
  .refine((v) => v.min === "" || v.max === "" || Number(v.max) >= Number(v.min), {
    message: "Must be at least the minimum",
    path: ["max"],
  });
export type PriceFilterValues = z.infer<typeof priceFilterSchema>;
