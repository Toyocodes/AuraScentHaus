"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { QueryError } from "@/components/common";
import { Skeleton } from "@/components/ui/skeleton";
import { useCreateOrder } from "@/hooks/admin/orders";
import { toastAndRethrow } from "@/lib/toast-failure";
import { OrderForm } from "../order-form/order-form";
import { useOrderFormData } from "./order-form-data";

/** /admin/orders/new, connected: record an in-store sale, then open it. */
export function NewOrderSection() {
  const router = useRouter();
  const data = useOrderFormData();
  const createOrder = useCreateOrder();

  if (data.isPending) return <Skeleton className="h-96" />;
  if (data.error) return <QueryError error={data.error} onRetry={data.refetch} />;

  return (
    <OrderForm
      variants={data.variants.data ?? []}
      attendantName={data.attendantName}
      isPending={createOrder.isPending}
      onCreate={async (input) => {
        const order = await createOrder.mutateAsync(input).catch(toastAndRethrow("We couldn't record this sale."));
        toast.success(`Sale ${order.orderNumber} recorded.`);
        router.push(`/admin/orders/${order.id}`);
      }}
    />
  );
}
