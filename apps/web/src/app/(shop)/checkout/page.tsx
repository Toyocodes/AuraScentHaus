import type { Metadata } from "next";
import { RequireAuth } from "@/components/auth";
import { CheckoutPageContent } from "@/components/checkout";
import { PageHeader } from "@/components/common";

export const metadata: Metadata = { title: "Checkout" };

export default function CheckoutPage() {
  return (
    <div className="container-page space-y-10 py-16">
      <PageHeader eyebrow="Secure checkout" title="Checkout" />
      <RequireAuth>
        <CheckoutPageContent />
      </RequireAuth>
    </div>
  );
}
