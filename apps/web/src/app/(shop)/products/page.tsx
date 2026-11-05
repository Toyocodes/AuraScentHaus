import type { Metadata } from "next";
import { PageHeader } from "@/components/common";
import { ProductFilters, ProductGrid } from "@/components/product";
import { mockProducts } from "@/mocks";

export const metadata: Metadata = { title: "Shop all perfumes" };

/** Sample data for now. Later: `useProducts(filters)`, with ProductFilters' onChange setting the filters. */
export default function ProductsPage() {
  return (
    <div className="container-page space-y-10 py-16">
      <PageHeader
        eyebrow="The collection"
        title="All perfumes"
        description="Every fragrance in the house, from bright citrus to the deepest oud."
      />
      <ProductFilters />
      <p className="text-sm text-muted-foreground">{mockProducts.length} perfumes</p>
      <ProductGrid products={mockProducts} />
    </div>
  );
}
