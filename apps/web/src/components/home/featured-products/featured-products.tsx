import type { ProductListItemDTO } from "@aurascenthaus/shared";
import { SectionHeading } from "@/components/common";
import { ProductGrid, ProductGridSkeleton } from "@/components/product";

export function FeaturedProducts({ products, isPending }: { products: ProductListItemDTO[]; isPending?: boolean }) {
  return (
    <section className="border-y bg-card">
      <div className="container-page space-y-12 py-20">
        <SectionHeading eyebrow="Signature scents" title="The house favourites" link={{ href: "/shop", label: "View all" }} />
        {isPending ? (
          <ProductGridSkeleton count={4} />
        ) : (
          <ProductGrid products={products} emptyTitle="Our favourites will appear here" emptyDescription="" />
        )}
      </div>
    </section>
  );
}
