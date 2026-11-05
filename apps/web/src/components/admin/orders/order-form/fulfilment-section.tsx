"use client";

import { Store, Truck } from "lucide-react";
import { useFormContext, useWatch } from "react-hook-form";
import { AddressFields } from "@/components/address";
import { FormChoiceCards } from "@/components/form";
import type { OrderFormValues } from "./order-form-schema";

const FULFILMENT_OPTIONS = [
  { value: "collected", label: "Collected in store", description: "They took it with them", icon: <Store /> },
  { value: "delivery", label: "Deliver to customer", description: "We'll send it to an address", icon: <Truck /> },
] as const;

export function FulfilmentSection({ disabled }: { disabled?: boolean }) {
  const { control } = useFormContext<OrderFormValues>();
  const fulfilment = useWatch({ control, name: "fulfilment" });

  return (
    <section className="space-y-4">
      <h2 className="text-2xl">Fulfilment</h2>
      <FormChoiceCards<OrderFormValues>
        name="fulfilment"
        options={FULFILMENT_OPTIONS}
        className="sm:grid-cols-2"
        disabled={disabled}
      />
      {disabled && (
        <p className="text-sm text-muted-foreground">This order has shipped or been collected, so this can no longer change.</p>
      )}
      {fulfilment === "delivery" && !disabled && <AddressFields prefix="delivery" />}
    </section>
  );
}
