"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { queryKeys } from "../../helper/query-keys";
import { routes } from "../../helper/routes";
import { useAxios } from "../../useAxios";
import type { CustomerListParams, CustomerListResponse } from "./types";

/** Needs "customers:read" (ADMIN and SUPER_ADMIN). */
export function useCustomers(params: CustomerListParams = {}) {
  const axios = useAxios();

  return useQuery({
    queryKey: queryKeys.admin.customers.list(params),
    queryFn: async () => {
      const { data } = await axios.get<CustomerListResponse>(routes.ADMIN_CUSTOMERS, { params });
      return data;
    },
    placeholderData: keepPreviousData,
  });
}
