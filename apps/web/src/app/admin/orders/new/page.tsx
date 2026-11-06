import type { Metadata } from "next";
import { NewOrderSection } from "@/components/admin/orders";
import { BackLink, PageHeader } from "@/components/common";

export const metadata: Metadata = { title: "New in-store sale" };

export default function NewOrderPage() {
  return (
    <div className="space-y-8">
      <BackLink href="/admin/orders">All orders</BackLink>
      <PageHeader
        eyebrow="In-store sale"
        title="Record a sale"
        description="For customers who shop in person. Stock is updated as soon as you save."
      />
      <NewOrderSection />
    </div>
  );
}
