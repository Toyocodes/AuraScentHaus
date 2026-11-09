"use client";

import Link from "next/link";
import { Pencil } from "lucide-react";
import { toast } from "sonner";
import { EmptyState, QueryError } from "@/components/common";
import { OrderDetail, OrderDetailSkeleton } from "@/components/order";
import { Button } from "@/components/ui/button";
import { useAdminOrder, useUpdateOrderStatus } from "@/hooks/admin/orders";
import { usePermission } from "@/hooks/auth";
import { getErrorStatus } from "@/hooks/helper/errors";
import { humanize } from "@/lib/format";
import { toastFailure } from "@/lib/toast-failure";
import { OrderStatusControl } from "../order-status-control/order-status-control";

/** /admin/orders/[id], connected: full order details and status changes. */
export function OrderSection({ orderId }: { orderId: string }) {
  const { can } = usePermission();
  const order = useAdminOrder(orderId);
  const updateStatus = useUpdateOrderStatus();

  if (order.isPending) return <OrderDetailSkeleton />;
  if (order.isError) {
    if (getErrorStatus(order.error) === 404) return <EmptyState title="We can't find this order" />;
    return <QueryError error={order.error} onRetry={() => void order.refetch()} />;
  }

  const o = order.data;
  const canUpdate = can("orders:update");

  return (
    <div className="space-y-6">
      {o.customer && (
        <p className="text-sm text-muted-foreground">
          Customer: <span className="text-foreground">{o.customer.name ?? o.customer.email}</span> · {o.customer.email}
        </p>
      )}
      {canUpdate && (
        <OrderStatusControl
          status={o.status}
          isPaid={o.paidAt !== null}
          customerEmail={o.customer?.email}
          isPending={updateStatus.isPending}
          onChange={(status) =>
            updateStatus
              .mutateAsync({ orderId, status })
              .then(() => void toast.success(`Order marked ${humanize(status).toLowerCase()}.`))
              .catch(toastFailure("We couldn't update this order."))
          }
        />
      )}
      <OrderDetail
        order={o}
        actions={
          canUpdate &&
          o.status !== "CANCELLED" && (
            <Button variant="outline" asChild>
              <Link href={`/admin/orders/${o.id}/edit`}>
                <Pencil /> Edit order
              </Link>
            </Button>
          )
        }
      />
    </div>
  );
}
