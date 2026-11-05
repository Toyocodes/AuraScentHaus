"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../helper/query-keys";
import { routes } from "../helper/routes";
import { useAxios } from "../useAxios";
import type { VerifyPaymentResponse } from "./types";

/**
 * For /checkout/callback. Paystack redirects back with ?reference=…, and the API
 * re-checks it with Paystack (never trust the redirect alone). Polls every 3s while
 * the payment is still pending.
 */
export function useVerifyPayment(reference: string | null | undefined) {
  const axios = useAxios();
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: queryKeys.payments.verify(reference ?? ""),
    queryFn: async () => {
      const { data } = await axios.get<VerifyPaymentResponse>(routes.VERIFY_PAYMENT(reference!));
      if (data.data.payment?.status === "SUCCESS") {
        // The paid items were removed from the cart, and there's a new order.
        void queryClient.invalidateQueries({ queryKey: queryKeys.cart.all });
        void queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
      }
      return data.data;
    },
    enabled: Boolean(reference),
    retry: 1,
    refetchInterval: (query) => (query.state.data?.payment?.status === "PENDING" ? 3000 : false),
  });
}
