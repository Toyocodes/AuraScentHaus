"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../../helper/query-keys";
import { routes } from "../../helper/routes";
import { useAxios } from "../../useAxios";
import type { AdminProductResponse } from "./types";

/** One product by id, with its variants and images, for the product editor. */
export function useAdminProduct(productId: string | undefined) {
  const axios = useAxios();

  return useQuery({
    queryKey: queryKeys.admin.products.detail(productId ?? ""),
    queryFn: async () => {
      const { data } = await axios.get<AdminProductResponse>(routes.ADMIN_PRODUCT(productId!));
      return data.data;
    },
    enabled: Boolean(productId),
  });
}
