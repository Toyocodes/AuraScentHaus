"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { queryKeys } from "../../helper/query-keys";
import { routes } from "../../helper/routes";
import { useAxios } from "../../useAxios";
import type { AdminOrderListParams, AdminOrderListResponse } from "./types";

export function useAdminOrders(params: AdminOrderListParams = {}) {
  const axios = useAxios();

  return useQuery({
    queryKey: queryKeys.admin.orders.list(params),
    queryFn: async () => {
      const { data } = await axios.get<AdminOrderListResponse>(routes.ADMIN_ORDERS, { params });
      return data;
    },
    placeholderData: keepPreviousData,
  });
}
