import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";
import { OrderStatusControl } from "@/components/admin/orders";
import { BackLink } from "@/components/common";
import { OrderDetail, OrderDetailSkeleton } from "@/components/order";
import { Button } from "@/components/ui/button";
import { findMockOrder } from "@/mocks";

export default function AdminOrderPage({ params }: PageProps<"/admin/orders/[id]">) {
  return (
    <div className="space-y-6">
      <BackLink href="/admin/orders">All orders</BackLink>
      <Suspense fallback={<OrderDetailSkeleton />}>
        <Order params={params} />
      </Suspense>
    </div>
  );
}

/** Sample data for now. Later: `useAdminOrder(id)` + `useUpdateOrderStatus()`. */
async function Order({ params }: { params: Promise<{ id: string }> }) {
  const order = findMockOrder((await params).id);
  if (!order) notFound();

  return (
    <div className="space-y-6">
      {order.customer && (
        <p className="text-sm text-muted-foreground">
          Customer: <span className="text-foreground">{order.customer.name ?? order.customer.email}</span> ·{" "}
          {order.customer.email}
        </p>
      )}
      <OrderStatusControl status={order.status} />
      <OrderDetail
        order={order}
        actions={
          order.status !== "CANCELLED" && (
            <Button variant="outline" asChild>
              <Link href={`/admin/orders/${order.id}/edit`}>
                <Pencil /> Edit order
              </Link>
            </Button>
          )
        }
      />
    </div>
  );
}
