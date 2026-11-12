import type { ReactNode } from "react";
import type { OrderDTO } from "@aurascenthaus/shared";
import { formatDateTime } from "@/lib/format";
import { OrderChannelBadge } from "../order-channel-badge/order-channel-badge";
import { OrderProgress } from "../order-progress/order-progress";
import { OrderStatusBadge } from "../order-status-badge/order-status-badge";
import { OrderItems } from "./order-items";
import { OrderTotals } from "./order-totals";

interface OrderDetailProps {
  order: OrderDTO;
  /** Extra buttons beside the title (e.g. "Edit order" in admin). */
  actions?: ReactNode;
}

/** Used by both the customer's order page and the admin order page. */
export function OrderDetail({ order, actions }: OrderDetailProps) {
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_20rem]">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-3xl">Order {order.orderNumber}</h2>
            <OrderStatusBadge status={order.status} />
            <OrderChannelBadge channel={order.channel} />
          </div>
          {actions}
        </div>
        <p className="text-sm text-muted-foreground">Placed {formatDateTime(order.createdAt)}</p>
        <OrderProgress order={order} />
        <OrderItems items={order.items} />
        {order.note && (
          <p className="text-sm">
            <span className="text-muted-foreground">Note:</span> {order.note}
          </p>
        )}
      </div>
      <OrderTotals order={order} />
    </div>
  );
}
