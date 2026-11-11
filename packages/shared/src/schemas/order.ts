import { z } from "zod";
import { DELIVERY_METHODS, ORDER_STATUSES } from "../constants/index.js";
import { idSchema, paginationSchema } from "./common.js";
import { addressSchema, phoneSchema } from "./user.js";

/**
 * Start checkout.
 * DELIVERY: pick a delivery option (a Lagos axis, another Lagos area, or other states) and use a
 * saved address OR send a new one. The option is remembered on the address for next time.
 * PICKUP: collect from the store. Only a name and phone number are needed.
 */
export const checkoutSchema = z
  .object({
    deliveryMethod: z.enum(DELIVERY_METHODS).default("DELIVERY"),
    addressId: idSchema.optional(),
    address: addressSchema.optional(),
    deliveryZoneId: idSchema.optional(),
    saveAddress: z.boolean().default(false),
    pickupContact: z
      .object({ fullName: z.string().trim().min(1, "Enter your name").max(100), phone: phoneSchema })
      .optional(),
    note: z.string().trim().max(500).optional(),
  })
  .refine((v) => v.deliveryMethod === "PICKUP" || Boolean(v.deliveryZoneId), {
    message: "Choose your delivery area",
    path: ["deliveryZoneId"],
  })
  .refine((v) => v.deliveryMethod === "PICKUP" || Boolean(v.addressId || v.address), {
    message: "Choose a saved address or enter a new one",
    path: ["address"],
  })
  .refine((v) => v.deliveryMethod === "DELIVERY" || Boolean(v.pickupContact), {
    message: "Enter the name and phone number for pickup",
    path: ["pickupContact"],
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
