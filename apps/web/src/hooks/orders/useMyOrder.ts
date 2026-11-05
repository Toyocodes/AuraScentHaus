"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../helper/query-keys";
import { routes } from "../helper/routes";
import { useAxios } from "../useAxios";
import type { OrderResponse } from "./types";

/** One of the signed-in user's orders. */
export function useMyOrder(orderId: string | undefined) {
  const axios = useAxios();

  return useQuery({
    queryKey: queryKeys.orders.detail(orderId ?? ""),
    queryFn: async () => {
      const { data } = await axios.get<OrderResponse>(routes.FETCH_USER_ORDER(orderId!));
      return data.data;
    },
    enabled: Boolean(orderId),
  });
}
