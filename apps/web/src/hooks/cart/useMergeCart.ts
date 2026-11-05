"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useGuestCart } from "@/store/guest-cart";
import { queryKeys } from "../helper/query-keys";
import { routes } from "../helper/routes";
import { useAxios } from "../useAxios";
import type { CartResponse, MergeCartInput } from "./types";

/**
 * Call right after login. It moves the guest (localStorage) cart into the account cart,
 * then empties the guest cart. With no input, it sends the current guest cart.
 */
export function useMergeCart() {
  const axios = useAxios();
  const queryClient = useQueryClient();
  const clearGuestCart = useGuestCart((s) => s.clear);

  return useMutation({
    mutationFn: async (input?: MergeCartInput) => {
      const items =
        input?.items ?? useGuestCart.getState().items.map(({ variantId, quantity }) => ({ variantId, quantity }));
      const { data } = await axios.post<CartResponse>(routes.MERGE_CART, { items });
      return data.data;
    },
    onSuccess: (cart) => {
      clearGuestCart();
      queryClient.setQueryData(queryKeys.cart.all, cart);
    },
  });
}
