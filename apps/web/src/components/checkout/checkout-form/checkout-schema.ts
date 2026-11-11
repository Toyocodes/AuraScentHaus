import { z } from "zod";
import { DELIVERY_METHODS, phoneSchema, type AddressDTO, type CheckoutInput } from "@aurascenthaus/shared";
import { addressFormSchema, rawAddressSchema, toAddressInput } from "@/components/address";

/** Value of `addressId` when the shopper types a new address instead of picking a saved one. */
export const NEW_ADDRESS = "new";

const checkoutFields = z.object({
  deliveryMethod: z.enum(DELIVERY_METHODS),
  /** The delivery option picked (a Lagos axis, other Lagos area, or other states). */
  deliveryZoneId: z.string(),
  addressId: z.string(),
  address: rawAddressSchema,
  saveAddress: z.boolean(),
  pickupContact: z.object({ fullName: z.string(), phone: z.string() }),
  note: z.string().trim().max(500),
});
export type CheckoutFormValues = z.infer<typeof checkoutFields>;

/**
 * Only the fields in use are checked. `zoneIds` are the delivery options on offer
 * (null while they load: the API checks the pick anyway).
 */
export function makeCheckoutFormSchema(zoneIds: readonly string[] | null) {
  return checkoutFields.superRefine((values, ctx) => {
    const issue = (path: (string | number)[], message: string) => ctx.addIssue({ code: "custom", path, message });

    if (values.deliveryMethod === "PICKUP") {
      if (!values.pickupContact.fullName.trim()) issue(["pickupContact", "fullName"], "Enter the name for pickup");
      if (!phoneSchema.safeParse(values.pickupContact.phone).success) issue(["pickupContact", "phone"], "Enter a valid phone number");
      return;
    }

    if (!values.deliveryZoneId || (zoneIds && !zoneIds.includes(values.deliveryZoneId))) {
      issue(["deliveryZoneId"], "Choose your delivery area");
    }

    if (values.addressId !== NEW_ADDRESS) return;
    const result = addressFormSchema.safeParse(values.address);
    if (result.success) return;
    for (const i of result.error.issues) issue(["address", ...(i.path as (string | number)[])], i.message);
  });
}

/** The delivery option to preselect for a saved address: the one it was last delivered with. */
export const rememberedZone = (address: AddressDTO | undefined, zoneIds: readonly string[]) =>
  address?.deliveryZoneId && zoneIds.includes(address.deliveryZoneId) ? address.deliveryZoneId : "";

export function toCheckoutInput(values: CheckoutFormValues): CheckoutInput {
  const note = values.note || undefined;

  if (values.deliveryMethod === "PICKUP") {
    return {
      deliveryMethod: "PICKUP",
      pickupContact: { fullName: values.pickupContact.fullName.trim(), phone: values.pickupContact.phone.trim() },
      saveAddress: false,
      note,
    };
  }

  const delivery = { deliveryMethod: "DELIVERY" as const, deliveryZoneId: values.deliveryZoneId, note };
  if (values.addressId !== NEW_ADDRESS) return { ...delivery, addressId: values.addressId, saveAddress: false };
  return { ...delivery, address: toAddressInput(values.address), saveAddress: values.saveAddress };
}
