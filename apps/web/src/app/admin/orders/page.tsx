import Link from "next/link";
import type { Metadata } from "next";
import { Store } from "lucide-react";
import { OrdersSection } from "@/components/admin/orders";
import { PageHeader } from "@/components/common";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Orders" };

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
      <OrdersSection />
    </div>
  );
}
