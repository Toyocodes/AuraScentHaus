"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../helper/query-keys";
import { routes } from "../helper/routes";
import { useAxios } from "../useAxios";
import type { CartResponse, UpdateCartItemVariables } from "./types";

/** Set an item's quantity (for the + / − buttons). Quantity 0 removes it. */
export function useUpdateCartItem() {
  const axios = useAxios();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ variantId, quantity }: UpdateCartItemVariables) => {
      const { data } = await axios.patch<CartResponse>(routes.UPDATE_CART_ITEM(variantId), { quantity });
      return data.data;
    },
    onSuccess: (cart) => queryClient.setQueryData(queryKeys.cart.all, cart),
  });
}
