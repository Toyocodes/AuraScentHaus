"use client";

import { useState } from "react";
import type { OrderStatus } from "@aurascenthaus/shared";
import { Pagination, QueryError, SearchForm } from "@/components/common";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminOrders } from "@/hooks/admin/orders";
import { OrderStatusTabs } from "../order-status-tabs/order-status-tabs";
import { OrdersTable } from "../orders-table/orders-table";

const PAGE_SIZE = 20;

/** /admin/orders, connected: filter by status, search, and page through every order. */
export function OrdersSection() {
  const [status, setStatus] = useState<OrderStatus | undefined>();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const orders = useAdminOrders({ status, search: search || undefined, page, limit: PAGE_SIZE });

  return (
    <>
      <OrderStatusTabs
        value={status}
        onChange={(next) => {
          setStatus(next);
          setPage(1);
        }}
      />
      <SearchForm
        placeholder="Order number, customer, email or phone…"
        className="max-w-sm"
        onSearch={(text) => {
          setSearch(text);
          setPage(1);
        }}
      />
      {orders.isPending ? (
        <Skeleton className="h-64" />
      ) : orders.isError ? (
        <QueryError error={orders.error} onRetry={() => void orders.refetch()} />
      ) : (
        <>
          <OrdersTable orders={orders.data.data} />
          <Pagination page={orders.data.meta.page} totalPages={orders.data.meta.totalPages} onPageChange={setPage} />
        </>
      )}
    </>
  );
}
