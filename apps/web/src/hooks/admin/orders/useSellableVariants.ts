"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../../helper/query-keys";
import { routes } from "../../helper/routes";
import { useAxios } from "../../useAxios";
import type { SellableVariantsResponse } from "./types";

/** Every perfume size with its price and stock, for the in-store order form's product picker. */
export function useSellableVariants() {
  const axios = useAxios();

  return useQuery({
    queryKey: queryKeys.admin.sellableVariants(),
    queryFn: async () => {
      const { data } = await axios.get<SellableVariantsResponse>(routes.ADMIN_SELLABLE_VARIANTS);
      return data.data;
    },
  });
}
