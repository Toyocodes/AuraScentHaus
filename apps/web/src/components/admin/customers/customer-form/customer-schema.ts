import { z } from "zod";
import { emailSchema, phoneSchema, type AdminCreateCustomerInput, type UserDTO } from "@aurascenthaus/shared";

export const customerFormSchema = z.object({
  email: emailSchema,
  name: z.string().trim().max(100),
  phone: z.union([z.literal(""), phoneSchema]),
});
export type CustomerFormValues = z.input<typeof customerFormSchema>;

export const EMPTY_CUSTOMER: CustomerFormValues = { email: "", name: "", phone: "" };

export const toCustomerFormValues = (c: Pick<UserDTO, "email" | "name" | "phone">): CustomerFormValues => ({
  email: c.email,
  name: c.name ?? "",
  phone: c.phone ?? "",
});

/** Empty name/phone are left out rather than saved as "". */
export function toCustomerInput(values: z.output<typeof customerFormSchema>): AdminCreateCustomerInput {
  return { email: values.email, ...(values.name && { name: values.name }), ...(values.phone && { phone: values.phone }) };
}
