import Link from "next/link";
import type { OrderDTO } from "@aurascenthaus/shared";
import { OrdersTable } from "../../orders/orders-table/orders-table";

export function RecentOrders({ orders }: { orders: OrderDTO[] }) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xl">Recent orders</h2>
        <Link href="/admin/orders" className="text-sm text-muted-foreground hover:text-foreground">
          All orders →
        </Link>
      </div>
      <OrdersTable orders={orders} />
    </section>
  );
}
