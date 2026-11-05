import { z } from "zod";
import { addressSchema, type AddressInput } from "@aurascenthaus/shared";

/** The address inputs, validated with the same rules as the API. */
export const addressFormSchema = addressSchema.pick({
  fullName: true,
  phone: true,
  line1: true,
  line2: true,
  city: true,
  state: true,
});
export type AddressFormValues = z.input<typeof addressFormSchema>;

/** Unvalidated shape, for forms that only validate the address in some cases (checkout). */
export const rawAddressSchema = z.object({
  fullName: z.string(),
  phone: z.string(),
  line1: z.string(),
  line2: z.string(),
  city: z.string(),
  state: z.string(),
});

export const EMPTY_ADDRESS = { fullName: "", phone: "", line1: "", line2: "", city: "", state: "" };

export function toAddressInput(values: AddressFormValues, extra?: { isDefault?: boolean }): AddressInput {
  return { ...values, line2: values.line2?.trim() || undefined, country: "Nigeria", ...extra };
}
