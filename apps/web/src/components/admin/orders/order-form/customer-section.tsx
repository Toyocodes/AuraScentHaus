"use client";

import { UserPlus, UserRound, Users } from "lucide-react";
import { useFormContext, useWatch } from "react-hook-form";
import type { UserDTO } from "@aurascenthaus/shared";
import { FormChoiceCards, FormInput, FormSelect } from "@/components/form";
import type { OrderFormValues } from "./order-form-schema";

const CUSTOMER_OPTIONS = [
  { value: "walk_in", label: "Walk-in", description: "No account needed", icon: <UserRound /> },
  { value: "existing", label: "Existing customer", description: "Already on file", icon: <Users /> },
  { value: "new", label: "New customer", description: "Save them for next time", icon: <UserPlus /> },
] as const;

interface CustomerSectionProps {
  customers: Pick<UserDTO, "id" | "email" | "name">[];
}

export function CustomerSection({ customers }: CustomerSectionProps) {
  const { control } = useFormContext<OrderFormValues>();
  const type = useWatch({ control, name: "customerType" });
  const customerOptions = customers.map((c) => ({ value: c.id, label: c.name ? `${c.name} · ${c.email}` : c.email }));

  return (
    <section className="space-y-4">
      <h2 className="text-2xl">Customer</h2>
      <FormChoiceCards<OrderFormValues> name="customerType" options={CUSTOMER_OPTIONS} />

      {type === "existing" && (
        <FormSelect<OrderFormValues>
          name="customerId"
          label="Customer"
          placeholder={customers.length ? "Choose a customer" : "No customers yet"}
          options={customerOptions}
        />
      )}
      {type === "new" && (
        <div className="grid gap-4 sm:grid-cols-2">
          <FormInput<OrderFormValues> name="newCustomer.name" label="Full name" autoComplete="off" />
          <FormInput<OrderFormValues> name="newCustomer.phone" label="Phone (optional)" type="tel" autoComplete="off" />
          <FormInput<OrderFormValues>
            name="newCustomer.email"
            label="Email"
            type="email"
            autoComplete="off"
            itemClassName="sm:col-span-2"
            description="They can sign in with this email to see the order."
          />
        </div>
      )}
      {type === "walk_in" && (
        <div className="grid gap-4 sm:grid-cols-2">
          <FormInput<OrderFormValues> name="walkIn.name" label="Name (optional)" autoComplete="off" />
          <FormInput<OrderFormValues> name="walkIn.phone" label="Phone (optional)" type="tel" autoComplete="off" />
        </div>
      )}
    </section>
  );
}
