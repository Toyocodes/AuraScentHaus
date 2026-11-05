import { Suspense } from "react";
import { notFound } from "next/navigation";
import { BackLink } from "@/components/common";
import { OrderDetail, OrderDetailSkeleton } from "@/components/order";
import { findMockOrder } from "@/mocks";

export default function AccountOrderPage({ params }: PageProps<"/account/orders/[id]">) {
  return (
    <div className="space-y-6">
      <BackLink href="/account/orders">All orders</BackLink>
      <Suspense fallback={<OrderDetailSkeleton />}>
        <Order params={params} />
      </Suspense>
    </div>
  );
}

/** Sample data for now. Later: `useMyOrder(id)`. */
async function Order({ params }: { params: Promise<{ id: string }> }) {
  const order = findMockOrder((await params).id);
  if (!order) notFound();
  return <OrderDetail order={order} />;
}
