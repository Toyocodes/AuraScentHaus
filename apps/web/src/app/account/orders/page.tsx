import type { Metadata } from "next";
import { PageHeader } from "@/components/common";
import { OrderList } from "@/components/order";
import { mockMyOrders } from "@/mocks";

export const metadata: Metadata = { title: "My orders" };

/** Sample data for now. Later: `useMyOrders()`. */
export default function OrdersPage() {
  return (
    <div className="space-y-6">
      <PageHeader as="h2" title="Orders" />
      <OrderList orders={mockMyOrders} />
    </div>
  );
}
