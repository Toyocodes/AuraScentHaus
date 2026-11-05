"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../helper/query-keys";
import { routes } from "../helper/routes";
import { useAxios } from "../useAxios";
import type { CartResponse } from "./types";

/**
 * The signed-in user's cart. It's stored on the server, so it's the same on every device.
 * Refetches when the tab regains focus, so changes made on another device show up.
 * Pass `enabled: false` for guests (they use the local guest cart in src/store).
 */
export function useCart({ enabled = true }: { enabled?: boolean } = {}) {
  const axios = useAxios();

  return useQuery({
    queryKey: queryKeys.cart.all,
    queryFn: async () => {
      const { data } = await axios.get<CartResponse>(routes.GET_CART);
      return data.data;
    },
    enabled,
    refetchOnWindowFocus: true,
  });
}
