import type { Metadata } from "next";
import { PaymentResult } from "@/components/checkout";
import { mockOrders } from "@/mocks";

export const metadata: Metadata = { title: "Payment status" };

/** Sample data for now. Later: read ?reference= and pass `useVerifyPayment(reference).data` as `order`. */
export default function CheckoutCallbackPage() {
  return (
    <div className="container-page py-16">
      <PaymentResult order={mockOrders[0]} />
    </div>
  );
}
