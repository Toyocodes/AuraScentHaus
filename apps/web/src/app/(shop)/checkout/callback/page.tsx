import { Suspense } from "react";
import type { Metadata } from "next";
import { RequireAuth } from "@/components/auth";
import { PaymentCallback, PaymentResult } from "@/components/checkout";

export const metadata: Metadata = { title: "Payment status" };

/** Paystack sends the shopper here after paying. */
export default function CheckoutCallbackPage() {
  return (
    <div className="container-page py-16">
      <RequireAuth loading={<PaymentResult />}>
        {/* ?reference= is only known at request time. */}
        <Suspense fallback={<PaymentResult />}>
          <PaymentCallback />
        </Suspense>
      </RequireAuth>
    </div>
  );
}
