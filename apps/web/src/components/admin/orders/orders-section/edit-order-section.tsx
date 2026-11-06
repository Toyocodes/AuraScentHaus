"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { AdminUpdateOrderInput, OrderDTO } from "@aurascenthaus/shared";
import { BackLink, EmptyState, PageHeader, QueryError } from "@/components/common";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminOrder, useUpdateOrder } from "@/hooks/admin/orders";
import { getErrorStatus } from "@/hooks/helper/errors";
import { toastAndRethrow } from "@/lib/toast-failure";
import { OnlineOrderEditForm } from "../online-order-edit-form/online-order-edit-form";
import { OrderForm } from "../order-form/order-form";
import { useOrderFormData } from "./order-form-data";

/** /admin/orders/[id]/edit, connected. In-store sales edit everything; online orders only delivery and note. */
export function EditOrderSection({ orderId }: { orderId: string }) {
  const router = useRouter();
  const order = useAdminOrder(orderId);
  const updateOrder = useUpdateOrder();

  if (order.isPending) return <Skeleton className="h-96" />;
  if (order.isError) {
    if (getErrorStatus(order.error) === 404) return <EmptyState title="We can't find this order" />;
    return <QueryError error={order.error} onRetry={() => void order.refetch()} />;
  }

  const o = order.data;
  const save = async (input: AdminUpdateOrderInput) => {
    await updateOrder.mutateAsync({ orderId, input }).catch(toastAndRethrow("We couldn't save this order."));
    toast.success("Order saved.");
    router.push(`/admin/orders/${orderId}`);
  };

  return (
    <div className="space-y-8">
      <BackLink href={`/admin/orders/${o.id}`}>Back to order</BackLink>
      <PageHeader eyebrow={o.channel === "IN_STORE" ? "In-store sale" : "Online order"} title={`Edit ${o.orderNumber}`} />

      {o.status === "CANCELLED" ? (
        <EmptyState title="This order was cancelled" description="Cancelled orders can't be edited." />
      ) : o.channel === "IN_STORE" ? (
        <InStoreEditor order={o} isSaving={updateOrder.isPending} onSave={save} />
      ) : (
        <OnlineOrderEditForm order={o} isPending={updateOrder.isPending} onSubmit={save} />
      )}
    </div>
  );
}

/** Separate so sizes and customers only load when they're needed. */
function InStoreEditor({
  order,
  isSaving,
  onSave,
}: {
  order: OrderDTO;
  isSaving: boolean;
  onSave: (input: AdminUpdateOrderInput) => Promise<void>;
}) {
  const data = useOrderFormData();

  if (data.isPending) return <Skeleton className="h-96" />;
  if (data.error) return <QueryError error={data.error} onRetry={data.refetch} />;

  return (
    <OrderForm
      order={order}
      variants={data.variants.data ?? []}
      attendantName={data.attendantName}
      isPending={isSaving}
      onUpdate={onSave}
    />
  );
}
