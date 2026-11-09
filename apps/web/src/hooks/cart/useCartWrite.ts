"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CartDTO } from "@aurascenthaus/shared";
import { queryKeys } from "../helper/query-keys";
import { EMPTY_CART } from "./optimistic-cart";

/** Every change to the signed-in bag carries this key, so others can tell when the bag is saving. */
export const CART_WRITE_KEY = ["cart", "write"] as const;

/**
 * A change to the signed-in bag that shows on screen straight away (`preview`), then saves.
 *
 * - All bag changes share one queue, so the server receives them in the order they were clicked,
 *   however fast someone taps + or −.
 * - Only the reply to the last change in the queue is shown. Earlier replies are already out of
 *   date, and showing them would make the numbers jump back and forth.
 * - If that last change fails, the real bag is reloaded from the server, which undoes the preview.
 *   The caller shows why (e.g. "Only 2 left").
 */
export function useCartWrite<TVariables>(
  request: (variables: TVariables) => Promise<CartDTO>,
  preview: (cart: CartDTO, variables: TVariables) => CartDTO,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: CART_WRITE_KEY,
    scope: { id: "cart" },
    mutationFn: request,
    onMutate: async (variables) => {
      // A reload that's already on its way would overwrite the preview with the old bag.
      await queryClient.cancelQueries({ queryKey: queryKeys.cart.all });
      queryClient.setQueryData<CartDTO>(queryKeys.cart.all, (cart) => preview(cart ?? EMPTY_CART, variables));
    },
    onSettled: (cart, error) => {
      // This change is still counted here, so more than 1 means later clicks are queued.
      if (queryClient.isMutating({ mutationKey: CART_WRITE_KEY }) > 1) return;
      if (cart && !error) queryClient.setQueryData(queryKeys.cart.all, cart);
      else void queryClient.invalidateQueries({ queryKey: queryKeys.cart.all });
    },
  });
}
