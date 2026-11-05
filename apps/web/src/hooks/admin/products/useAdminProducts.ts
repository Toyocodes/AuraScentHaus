"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { queryKeys } from "../../helper/query-keys";
import { routes } from "../../helper/routes";
import { useAxios } from "../../useAxios";
import type { AdminProductListParams, AdminProductListResponse } from "./types";

export function useAdminProducts(params: AdminProductListParams = {}) {
  const axios = useAxios();

  return useQuery({
    queryKey: queryKeys.admin.products.list(params),
    queryFn: async () => {
      const { data } = await axios.get<AdminProductListResponse>(routes.ADMIN_PRODUCTS, { params });
      return data;
    },
    placeholderData: keepPreviousData,
  });
}
