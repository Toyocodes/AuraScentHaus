"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../helper/query-keys";
import { routes } from "../helper/routes";
import { useAxios } from "../useAxios";
import type { AddCartItemInput, CartResponse } from "./types";

export function useAddToCart() {
  const axios = useAxios();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: AddCartItemInput) => {
      const { data } = await axios.post<CartResponse>(routes.ADD_TO_CART, input);
      return data.data;
    },
    onSuccess: (cart) => queryClient.setQueryData(queryKeys.cart.all, cart),
  });
}
