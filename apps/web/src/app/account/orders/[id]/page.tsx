import { Suspense } from "react";
import { BackLink } from "@/components/common";
import { MyOrderSection, OrderDetailSkeleton } from "@/components/order";

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

async function Order({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <MyOrderSection orderId={id} />;
}
