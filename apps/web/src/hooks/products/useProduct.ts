"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../helper/query-keys";
import { routes } from "../helper/routes";
import { useAxios } from "../useAxios";
import type { ProductDetailResponse } from "./types";

/** One product by slug, for the product page. */
export function useProduct(slug: string | undefined) {
  const axios = useAxios();

  return useQuery({
    queryKey: queryKeys.products.detail(slug ?? ""),
    queryFn: async () => {
      const { data } = await axios.get<ProductDetailResponse>(routes.FETCH_SINGLE_PRODUCT(slug!));
      return data.data;
    },
    enabled: Boolean(slug),
  });
}
