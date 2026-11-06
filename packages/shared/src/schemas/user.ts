import { z } from "zod";
import { ROLES } from "../constants/index.js";

export const phoneSchema = z
  .string()
  .trim()
  .regex(/^\+?[0-9\s-]{7,20}$/, "Enter a valid phone number");

export const updateProfileSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  phone: phoneSchema.optional(),
});
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const updateRoleSchema = z.object({
  role: z.enum(ROLES),
});
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;

const addressFields = z.object({
  fullName: z.string().trim().min(1).max(100),
  phone: phoneSchema,
  line1: z.string().trim().min(1).max(200),
  line2: z.string().trim().max(200).optional(),
  city: z.string().trim().min(1).max(100),
  state: z.string().trim().min(1).max(100),
  country: z.string().trim().min(2).max(100),
  postalCode: z.string().trim().max(20).optional(),
  isDefault: z.boolean().optional(),
});

export const addressSchema = addressFields.extend({
  country: addressFields.shape.country.default("Nigeria"),
});
export type AddressInput = z.infer<typeof addressSchema>;

// Built from the fields without the default: in Zod 4 a default still applies after
// .partial(), so "Make default" would otherwise reset the country to Nigeria.
export const updateAddressSchema = addressFields.partial();
export type UpdateAddressInput = z.infer<typeof updateAddressSchema>;
