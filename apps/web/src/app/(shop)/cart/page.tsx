import type { Metadata } from "next";
import { CartPageContent } from "@/components/cart";
import { PageHeader } from "@/components/common";

export const metadata: Metadata = { title: "Your bag" };

export default function CartPage() {
  return (
    <div className="container-page space-y-10 py-16">
      <PageHeader eyebrow="Shopping bag" title="Your bag" />
      <CartPageContent />
    </div>
  );
}
