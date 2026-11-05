import Link from "next/link";
import type { Metadata } from "next";
import { Store } from "lucide-react";
import { OrdersTable, OrderStatusTabs } from "@/components/admin/orders";
import { PageHeader, SearchForm } from "@/components/common";
import { Button } from "@/components/ui/button";
import { mockOrders } from "@/mocks";

export const metadata: Metadata = { title: "Orders" };

/** Sample data for now. Later: `useAdminOrders({ status, search })`. */
export default function AdminOrdersPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Sales"
        title="Orders"
        description="Online orders arrive here automatically. Record in-store sales yourself."
        actions={
          <Button asChild>
            <Link href="/admin/orders/new">
              <Store /> New in-store sale
            </Link>
          </Button>
        }
      />
      <OrderStatusTabs />
      <SearchForm placeholder="Order number, customer, email or phone…" className="max-w-sm" />
      <OrdersTable orders={mockOrders} />
    </div>
  );
}
