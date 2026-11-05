import type { ProductListItemDTO } from "@aurascenthaus/shared";
import { SectionHeading } from "@/components/common";
import { ProductGrid } from "@/components/product";

export function FeaturedProducts({ products }: { products: ProductListItemDTO[] }) {
  return (
    <section className="border-y bg-card">
      <div className="container-page space-y-12 py-20">
        <SectionHeading eyebrow="Signature scents" title="The house favourites" link={{ href: "/products", label: "View all" }} />
        <ProductGrid products={products} emptyTitle="Featured perfumes will appear here" emptyDescription="" />
      </div>
    </section>
  );
}
