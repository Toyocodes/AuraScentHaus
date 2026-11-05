"use client";

import { useMutation } from "@tanstack/react-query";
import { routes } from "../helper/routes";
import { useAxios } from "../useAxios";
import type { CheckoutInput, InitializePaymentResponse } from "./types";

/**
 * Creates a PENDING order from the cart and returns Paystack's `authorizationUrl`.
 * On success, send the browser there: `window.location.assign(data.authorizationUrl)`.
 */
export function useInitializePayment() {
  const axios = useAxios();

  return useMutation({
    mutationFn: async (input: CheckoutInput) => {
      const { data } = await axios.post<InitializePaymentResponse>(routes.INITIALIZE_PAYMENT, input);
      return data.data;
    },
  });
}
