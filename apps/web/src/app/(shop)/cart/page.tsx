import type { Metadata } from "next";
import { CartView } from "@/components/cart";
import { PageHeader } from "@/components/common";
import { mockCart } from "@/mocks";

export const metadata: Metadata = { title: "Your bag" };

/** Sample data for now. Later: `useCart()` (signed in) or the guest cart store, plus the cart mutations. */
export default function CartPage() {
  return (
    <div className="container-page space-y-10 py-16">
      <PageHeader eyebrow="Shopping bag" title="Your bag" />
      <CartView items={mockCart.items} itemCount={mockCart.itemCount} subtotal={mockCart.subtotal} isSignedIn />
    </div>
  );
}
