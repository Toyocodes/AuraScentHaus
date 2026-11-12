import Link from "next/link";
import { PAYMENT_METHOD_LABELS, type OrderDTO, type OrderStatus } from "@aurascenthaus/shared";
import { EmptyState } from "@/components/common";
import { isPickupOrder, OrderChannelBadge, OrderStatusBadge } from "@/components/order";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDateTime, formatNaira } from "@/lib/format";
import { nextForwardStatus, statusActionLabel } from "../order-status-control/order-status-control";

/** Name to show for the buyer: account name/email, else the walk-in's name. */
export function orderCustomerLabel(o: OrderDTO): string {
  return o.customer?.name ?? o.customer?.email ?? o.contact.name ?? "Walk-in customer";
}

interface OrdersTableProps {
  orders: OrderDTO[];
  /** Adds a "Next step" button to each row (e.g. Mark as processing). Leave out for a read-only list. */
  onAdvance?: (order: OrderDTO, status: OrderStatus) => void;
  /** The order whose step is being saved, to disable its button. */
  advancingId?: string | null;
}

export function OrdersTable({ orders, onAdvance, advancingId }: OrdersTableProps) {
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
          {onAdvance && <TableHead className="text-right">Next step</TableHead>}
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
            {onAdvance && (
              <TableCell className="text-right">
                <NextStepButton order={o} onAdvance={onAdvance} disabled={advancingId === o.id} />
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function NextStepButton({
  order,
  onAdvance,
  disabled,
}: {
  order: OrderDTO;
  onAdvance: (order: OrderDTO, status: OrderStatus) => void;
  disabled?: boolean;
}) {
  const next = nextForwardStatus(order.status);
  if (!next) return <span className="text-muted-foreground">–</span>;
  return (
    <Button size="xs" variant="outline" className="whitespace-nowrap" disabled={disabled} onClick={() => onAdvance(order, next)}>
      {statusActionLabel(next, isPickupOrder(order))}
    </Button>
  );
}
