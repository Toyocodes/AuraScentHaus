import { z } from "zod";
import type { CheckoutInput } from "@aurascenthaus/shared";
import { addressFormSchema, rawAddressSchema, toAddressInput } from "@/components/address";

/** Value of `addressId` when the shopper types a new address instead of picking a saved one. */
export const NEW_ADDRESS = "new";

export const checkoutFormSchema = z
  .object({
    addressId: z.string(),
    address: rawAddressSchema,
    saveAddress: z.boolean(),
    note: z.string().trim().max(500),
  })
  .superRefine((values, ctx) => {
    // Only check the address fields when they're being used.
    if (values.addressId !== NEW_ADDRESS) return;
    const result = addressFormSchema.safeParse(values.address);
    if (result.success) return;
    for (const issue of result.error.issues) {
      ctx.addIssue({ code: "custom", message: issue.message, path: ["address", ...issue.path] });
    }
  });
export type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;

export function toCheckoutInput(values: CheckoutFormValues): CheckoutInput {
  const note = values.note || undefined;
  if (values.addressId !== NEW_ADDRESS) return { addressId: values.addressId, saveAddress: false, note };
  return { address: toAddressInput(values.address), saveAddress: values.saveAddress, note };
}
