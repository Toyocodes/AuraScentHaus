"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../helper/query-keys";
import { routes } from "../helper/routes";
import { useAxios } from "../useAxios";
import type { CartResponse } from "./types";

export function useClearCart() {
  const axios = useAxios();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data } = await axios.delete<CartResponse>(routes.CLEAR_CART);
      return data.data;
    },
    onSuccess: (cart) => queryClient.setQueryData(queryKeys.cart.all, cart),
  });
}
