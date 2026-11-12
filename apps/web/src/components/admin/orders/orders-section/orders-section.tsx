"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { OrderStatus } from "@aurascenthaus/shared";
import { Pagination, QueryError, SearchForm } from "@/components/common";
import { isPickupOrder } from "@/components/order";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminOrders, useUpdateOrderStatus } from "@/hooks/admin/orders";
import { usePermission } from "@/hooks/auth";
import { toastFailure } from "@/lib/toast-failure";
import { statusActionLabel } from "../order-status-control/order-status-control";
import { OrderStatusTabs } from "../order-status-tabs/order-status-tabs";
import { OrdersTable } from "../orders-table/orders-table";

const PAGE_SIZE = 20;

/** /admin/orders, connected: filter by status, search, and page through every order. */
export function OrdersSection() {
  const [status, setStatus] = useState<OrderStatus | undefined>();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const orders = useAdminOrders({ status, search: search || undefined, page, limit: PAGE_SIZE });
  const { can } = usePermission();
  const updateStatus = useUpdateOrderStatus();

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
          <OrdersTable
            orders={orders.data.data}
            advancingId={updateStatus.isPending ? updateStatus.variables?.orderId : null}
            onAdvance={
              can("orders:update")
                ? (order, next) =>
                    updateStatus
                      .mutateAsync({ orderId: order.id, status: next })
                      .then(() => void toast.success(`${order.orderNumber}: ${statusActionLabel(next, isPickupOrder(order)).replace(/^Mark (as )?/, "")}.`))
                      .catch(toastFailure("We couldn't update this order."))
                : undefined
            }
          />
          <Pagination page={orders.data.meta.page} totalPages={orders.data.meta.totalPages} onPageChange={setPage} />
        </>
      )}
    </>
  );
}
