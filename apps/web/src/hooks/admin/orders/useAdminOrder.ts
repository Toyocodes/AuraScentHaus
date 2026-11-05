"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../../helper/query-keys";
import { routes } from "../../helper/routes";
import { useAxios } from "../../useAxios";
import type { AdminOrderResponse } from "./types";

export function useAdminOrder(orderId: string | undefined) {
  const axios = useAxios();

  return useQuery({
    queryKey: queryKeys.admin.orders.detail(orderId ?? ""),
    queryFn: async () => {
      const { data } = await axios.get<AdminOrderResponse>(routes.ADMIN_ORDER(orderId!));
      return data.data;
    },
    enabled: Boolean(orderId),
  });
}
