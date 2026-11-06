"use client";

import { useState } from "react";
import { Pagination, QueryError } from "@/components/common";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyOrders } from "@/hooks/orders";
import { OrderList } from "../order-list/order-list";

const PAGE_SIZE = 10;

/** /account/orders, connected: the signed-in customer's orders, newest first. */
export function MyOrdersSection() {
  const [page, setPage] = useState(1);
  const orders = useMyOrders({ page, limit: PAGE_SIZE });

  if (orders.isPending) return <Skeleton className="h-64" />;
  if (orders.isError) return <QueryError error={orders.error} onRetry={() => void orders.refetch()} />;

  return (
    <div className="space-y-6">
      <OrderList orders={orders.data.data} />
      <Pagination page={orders.data.meta.page} totalPages={orders.data.meta.totalPages} onPageChange={setPage} />
    </div>
  );
}
