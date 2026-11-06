"use client";

import { EmptyState, QueryError } from "@/components/common";
import { getErrorStatus } from "@/hooks/helper/errors";
import { useMyOrder } from "@/hooks/orders";
import { OrderDetail } from "../order-detail/order-detail";
import { OrderDetailSkeleton } from "../order-detail/order-detail-skeleton";

/** /account/orders/[id], connected. Someone else's order id gives "not found" (the API only returns your own). */
export function MyOrderSection({ orderId }: { orderId: string }) {
  const order = useMyOrder(orderId);

  if (order.isPending) return <OrderDetailSkeleton />;
  if (order.isError) {
    if (getErrorStatus(order.error) === 404) {
      return <EmptyState title="We can't find this order" description="It may belong to a different account." />;
    }
    return <QueryError error={order.error} onRetry={() => void order.refetch()} />;
  }

  return <OrderDetail order={order.data} />;
}
