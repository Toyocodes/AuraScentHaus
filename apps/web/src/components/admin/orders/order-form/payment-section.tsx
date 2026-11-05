"use client";

import { Banknote, CreditCard, Landmark } from "lucide-react";
import { PAYMENT_METHOD_LABELS } from "@aurascenthaus/shared";
import { FormCheckbox, FormChoiceCards } from "@/components/form";
import type { OrderFormValues } from "./order-form-schema";

const PAYMENT_OPTIONS = [
  { value: "CASH", label: PAYMENT_METHOD_LABELS.CASH, description: "Paid at the counter", icon: <Banknote /> },
  { value: "CARD", label: PAYMENT_METHOD_LABELS.CARD, description: "Debit or credit card", icon: <CreditCard /> },
  { value: "TRANSFER", label: PAYMENT_METHOD_LABELS.TRANSFER, description: "To the shop account", icon: <Landmark /> },
] as const;

interface PaymentSectionProps {
  /** The order is already paid (editing): payment can't be "un-received". */
  alreadyPaid?: boolean;
}

export function PaymentSection({ alreadyPaid }: PaymentSectionProps) {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl">Payment</h2>
      <FormChoiceCards<OrderFormValues> name="paymentMethod" options={PAYMENT_OPTIONS} />
      {alreadyPaid ? (
        <p className="text-sm text-muted-foreground">This order is already paid.</p>
      ) : (
        <FormCheckbox<OrderFormValues>
          name="isPaid"
          label="Payment received"
          description="Untick if, for example, a transfer hasn't arrived yet. The order stays “Awaiting payment” until you mark it paid."
        />
      )}
    </section>
  );
}
