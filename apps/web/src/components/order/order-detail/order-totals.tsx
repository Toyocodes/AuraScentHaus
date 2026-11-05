import { ORDER_CHANNEL_LABELS, PAYMENT_METHOD_LABELS, type OrderDTO } from "@aurascenthaus/shared";
import { AddressText } from "@/components/address";
import { SummaryRow } from "@/components/common";
import { Separator } from "@/components/ui/separator";
import { formatNaira, humanize } from "@/lib/format";

/** Side panel: delivery, totals, payment and (for in-store sales) who served the customer. */
export function OrderTotals({ order }: { order: OrderDTO }) {
  return (
    <aside className="h-fit space-y-4 rounded-sm border bg-card p-6 text-sm">
      <div className="space-y-1">
        <p className="eyebrow">{order.shippingAddress ? "Deliver to" : "Fulfilment"}</p>
        {order.shippingAddress ? (
          <AddressText address={order.shippingAddress} />
        ) : (
          <>
            <p className="font-medium">Collected in store</p>
            {order.contact.name && <p className="text-muted-foreground">{order.contact.name}</p>}
            {order.contact.phone && <p className="text-muted-foreground">{order.contact.phone}</p>}
          </>
        )}
      </div>
      <Separator />
      <div className="space-y-1">
        <SummaryRow label="Subtotal" value={formatNaira(order.subtotal)} />
        <SummaryRow
          label="Shipping"
          value={order.shippingAddress ? (order.shippingFee ? formatNaira(order.shippingFee) : "Free") : "None"}
        />
        <SummaryRow label="Total" value={formatNaira(order.total)} strong />
      </div>
      <Separator />
      <div className="space-y-1">
        <SummaryRow label="Sold" value={ORDER_CHANNEL_LABELS[order.channel]} />
        <SummaryRow label="Paid with" value={PAYMENT_METHOD_LABELS[order.paymentMethod]} />
        {order.payment && <SummaryRow label="Payment" value={humanize(order.payment.status)} />}
        {order.attendant && <SummaryRow label="Attended by" value={order.attendant.name} />}
        {order.payment && <SummaryRow label="Reference" value={order.payment.reference} />}
      </div>
    </aside>
  );
}
