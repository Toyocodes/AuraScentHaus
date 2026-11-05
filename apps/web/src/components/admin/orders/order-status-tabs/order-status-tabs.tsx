"use client";

import { ORDER_STATUSES, type OrderStatus } from "@aurascenthaus/shared";
import { ORDER_STATUS_LABELS } from "@/components/order";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ALL = "ALL";

interface OrderStatusTabsProps {
  /** undefined = all orders. */
  value?: OrderStatus;
  onChange?: (status: OrderStatus | undefined) => void;
}

/** Filter the orders list by status. */
export function OrderStatusTabs({ value, onChange }: OrderStatusTabsProps) {
  return (
    <Tabs
      value={value ?? ALL}
      onValueChange={(v) => onChange?.(v === ALL ? undefined : (v as OrderStatus))}
      className="overflow-x-auto"
    >
      <TabsList>
        <TabsTrigger value={ALL}>All</TabsTrigger>
        {ORDER_STATUSES.map((s) => (
          <TabsTrigger key={s} value={s}>
            {ORDER_STATUS_LABELS[s].label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
