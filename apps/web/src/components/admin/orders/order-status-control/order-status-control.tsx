"use client";

import { ORDER_STATUS_TRANSITIONS, type OrderStatus } from "@aurascenthaus/shared";
import { ConfirmDialog } from "@/components/common";
import { Button } from "@/components/ui/button";

/** The button for each next step, worded for delivery or for store pickup. */
export function statusActionLabel(to: OrderStatus, pickup = false): string {
  switch (to) {
    case "PROCESSING":
      return "Mark as processing";
    case "SHIPPED":
      return pickup ? "Mark ready to collect" : "Mark out for delivery";
    case "DELIVERED":
      return pickup ? "Mark collected" : "Mark delivered";
    case "CANCELLED":
      return "Cancel order";
    default:
      return to;
  }
}

/** The next step forward (not cancelling), for quick actions in the orders list. */
export const nextForwardStatus = (status: OrderStatus): OrderStatus | undefined =>
  ORDER_STATUS_TRANSITIONS[status].find((s) => s !== "CANCELLED");

interface OrderStatusControlProps {
  status: OrderStatus;
  /** Store pickup orders say "ready to collect" and "collected". */
  pickup?: boolean;
  /** Whether the order is paid, which decides what a cancellation means for the customer. */
  isPaid?: boolean;
  /** The customer's email, if they have an account. They're notified of every step. */
  customerEmail?: string | null;
  isPending?: boolean;
  /** Wire to `useUpdateOrderStatus().mutate({ orderId, status })`. */
  onChange?: (status: OrderStatus) => void | Promise<void>;
}

/** "Update status": buttons for the next allowed steps (see ORDER_STATUS_TRANSITIONS). */
export function OrderStatusControl({ status, pickup, isPaid, customerEmail, isPending, onChange }: OrderStatusControlProps) {
  const next = ORDER_STATUS_TRANSITIONS[status];
  if (next.length === 0) return null;

  const cancelNote = isPaid
    ? `The stock goes back on sale. Refund the customer from your Paystack dashboard.${customerEmail ? " We'll let them know the order is cancelled and a refund is on its way." : ""}`
    : "The stock goes back on sale.";

  return (
    <section className="space-y-3 rounded-sm border bg-card p-5">
      <div className="space-y-1">
        <h2 className="text-xl">Update status</h2>
        <p className="text-sm text-muted-foreground">
          {status === "PENDING"
            ? "This order hasn't been paid yet."
            : customerEmail
              ? "Move the order to its next step. The customer gets a notification each time, and an email when it's on its way, delivered or cancelled."
              : "Move the order to its next step."}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {next.map((to) =>
          to === "CANCELLED" ? (
            <ConfirmDialog
              key={to}
              trigger={
                <Button variant="outline" className="text-destructive" disabled={isPending}>
                  {statusActionLabel(to)}
                </Button>
              }
              title="Cancel this order?"
              description={cancelNote}
              confirmLabel="Cancel order"
              destructive
              isPending={isPending}
              onConfirm={() => onChange?.(to)}
            />
          ) : (
            <Button key={to} disabled={isPending} onClick={() => onChange?.(to)}>
              {statusActionLabel(to, pickup)}
            </Button>
          ),
        )}
      </div>
    </section>
  );
}
