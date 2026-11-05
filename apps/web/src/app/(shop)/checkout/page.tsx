import type { Metadata } from "next";
import { CheckoutForm } from "@/components/checkout";
import { PageHeader } from "@/components/common";
import { mockAddresses, mockCart } from "@/mocks";

export const metadata: Metadata = { title: "Checkout" };

/** Sample data for now. Later: `useCart()`, `useAddresses()` and `useInitializePayment()`. */
export default function CheckoutPage() {
  return (
    <div className="container-page space-y-10 py-16">
      <PageHeader eyebrow="Secure checkout" title="Checkout" />
      <CheckoutForm items={mockCart.items} subtotal={mockCart.subtotal} addresses={mockAddresses} />
    </div>
  );
}
