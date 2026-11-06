import Link from "next/link";
import type { OrderDTO } from "@aurascenthaus/shared";
import { EmptyState } from "@/components/common";
import { Button } from "@/components/ui/button";
import { formatDate, formatNaira } from "@/lib/format";
import { OrderStatusBadge } from "../order-status-badge/order-status-badge";

/** The customer's order history. */
export function OrderList({ orders }: { orders: OrderDTO[] }) {
  if (orders.length === 0) {
    return (
      <EmptyState
        title="No orders yet"
        description="When you place an order, it will show up here."
        action={
          <Button asChild>
            <Link href="/shop">Start shopping</Link>
          </Button>
        }
      />
    );
  }

  return (
    <ul className="divide-y rounded-sm border">
      {orders.map((o) => (
        <li key={o.id}>
          <Link href={`/account/orders/${o.id}`} className="flex items-center justify-between gap-4 p-4 hover:bg-muted/50">
            <div>
              <p className="font-medium">{o.orderNumber}</p>
              <p className="text-sm text-muted-foreground">
                {formatDate(o.createdAt)} · {o.items.length} item(s)
              </p>
            </div>
            <div className="flex items-center gap-4">
              <OrderStatusBadge status={o.status} />
              <span>{formatNaira(o.total)}</span>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
