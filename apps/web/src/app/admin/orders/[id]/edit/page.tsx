import { Suspense } from "react";
import { notFound } from "next/navigation";
import { OnlineOrderEditForm, OrderForm } from "@/components/admin/orders";
import { BackLink, EmptyState, PageHeader } from "@/components/common";
import { Skeleton } from "@/components/ui/skeleton";
import { findMockOrder, mockCustomers, mockSellableVariants, mockUser } from "@/mocks";

export default function EditOrderPage({ params }: PageProps<"/admin/orders/[id]/edit">) {
  return (
    <Suspense fallback={<Skeleton className="h-96" />}>
      <Editor params={params} />
    </Suspense>
  );
}

/**
 * Sample data for now. Later: `useAdminOrder(id)` for the order, plus the same hooks as
 * the new-sale page, and `useUpdateOrder().mutateAsync({ orderId, input })` to save.
 */
async function Editor({ params }: { params: Promise<{ id: string }> }) {
  const order = findMockOrder((await params).id);
  if (!order) notFound();

  return (
    <div className="space-y-8">
      <BackLink href={`/admin/orders/${order.id}`}>Back to order</BackLink>
      <PageHeader eyebrow={order.channel === "IN_STORE" ? "In-store sale" : "Online order"} title={`Edit ${order.orderNumber}`} />

      {order.status === "CANCELLED" ? (
        <EmptyState title="This order was cancelled" description="Cancelled orders can't be edited." />
      ) : order.channel === "IN_STORE" ? (
        <OrderForm
          order={order}
          variants={mockSellableVariants}
          customers={mockCustomers}
          attendantName={mockUser.name?.split(" ")[0] ?? mockUser.email}
        />
      ) : (
        <OnlineOrderEditForm order={order} />
      )}
    </div>
  );
}
