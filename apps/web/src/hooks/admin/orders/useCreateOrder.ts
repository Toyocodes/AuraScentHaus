"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../helper/query-keys";
import { routes } from "../../helper/routes";
import { useAxios } from "../../useAxios";
import type { AdminCreateOrderInput, AdminOrderResponse } from "./types";

/**
 * Needs "orders:create". Records an in-store sale and takes the stock.
 * The attendant isn't sent: the API uses the signed-in admin's first name.
 */
export function useCreateOrder() {
  const axios = useAxios();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: AdminCreateOrderInput) => {
      const { data } = await axios.post<AdminOrderResponse>(routes.ADMIN_ORDERS, input);
      return data.data;
    },
    onSuccess: (order) => {
      queryClient.setQueryData(queryKeys.admin.orders.detail(order.id), order);
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.orders.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.stats.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.sellableVariants() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.customers.all });
    },
  });
}
