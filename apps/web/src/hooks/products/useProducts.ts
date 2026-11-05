"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { queryKeys } from "../helper/query-keys";
import { routes } from "../helper/routes";
import { useAxios } from "../useAxios";
import type { ProductListParams, ProductListResponse } from "./types";

/** Paginated storefront products. Keeps the previous page on screen while the next one loads. */
export function useProducts(params: ProductListParams = {}, options: { enabled?: boolean } = {}) {
  const axios = useAxios();

  return useQuery({
    queryKey: queryKeys.products.list(params),
    queryFn: async () => {
      const { data } = await axios.get<ProductListResponse>(routes.FETCH_ALL_PRODUCTS, { params });
      return data;
    },
    placeholderData: keepPreviousData,
    enabled: options.enabled,
  });
}
