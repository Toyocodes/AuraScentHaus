import type { Metadata } from "next";
import { PageHeader } from "@/components/common";
import { MyOrdersSection } from "@/components/order";

export const metadata: Metadata = { title: "My orders" };

export default function OrdersPage() {
  return (
    <div className="space-y-6">
      <PageHeader as="h2" title="Orders" />
      <MyOrdersSection />
    </div>
  );
}
