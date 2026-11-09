"use client";

import { ORDER_STATUS_TRANSITIONS, type OrderStatus } from "@aurascenthaus/shared";
import { ConfirmDialog } from "@/components/common";
import { Button } from "@/components/ui/button";

const ACTION_LABELS: Partial<Record<OrderStatus, string>> = {
  PROCESSING: "Mark processing",
  SHIPPED: "Mark shipped",
  DELIVERED: "Mark delivered",
  CANCELLED: "Cancel order",
};

interface OrderStatusControlProps {
  status: OrderStatus;
  /** Whether the order is paid, which decides what a cancellation means for the customer. */
  isPaid?: boolean;
  /** The customer's email, if they have an account. They're emailed when it ships, arrives or is cancelled. */
  customerEmail?: string | null;
  isPending?: boolean;
  /** Wire to `useUpdateOrderStatus().mutate({ orderId, status })`. */
  onChange?: (status: OrderStatus) => void | Promise<void>;
}

/** Buttons for the next allowed statuses (see ORDER_STATUS_TRANSITIONS). */
export function OrderStatusControl({ status, isPaid, customerEmail, isPending, onChange }: OrderStatusControlProps) {
  const next = ORDER_STATUS_TRANSITIONS[status];
  if (next.length === 0) return null;

  const cancelNote = isPaid
    ? `The stock goes back on sale. Refund the customer from your Paystack dashboard.${customerEmail ? " We'll email them that the order is cancelled and a refund is on its way." : ""}`
    : "The stock goes back on sale.";

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
      {next.map((to) =>
        to === "CANCELLED" ? (
          <ConfirmDialog
            key={to}
            trigger={
              <Button variant="destructive" disabled={isPending}>
                {ACTION_LABELS[to]}
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
            {ACTION_LABELS[to] ?? to}
          </Button>
        ),
      )}
      </div>
      {customerEmail && (next.includes("SHIPPED") || next.includes("DELIVERED")) && (
        <p className="text-xs text-muted-foreground">We email the customer when you mark it shipped or delivered.</p>
      )}
    </div>
  );
}
