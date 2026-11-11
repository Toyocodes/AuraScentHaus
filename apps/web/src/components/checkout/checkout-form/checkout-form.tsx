"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { deliveryChoices, pickDeliveryZone, type AddressDTO, type CartItemDTO, type CheckoutInput } from "@aurascenthaus/shared";
import { AddressFields, EMPTY_ADDRESS } from "@/components/address";
import { FormCheckbox, FormChoiceCards, FormInput, FormTextarea, SubmitButton } from "@/components/form";
import { Skeleton } from "@/components/ui/skeleton";
import { Form } from "@/components/ui/form";
import { useDeliveryZones } from "@/hooks/delivery";
import { formatNaira } from "@/lib/format";
import { STORE } from "@/lib/store-info";
import { DeliveryZonePicker } from "../delivery-zone-picker/delivery-zone-picker";
import { OrderSummary, type DeliveryQuote } from "../order-summary/order-summary";
import { SavedAddressPicker } from "../saved-address-picker/saved-address-picker";
import { makeCheckoutFormSchema, NEW_ADDRESS, rememberedZone, toCheckoutInput, type CheckoutFormValues } from "./checkout-schema";

interface CheckoutFormProps {
  items: CartItemDTO[];
  subtotal: number;
  addresses?: AddressDTO[];
  isPending?: boolean;
  /** Bag changes are still saving: wait, so the order uses the latest quantities. */
  isSaving?: boolean;

  onSubmit?: (input: CheckoutInput) => void | Promise<void>;
}

const NO_ADDRESSES: AddressDTO[] = [];

export function CheckoutForm({ items, subtotal, addresses = NO_ADDRESSES, isPending, isSaving, onSubmit }: CheckoutFormProps) {
  const defaultAddress = addresses.find((a) => a.isDefault) ?? addresses[0];
  const zones = useDeliveryZones();
  const choices = useMemo(() => (zones.data ? deliveryChoices(zones.data) : null), [zones.data]);
  const zoneIds = useMemo(() => choices?.map((z) => z.id) ?? null, [choices]);
  const pickup = zones.data?.find((z) => z.kind === "PICKUP");

  const schema = useMemo(() => makeCheckoutFormSchema(zoneIds), [zoneIds]);
  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      deliveryMethod: "DELIVERY",
      deliveryZoneId: "",
      addressId: defaultAddress?.id ?? NEW_ADDRESS,
      address: EMPTY_ADDRESS,
      saveAddress: true,
      pickupContact: { fullName: defaultAddress?.fullName ?? "", phone: defaultAddress?.phone ?? "" },
      note: "",
    },
  });
  const values = useWatch({ control: form.control }) as CheckoutFormValues;
  const isPickup = values.deliveryMethod === "PICKUP";
  const selectedSaved = addresses.find((a) => a.id === values.addressId);

  // A saved address starts with the delivery area it was last delivered with (the customer can change it).
  useEffect(() => {
    if (!zoneIds) return;
    const remembered = rememberedZone(selectedSaved, zoneIds);
    if (remembered) form.setValue("deliveryZoneId", remembered);
  }, [selectedSaved, zoneIds, form]);

  // The fee, worked out with the same rules the server uses when the order is placed.
  let quote: DeliveryQuote = null;
  if (zones.isError) quote = { message: "The delivery fee is added when you continue to payment." };
  else if (zones.data) {
    const result = pickDeliveryZone(zones.data, { method: values.deliveryMethod, zoneId: values.deliveryZoneId || null });
    quote = result.ok ? { zone: result.zone } : { message: result.message };
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(async (v) => onSubmit?.(toCheckoutInput(v)))}
        className="grid gap-10 lg:grid-cols-[1fr_22rem]"
        noValidate
      >
        <div className="space-y-8">
          {pickup && (
            <FormChoiceCards<CheckoutFormValues>
              name="deliveryMethod"
              label="How would you like to get your order?"
              className="sm:grid-cols-2"
              options={[
                { value: "DELIVERY", label: "Delivery", description: "To your address, anywhere in Nigeria" },
                {
                  value: "PICKUP",
                  label: pickup.name,
                  description: `Collect from our store in ${STORE.location} · ${formatNaira(pickup.fee)}`,
                },
              ]}
            />
          )}

          {isPickup ? (
            <div className="space-y-4">
              <h2 className="text-2xl">Who is collecting?</h2>
              <p className="text-sm text-muted-foreground">We&rsquo;ll call this number when your order is ready to collect.</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormInput<CheckoutFormValues> name="pickupContact.fullName" label="Full name" autoComplete="name" />
                <FormInput<CheckoutFormValues> name="pickupContact.phone" label="Phone" type="tel" autoComplete="tel" />
              </div>
            </div>
          ) : (
            <>
              {choices ? (
                <DeliveryZonePicker zones={choices} />
              ) : zones.isPending ? (
                <Skeleton className="h-28" />
              ) : null}

              <div className="space-y-4">
                <h2 className="text-2xl">Delivery address</h2>

                {addresses.length > 0 && <SavedAddressPicker addresses={addresses} />}

                {values.addressId === NEW_ADDRESS && (
                  <div className="space-y-4">
                    <AddressFields prefix="address" />
                    <FormCheckbox<CheckoutFormValues> name="saveAddress" label="Save this address for next time" />
                  </div>
                )}
              </div>
            </>
          )}

          <FormTextarea<CheckoutFormValues>
            name="note"
            label="Order note (optional)"
            maxLength={500}
            placeholder={isPickup ? "Gift message, who will collect…" : "Delivery instructions, gift message…"}
          />
        </div>

        <OrderSummary items={items} subtotal={subtotal} delivery={quote}>
          <SubmitButton
            size="lg"
            className="w-full"
            disabled={items.length === 0 || isSaving}
            isPending={isPending}
            pendingLabel="Redirecting to Paystack…"
          >
            {isSaving ? "Saving your bag…" : "Pay with Paystack"}
          </SubmitButton>
          <p className="text-center text-xs leading-relaxed text-muted-foreground">
            By paying, you agree to our{" "}
            <Link href="/terms" target="_blank" className="underline underline-offset-4 hover:text-foreground">
              terms
            </Link>{" "}
            and{" "}
            <Link href="/returns" target="_blank" className="underline underline-offset-4 hover:text-foreground">
              returns policy
            </Link>
            .
          </p>
        </OrderSummary>
      </form>
    </Form>
  );
}
