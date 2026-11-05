"use client";

import { useFormContext, useWatch } from "react-hook-form";
import type { AddressDTO } from "@aurascenthaus/shared";
import { AddressText } from "@/components/address";
import { cn } from "@/lib/utils";
import { NEW_ADDRESS, type CheckoutFormValues } from "../checkout-form/checkout-schema";

/** Radio cards for saved addresses, plus "Use a new address". Bound to the form's `addressId`. */
export function SavedAddressPicker({ addresses }: { addresses: AddressDTO[] }) {
  const { control, setValue } = useFormContext<CheckoutFormValues>();
  const selected = useWatch({ control, name: "addressId" });

  const option = (id: string, children: React.ReactNode) => (
    <label
      key={id}
      className={cn(
        "cursor-pointer rounded-lg border p-4 text-sm",
        selected === id && "border-foreground ring-1 ring-foreground",
      )}
    >
      <input
        type="radio"
        name="addressId"
        className="sr-only"
        checked={selected === id}
        onChange={() => setValue("addressId", id, { shouldValidate: false })}
      />
      {children}
    </label>
  );

  return (
    <div className="grid gap-3" role="radiogroup" aria-label="Delivery address">
      {addresses.map((a) => option(a.id, <AddressText address={a} />))}
      {option(NEW_ADDRESS, "+ Use a new address")}
    </div>
  );
}
