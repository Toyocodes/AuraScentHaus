"use client";

import { routes } from "../helper/routes";
import { useAxios } from "../useAxios";
import { removeFrom } from "./optimistic-cart";
import type { CartResponse } from "./types";
import { useCartWrite } from "./useCartWrite";

/** Removes an item from the signed-in bag. It disappears straight away. */
export function useRemoveCartItem() {
  const axios = useAxios();

  return useCartWrite<string>(
    async (variantId) => {
      const { data } = await axios.delete<CartResponse>(routes.DELETE_CART_ITEM(variantId));
      return data.data;
    },
    removeFrom,
  );
}
