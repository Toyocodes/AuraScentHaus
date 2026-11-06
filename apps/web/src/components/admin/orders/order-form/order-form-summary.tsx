"use client";

import type { ReactNode } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { PAYMENT_METHOD_LABELS, type SellableVariantDTO } from "@aurascenthaus/shared";
import { SummaryRow } from "@/components/common";
import { Separator } from "@/components/ui/separator";
import { formatNaira } from "@/lib/format";
import type { OrderFormValues } from "./order-form-schema";

interface OrderFormSummaryProps {
  variants: SellableVariantDTO[];
  /** The attendant field and submit button. */
  children?: ReactNode;
}

/** Live receipt: updates as items and quantities change. */
export function OrderFormSummary({ variants, children }: OrderFormSummaryProps) {
  const { control } = useFormContext<OrderFormValues>();
  const [lines, paymentMethod, fulfilment] = useWatch({ control, name: ["lines", "paymentMethod", "fulfilment"] });

  const rows = (lines ?? []).flatMap((l) => {
    const v = variants.find((x) => x.variantId === l.variantId);
    const quantity = Number(l.quantity) || 0;
    return v && quantity > 0 ? [{ key: v.variantId, label: `${v.productName} · ${v.sizeLabel} × ${quantity}`, total: v.price * quantity }] : [];
  });
  const total = rows.reduce((sum, r) => sum + r.total, 0);

  return (
    <aside className="h-fit space-y-5 rounded-sm border bg-card p-6 lg:sticky lg:top-6">
      <h2 className="text-2xl">Summary</h2>
      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">Add a perfume to see the total.</p>
      ) : (
        <ul className="space-y-2 text-sm">
          {rows.map((r, i) => (
            <li key={`${r.key}-${i}`} className="flex justify-between gap-4">
              <span>{r.label}</span>
              <span className="tabular-nums">{formatNaira(r.total)}</span>
            </li>
          ))}
        </ul>
      )}
      <Separator />
      <SummaryRow label="Paid with" value={PAYMENT_METHOD_LABELS[paymentMethod]} />
      <SummaryRow label="Fulfilment" value={fulfilment === "delivery" ? "Delivery" : "Collected in store"} />
      <SummaryRow label="Total" value={formatNaira(total)} strong />
      <Separator />
      {children}
    </aside>
  );
}
