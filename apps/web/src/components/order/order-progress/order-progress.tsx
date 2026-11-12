import { Check, X } from "lucide-react";
import type { OrderDTO, OrderStatus } from "@aurascenthaus/shared";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";

/** Store pickup orders say "Ready to collect" and "Collected" instead of shipping words. */
export const isPickupOrder = (order: Pick<OrderDTO, "delivery">) => order.delivery?.method === "PICKUP";

interface Step {
  status: OrderStatus | "PLACED";
  label: string;
  at: string | null;
}

function steps(order: OrderDTO): Step[] {
  const pickup = isPickupOrder(order);
  return [
    { status: "PLACED", label: "Order placed", at: order.createdAt },
    { status: "PAID", label: "Paid", at: order.paidAt },
    { status: "PROCESSING", label: "Being prepared", at: order.processingAt },
    { status: "SHIPPED", label: pickup ? "Ready to collect" : "Out for delivery", at: order.shippedAt },
    { status: "DELIVERED", label: pickup ? "Collected" : "Delivered", at: order.deliveredAt },
  ];
}

/** How far along each status is, so older orders (without step times) still show their progress. */
const RANK: Record<Step["status"], number> = { PLACED: 0, PENDING: 0, PAID: 1, PROCESSING: 2, SHIPPED: 3, DELIVERED: 4, CANCELLED: -1 };

/**
 * Where the order is: placed, paid, being prepared, out for delivery (or ready to collect), delivered.
 * Shown to the customer and the admin. Counter sales that were handed over at once don't need it.
 */
export function OrderProgress({ order }: { order: OrderDTO }) {
  const handedOverInStore = order.channel === "IN_STORE" && !order.shippingAddress && order.status === "DELIVERED";
  if (handedOverInStore) return null;

  if (order.status === "CANCELLED") {
    return (
      <div className="flex items-center gap-3 rounded-sm border border-destructive/30 bg-destructive/5 p-4 text-sm">
        <span className="grid size-7 shrink-0 place-items-center rounded-full bg-destructive text-white">
          <X className="size-4" />
        </span>
        <span>
          <span className="font-medium">Order cancelled</span>
          {order.cancelledAt && <span className="text-muted-foreground"> · {formatDateTime(order.cancelledAt)}</span>}
          {order.paidAt && <span className="block text-muted-foreground">The payment is refunded to the customer.</span>}
        </span>
      </div>
    );
  }

  const current = RANK[order.status];
  const list = steps(order);

  return (
    <ol aria-label="Order progress" className="grid gap-4 rounded-sm border bg-card p-5 sm:grid-cols-5 sm:gap-2">
      {list.map((step, i) => {
        const done = RANK[step.status] <= current;
        const isCurrent = RANK[step.status] === current;
        return (
          <li key={step.status} className="relative flex gap-3 sm:flex-col sm:items-center sm:gap-2 sm:text-center">
            {/* The line to the next step */}
            {i < list.length - 1 && (
              <span
                aria-hidden
                className={cn(
                  "absolute top-7 left-3.5 h-[calc(100%-0.75rem)] w-px sm:top-3.5 sm:left-[calc(50%+1rem)] sm:h-px sm:w-[calc(100%-2rem)]",
                  RANK[list[i + 1].status] <= current ? "bg-foreground" : "bg-border",
                )}
              />
            )}
            <span
              className={cn(
                "relative grid size-7 shrink-0 place-items-center rounded-full border text-xs",
                done ? "border-foreground bg-foreground text-background" : "bg-background text-muted-foreground",
                isCurrent && "ring-4 ring-gold/30",
              )}
            >
              {done ? <Check className="size-3.5" /> : i + 1}
            </span>
            <span className="space-y-0.5">
              <span className={cn("block text-sm", done ? "font-medium" : "text-muted-foreground")}>
                {step.label}
                <span className="sr-only">{done ? " (done)" : " (not yet)"}</span>
              </span>
              {done && step.at && <span className="block text-xs text-muted-foreground">{formatDateTime(step.at)}</span>}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
