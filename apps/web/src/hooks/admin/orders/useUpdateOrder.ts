"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../helper/query-keys";
import { routes } from "../../helper/routes";
import { useAxios } from "../../useAxios";
import type { AdminOrderResponse, UpdateOrderVariables } from "./types";

/**
 * Needs "orders:update". In-store orders: change items, customer, payment method, delivery,
 * note, or mark as paid. Online (Paystack) orders: only the note and delivery address.
 */
export function useUpdateOrder() {
  const axios = useAxios();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, input }: UpdateOrderVariables) => {
      const { data } = await axios.patch<AdminOrderResponse>(routes.ADMIN_ORDER(orderId), input);
      return data.data;
    },
    onSuccess: (order) => {
      queryClient.setQueryData(queryKeys.admin.orders.detail(order.id), order);
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.orders.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.stats.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.sellableVariants() });
    },
  });
}
