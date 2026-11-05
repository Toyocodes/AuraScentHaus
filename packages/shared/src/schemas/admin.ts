import { z } from "zod";
import { IN_STORE_PAYMENT_METHODS } from "../constants/index.js";
import { DEFAULT_STATS_RANGE, STATS_RANGE_KEYS } from "../utils/date-range.js";
import { emailSchema } from "./auth.js";
import { idSchema } from "./common.js";
import { addressSchema, phoneSchema } from "./user.js";

// ─── Customers (added by an admin) ───────────────────────────

const nameSchema = z.string().trim().min(1, "Enter a name").max(100);

/** POST /admin/customers. The customer can later sign in with this email to see their orders. */
export const adminCreateCustomerSchema = z.object({
  email: emailSchema,
  name: nameSchema.optional(),
  phone: phoneSchema.optional(),
});
export type AdminCreateCustomerInput = z.infer<typeof adminCreateCustomerSchema>;

/** PATCH /admin/customers/:id */
export const adminUpdateCustomerSchema = adminCreateCustomerSchema.partial();
export type AdminUpdateCustomerInput = z.infer<typeof adminUpdateCustomerSchema>;

// ─── In-store orders (entered by an admin) ───────────────────

export const adminOrderLineSchema = z.object({
  variantId: idSchema,
  quantity: z.number().int().min(1).max(100),
});
export type AdminOrderLine = z.infer<typeof adminOrderLineSchema>;

/** Who bought it: a customer on file, a new customer (creates an account), or a walk-in with no account. */
export const adminOrderCustomerSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("existing"), customerId: idSchema }),
  z.object({ type: z.literal("new"), email: emailSchema, name: nameSchema, phone: phoneSchema.optional() }),
  z.object({ type: z.literal("walk_in"), name: nameSchema.optional(), phone: phoneSchema.optional() }),
]);
export type AdminOrderCustomer = z.infer<typeof adminOrderCustomerSchema>;

const itemsSchema = z.array(adminOrderLineSchema).min(1, "Add at least one item").max(50);
const noteSchema = z.string().trim().max(500);

/**
 * POST /admin/orders: record a sale made in the shop.
 * The attendant is NOT part of the input: the API uses the signed-in admin.
 */
export const adminCreateOrderSchema = z.object({
  customer: adminOrderCustomerSchema,
  items: itemsSchema,
  paymentMethod: z.enum(IN_STORE_PAYMENT_METHODS),
  /** false = e.g. a transfer that hasn't arrived yet (the order stays PENDING). */
  isPaid: z.boolean().default(true),
  /** Leave out when the customer takes the perfume with them. */
  delivery: addressSchema.optional(),
  note: noteSchema.optional(),
});
export type AdminCreateOrderInput = z.infer<typeof adminCreateOrderSchema>;

/**
 * PATCH /admin/orders/:id
 * Online (Paystack) orders: only `note` and `delivery` can change.
 * In-store orders: everything except the attendant and the order number.
 */
export const adminUpdateOrderSchema = z.object({
  customer: adminOrderCustomerSchema.optional(),
  items: itemsSchema.optional(),
  paymentMethod: z.enum(IN_STORE_PAYMENT_METHODS).optional(),
  /** Confirm payment for an unpaid in-store order. */
  markAsPaid: z.literal(true).optional(),
  /** null = collected in store (removes the delivery address). */
  delivery: addressSchema.nullable().optional(),
  note: noteSchema.nullable().optional(),
});
export type AdminUpdateOrderInput = z.infer<typeof adminUpdateOrderSchema>;

// ─── Dashboard ───────────────────────────────────────────────

/** GET /admin/stats?range=last_30_days */
export const statsQuerySchema = z.object({
  range: z.enum(STATS_RANGE_KEYS).default(DEFAULT_STATS_RANGE),
});
export type StatsQuery = z.infer<typeof statsQuerySchema>;
