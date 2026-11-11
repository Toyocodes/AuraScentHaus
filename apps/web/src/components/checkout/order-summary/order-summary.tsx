import type { ReactNode } from "react";
import type { CartItemDTO, DeliveryZoneDTO } from "@aurascenthaus/shared";
import { SummaryRow } from "@/components/common";
import { Separator } from "@/components/ui/separator";
import { formatNaira } from "@/lib/format";

/**
 * The delivery option for the order so far: the option that applies, or why there isn't one yet
 * (e.g. "Choose your area"), or null while the options load.
 */
export type DeliveryQuote = { zone: DeliveryZoneDTO } | { message: string } | null;

interface OrderSummaryProps {
  items: CartItemDTO[];
  subtotal: number;
  delivery: DeliveryQuote;
  /** The pay button. */
  children?: ReactNode;
}

export function OrderSummary({ items, subtotal, delivery, children }: OrderSummaryProps) {
  const zone = delivery && "zone" in delivery ? delivery.zone : null;

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
      <div className="space-y-2">
        <SummaryRow label="Subtotal" value={formatNaira(subtotal)} />
        {zone ? (
          <div className="space-y-0.5">
            <SummaryRow label={zone.kind === "PICKUP" ? zone.name : `Delivery · ${zone.name}`} value={formatNaira(zone.fee)} />
            {zone.deliveryTime && (
              <p className="text-xs text-muted-foreground">
                {zone.kind === "PICKUP" ? "Ready in" : "Arrives in"} {zone.deliveryTime}
              </p>
            )}
          </div>
        ) : (
          <SummaryRow label="Delivery" value={delivery ? "—" : "…"} />
        )}
        {delivery && "message" in delivery && <p className="text-xs text-muted-foreground">{delivery.message}</p>}
      </div>
      <Separator />
      <SummaryRow label="Total" value={zone ? formatNaira(subtotal + zone.fee) : "—"} strong />
      {children}
    </aside>
  );
}
