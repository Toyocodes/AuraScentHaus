"use client";

import { routes } from "../helper/routes";
import { useAxios } from "../useAxios";
import { setQuantityIn } from "./optimistic-cart";
import type { CartResponse, UpdateCartItemVariables } from "./types";
import { useCartWrite } from "./useCartWrite";

/** Set an item's quantity (for the + / − buttons). Quantity 0 removes it. Shows straight away. */
export function useUpdateCartItem() {
  const axios = useAxios();

  return useCartWrite<UpdateCartItemVariables>(
    async ({ variantId, quantity }) => {
      const { data } = await axios.patch<CartResponse>(routes.UPDATE_CART_ITEM(variantId), { quantity });
      return data.data;
    },
    (cart, { variantId, quantity }) => setQuantityIn(cart, variantId, quantity),
  );
}
