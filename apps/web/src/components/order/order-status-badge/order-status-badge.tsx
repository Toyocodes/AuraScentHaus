import type { OrderStatus } from "@aurascenthaus/shared";
import { Badge } from "@/components/ui/badge";

type Variant = "default" | "secondary" | "outline" | "destructive";

export const ORDER_STATUS_LABELS: Record<OrderStatus, { label: string; variant: Variant }> = {
  PENDING: { label: "Awaiting payment", variant: "outline" },
  PAID: { label: "Paid", variant: "default" },
  PROCESSING: { label: "Processing", variant: "secondary" },
  SHIPPED: { label: "Shipped", variant: "secondary" },
  DELIVERED: { label: "Delivered", variant: "outline" },
  CANCELLED: { label: "Cancelled", variant: "destructive" },
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const s = ORDER_STATUS_LABELS[status];
  return <Badge variant={s.variant}>{s.label}</Badge>;
}
