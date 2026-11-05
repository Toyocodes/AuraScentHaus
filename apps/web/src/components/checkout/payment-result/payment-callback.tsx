"use client";

import { useSearchParams } from "next/navigation";
import { getErrorMessage, getErrorStatus } from "@/hooks/helper/errors";
import { useVerifyPayment } from "@/hooks/payments";
import { PaymentResult } from "./payment-result";

/**
 * /checkout/callback, connected. Paystack sends the shopper back with ?reference=… (or ?trxref=…),
 * and the API re-checks that payment with Paystack before showing the result.
 * Needs a <Suspense> boundary above it (it reads the URL).
 */
export function PaymentCallback() {
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference") ?? searchParams.get("trxref");
  const { data: order, isError, error } = useVerifyPayment(reference);

  if (!reference) return <PaymentResult error="This link is missing its payment reference. Check your orders page instead." />;

  if (isError) {
    const message =
      getErrorStatus(error) === 404
        ? "We couldn't find this payment on your account. If you were charged, contact us with your order number."
        : getErrorMessage(error);
    return <PaymentResult error={message} />;
  }

  return <PaymentResult order={order} />;
}
