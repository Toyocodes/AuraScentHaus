import { z } from "zod";
import { phoneSchema, type UpdateProfileInput } from "@aurascenthaus/shared";

export const profileFormSchema = z.object({
  name: z.string().trim().max(100),
  // Optional, but if it's filled in it must be a valid phone number.
  phone: z.union([z.literal(""), phoneSchema]),
});
export type ProfileFormValues = z.infer<typeof profileFormSchema>;

/** Leave out empty fields so they aren't overwritten with "". */
export function toProfileInput(values: ProfileFormValues): UpdateProfileInput {
  return { ...(values.name && { name: values.name }), ...(values.phone && { phone: values.phone }) };
}
