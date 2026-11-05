import Link from "next/link";
import { PAYMENT_METHOD_LABELS, type OrderDTO } from "@aurascenthaus/shared";
import { EmptyState } from "@/components/common";
import { OrderChannelBadge, OrderStatusBadge } from "@/components/order";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDateTime, formatNaira } from "@/lib/format";

/** Name to show for the buyer: account name/email, else the walk-in's name. */
export function orderCustomerLabel(o: OrderDTO): string {
  return o.customer?.name ?? o.customer?.email ?? o.contact.name ?? "Walk-in customer";
}

export function OrdersTable({ orders }: { orders: OrderDTO[] }) {
  if (orders.length === 0) return <EmptyState title="No orders yet" className="py-8" />;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Order</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Sold</TableHead>
          <TableHead>Paid with</TableHead>
          <TableHead>Attended by</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Total</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((o) => (
          <TableRow key={o.id}>
            <TableCell>
              <Link href={`/admin/orders/${o.id}`} className="font-medium hover:underline">
                {o.orderNumber}
              </Link>
            </TableCell>
            <TableCell>{orderCustomerLabel(o)}</TableCell>
            <TableCell>
              <OrderChannelBadge channel={o.channel} />
            </TableCell>
            <TableCell className="text-muted-foreground">{PAYMENT_METHOD_LABELS[o.paymentMethod]}</TableCell>
            <TableCell className="text-muted-foreground">{o.attendant?.name ?? "–"}</TableCell>
            <TableCell className="whitespace-nowrap text-muted-foreground">{formatDateTime(o.createdAt)}</TableCell>
            <TableCell>
              <OrderStatusBadge status={o.status} />
            </TableCell>
            <TableCell className="text-right tabular-nums">{formatNaira(o.total)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
