import type { ProductListItemDTO } from "@aurascenthaus/shared";
import { EmptyState } from "@/components/common";
import { ProductCard } from "../product-card/product-card";

export const PRODUCT_GRID_CLASS = "grid grid-cols-2 gap-x-5 gap-y-12 sm:gap-x-8 lg:grid-cols-4";

interface ProductGridProps {
  products: ProductListItemDTO[];
  emptyTitle?: string;
  emptyDescription?: string;
}

export function ProductGrid({
  products,
  emptyTitle = "Nothing found",
  emptyDescription = "Try another search or filter.",
}: ProductGridProps) {
  if (products.length === 0) return <EmptyState title={emptyTitle} description={emptyDescription} />;

  return (
    <div className={PRODUCT_GRID_CLASS}>
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
