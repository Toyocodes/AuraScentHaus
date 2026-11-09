"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../helper/query-keys";
import { routes } from "../helper/routes";
import { useAxios } from "../useAxios";
import type { CartResponse } from "./types";
import { CART_WRITE_KEY } from "./useCartWrite";

/**
 * The signed-in user's cart. It's stored on the server, so it's the same on every device.
 * Refetches when the tab regains focus, so changes made on another device show up, but not while
 * a change is still saving (that would briefly bring back the old bag).
 * Pass `enabled: false` for guests (they use the local guest cart in src/store).
 */
export function useCart({ enabled = true }: { enabled?: boolean } = {}) {
  const axios = useAxios();
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: queryKeys.cart.all,
    queryFn: async () => {
      const { data } = await axios.get<CartResponse>(routes.GET_CART);
      return data.data;
    },
    enabled,
    refetchOnWindowFocus: () => queryClient.isMutating({ mutationKey: CART_WRITE_KEY }) === 0,
  });
}
