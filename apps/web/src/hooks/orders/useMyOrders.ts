"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { queryKeys } from "../helper/query-keys";
import { routes } from "../helper/routes";
import { useAxios } from "../useAxios";
import type { MyOrdersParams, OrderListResponse } from "./types";

/** The signed-in user's order history. */
export function useMyOrders(params: MyOrdersParams = {}) {
  const axios = useAxios();

  return useQuery({
    queryKey: queryKeys.orders.list(params),
    queryFn: async () => {
      const { data } = await axios.get<OrderListResponse>(routes.FETCH_USER_ORDERS, { params });
      return data;
    },
    placeholderData: keepPreviousData,
  });
}
