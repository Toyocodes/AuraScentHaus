import type { Metadata } from "next";
import { CheckoutForm } from "@/components/checkout";
import { RequireAuth } from "@/components/auth";
import { PageHeader } from "@/components/common";
import { mockAddresses, mockCart } from "@/mocks";

export const metadata: Metadata = { title: "Checkout" };

/** Sample data for now. Later: `useCart()`, `useAddresses()` and `useInitializePayment()`. */
export default function CheckoutPage() {
  return (
    <div className="container-page space-y-10 py-16">
      <PageHeader eyebrow="Secure checkout" title="Checkout" />
      <RequireAuth>
        <CheckoutForm items={mockCart.items} subtotal={mockCart.subtotal} addresses={mockAddresses} />
      </RequireAuth>
    </div>
  );
}
