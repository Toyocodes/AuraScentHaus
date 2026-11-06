import { Suspense } from "react";
import { OrderSection } from "@/components/admin/orders";
import { BackLink } from "@/components/common";
import { OrderDetailSkeleton } from "@/components/order";

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

async function Order({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <OrderSection orderId={id} />;
}
