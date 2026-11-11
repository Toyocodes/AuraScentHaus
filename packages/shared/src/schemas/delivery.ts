import { z } from "zod";
import { koboSchema } from "./common.js";

const areaSchema = z.string().trim().min(1, "Area names can't be empty").max(100);

/**
 * POST /admin/delivery-zones adds a Lagos axis. PATCH edits any option; for "Other Lagos area",
 * "Other states" and "Store pickup", `areas` is ignored.
 * No `.default()` here, so a PATCH of just the fee changes nothing else.
 */
export const deliveryZoneSchema = z.object({
  name: z.string().trim().min(1, "Enter a name").max(80),
  areas: z.array(areaSchema).max(100).optional(),
  fee: koboSchema.max(10_000_000_00),
  deliveryTime: z.string().trim().max(80).nullable().optional(),
  position: z.number().int().min(0).max(9999).optional(),
  isActive: z.boolean().optional(),
});
export type DeliveryZoneInput = z.infer<typeof deliveryZoneSchema>;

export const updateDeliveryZoneSchema = deliveryZoneSchema.partial();
export type UpdateDeliveryZoneInput = z.infer<typeof updateDeliveryZoneSchema>;
