import { z } from "zod";
import { ORDER_STATUSES } from "../constants/index.js";
import { idSchema, paginationSchema } from "./common.js";
import { addressSchema } from "./user.js";

/** Start checkout: use a saved address OR send a new one. */
export const checkoutSchema = z
  .object({
    addressId: idSchema.optional(),
    address: addressSchema.optional(),
    saveAddress: z.boolean().default(false),
    note: z.string().trim().max(500).optional(),
  })
  .refine((v) => Boolean(v.addressId || v.address), {
    message: "Choose a saved address or enter a new one",
    path: ["address"],
  });
export type CheckoutInput = z.infer<typeof checkoutSchema>;

export const updateOrderStatusSchema = z.object({
  status: z.enum(ORDER_STATUSES),
});
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;

export const orderQuerySchema = paginationSchema.extend({
  status: z.enum(ORDER_STATUSES).optional(),
  search: z.string().trim().max(100).optional(),
});
export type OrderQuery = z.infer<typeof orderQuerySchema>;
