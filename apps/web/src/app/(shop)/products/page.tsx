import { Suspense } from "react";
import type { Metadata } from "next";
import { PageHeader } from "@/components/common";
import { ProductBrowser, ProductBrowserSkeleton } from "@/components/product";

export const metadata: Metadata = { title: "Shop all perfumes" };

export default function ProductsPage() {
  return (
    <div className="container-page space-y-10 py-16">
      <PageHeader
        eyebrow="The collection"
        title="All perfumes"
        description="Every fragrance in the house, from bright citrus to the deepest oud."
      />
      {/* Filters live in the URL, which is only known at request time. */}
      <Suspense fallback={<ProductBrowserSkeleton />}>
        <ProductBrowser />
      </Suspense>
    </div>
  );
}
