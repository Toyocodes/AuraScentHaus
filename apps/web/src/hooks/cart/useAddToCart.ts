"use client";

import type { CartItemDTO } from "@aurascenthaus/shared";
import { routes } from "../helper/routes";
import { useAxios } from "../useAxios";
import { addTo } from "./optimistic-cart";
import type { CartResponse } from "./types";
import { useCartWrite } from "./useCartWrite";

export interface AddToCartVariables {
  variantId: string;
  quantity: number;
  /** How the line looks, so it can appear in the bag before the server confirms it. */
  preview: CartItemDTO;
}

/** Adds to the signed-in bag. The bag and its count update straight away. */
export function useAddToCart() {
  const axios = useAxios();

  return useCartWrite<AddToCartVariables>(
    async ({ variantId, quantity }) => {
      const { data } = await axios.post<CartResponse>(routes.ADD_TO_CART, { variantId, quantity });
      return data.data;
    },
    (cart, { preview, quantity }) => addTo(cart, preview, quantity),
  );
}
