"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../helper/query-keys";
import { routes } from "../../helper/routes";
import { useAxios } from "../../useAxios";
import type { AdminOrderResponse, UpdateOrderStatusVariables } from "./types";

/**
 * Move an order along (PAID → PROCESSING → SHIPPED → DELIVERED) or cancel it.
 * Allowed moves are in ORDER_STATUS_TRANSITIONS. Cancelling returns the stock.
 */
export function useUpdateOrderStatus() {
  const axios = useAxios();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, status }: UpdateOrderStatusVariables) => {
      const { data } = await axios.patch<AdminOrderResponse>(routes.ADMIN_ORDER_STATUS(orderId), { status });
      return data.data;
    },
    onSuccess: (order) => {
      queryClient.setQueryData(queryKeys.admin.orders.detail(order.id), order);
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.orders.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.stats.all });
    },
  });
}
