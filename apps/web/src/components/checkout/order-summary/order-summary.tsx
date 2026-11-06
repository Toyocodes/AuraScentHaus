import type { ReactNode } from "react";
import type { CartItemDTO } from "@aurascenthaus/shared";
import { SummaryRow } from "@/components/common";
import { Separator } from "@/components/ui/separator";
import { formatNaira } from "@/lib/format";

interface OrderSummaryProps {
  items: CartItemDTO[];
  subtotal: number;
  /** The pay button. */
  children?: ReactNode;
}

export function OrderSummary({ items, subtotal, children }: OrderSummaryProps) {
  return (
    <aside className="h-fit space-y-4 rounded-sm border bg-card p-6">
      <h2 className="text-xl">Order summary</h2>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">Your bag is empty.</p>
      ) : (
        <ul className="space-y-2 text-sm">
          {items.map((i) => (
            <li key={i.variantId} className="flex justify-between gap-4">
              <span>
                {i.product.name} · {i.sizeLabel} × {i.quantity}
              </span>
              <span>{formatNaira(i.lineTotal)}</span>
            </li>
          ))}
        </ul>
      )}
      <Separator />
      <SummaryRow label="Subtotal" value={formatNaira(subtotal)} strong />
      <p className="text-xs text-muted-foreground">Shipping is added on the payment page if it applies.</p>
      {children}
    </aside>
  );
}
