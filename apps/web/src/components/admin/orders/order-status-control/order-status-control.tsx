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
  isPending?: boolean;
  /** Wire to `useUpdateOrderStatus().mutate({ orderId, status })`. */
  onChange?: (status: OrderStatus) => void | Promise<void>;
}

/** Buttons for the next allowed statuses (see ORDER_STATUS_TRANSITIONS). */
export function OrderStatusControl({ status, isPending, onChange }: OrderStatusControlProps) {
  const next = ORDER_STATUS_TRANSITIONS[status];
  if (next.length === 0) return null;

  return (
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
            description="The stock goes back on sale. Refund the customer from your Paystack dashboard."
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
  );
}
