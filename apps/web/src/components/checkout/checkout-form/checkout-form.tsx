"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import type { AddressDTO, CartItemDTO, CheckoutInput } from "@aurascenthaus/shared";
import { AddressFields, EMPTY_ADDRESS } from "@/components/address";
import { FormCheckbox, FormTextarea, SubmitButton } from "@/components/form";
import { Form } from "@/components/ui/form";
import { OrderSummary } from "../order-summary/order-summary";
import { SavedAddressPicker } from "../saved-address-picker/saved-address-picker";
import { checkoutFormSchema, NEW_ADDRESS, toCheckoutInput, type CheckoutFormValues } from "./checkout-schema";

interface CheckoutFormProps {
  items: CartItemDTO[];
  subtotal: number;
  addresses?: AddressDTO[];
  isPending?: boolean;
  /** Bag changes are still saving: wait, so the order uses the latest quantities. */
  isSaving?: boolean;

  onSubmit?: (input: CheckoutInput) => void | Promise<void>;
}

export function CheckoutForm({ items, subtotal, addresses = [], isPending, isSaving, onSubmit }: CheckoutFormProps) {
  const defaultAddress = addresses.find((a) => a.isDefault) ?? addresses[0];

  const form = useForm({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      addressId: defaultAddress?.id ?? NEW_ADDRESS,
      address: EMPTY_ADDRESS,
      saveAddress: true,
      note: "",
    },
  });
  const addressId = useWatch({ control: form.control, name: "addressId" });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(async (values) => onSubmit?.(toCheckoutInput(values)))}
        className="grid gap-10 lg:grid-cols-[1fr_22rem]"
        noValidate
      >
        <div className="space-y-6">
          <h2 className="text-2xl">Delivery address</h2>

          {addresses.length > 0 && <SavedAddressPicker addresses={addresses} />}

          {addressId === NEW_ADDRESS && (
            <div className="space-y-4">
              <AddressFields prefix="address" />
              <FormCheckbox<CheckoutFormValues> name="saveAddress" label="Save this address for next time" />
            </div>
          )}

          <FormTextarea<CheckoutFormValues>
            name="note"
            label="Order note (optional)"
            maxLength={500}
            placeholder="Delivery instructions, gift message…"
          />
        </div>

        <OrderSummary items={items} subtotal={subtotal}>
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
