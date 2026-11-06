import { Suspense } from "react";
import type { Metadata } from "next";
import { PageHeader } from "@/components/common";
import { ProductBrowser, ProductBrowserSkeleton } from "@/components/product";

export const metadata: Metadata = {
  title: "Shop",
  description: "Perfumes, home fragrance, body care, gifts and accessories from AuraScentHaus, delivered across Nigeria.",
  alternates: { canonical: "/shop" },
};

export default function ShopPage() {
  return (
    <div className="container-page space-y-10 py-16">
      <PageHeader
        eyebrow="The art of scent"
        title="The collection"
        description="Fragrance for you and your home, from bright citrus to the deepest oud."
      />
      {/* Filters live in the URL, which is only known at request time. */}
      <Suspense fallback={<ProductBrowserSkeleton />}>
        <ProductBrowser showGender />
      </Suspense>
    </div>
  );
}
