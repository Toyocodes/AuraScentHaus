import type { Metadata } from "next";
import { OrderForm } from "@/components/admin/orders";
import { BackLink, PageHeader } from "@/components/common";
import { mockCustomers, mockSellableVariants, mockUser } from "@/mocks";

export const metadata: Metadata = { title: "New in-store sale" };

/**
 * Sample data for now. Later:
 *   variants      → useSellableVariants()
 *   customers     → useCustomers()
 *   attendantName → first name from useMe() (display only; the API records the real one)
 *   onCreate      → useCreateOrder().mutateAsync, then go to /admin/orders/[id]
 */
export default function NewOrderPage() {
  const attendantName = mockUser.name?.split(" ")[0] ?? mockUser.email;

  return (
    <div className="space-y-8">
      <BackLink href="/admin/orders">All orders</BackLink>
      <PageHeader
        eyebrow="In-store sale"
        title="Record a sale"
        description="For customers who shop in person. Stock is updated as soon as you save."
      />
      <OrderForm variants={mockSellableVariants} customers={mockCustomers} attendantName={attendantName} />
    </div>
  );
}
