"use client";

import Link from "next/link";
import { EmptyState, QueryError, SectionHeading } from "@/components/common";
import { Button } from "@/components/ui/button";
import { getErrorStatus } from "@/hooks/helper/errors";
import { useProduct, useProducts } from "@/hooks/products";
import { ProductDetail } from "../product-detail/product-detail";
import { ProductDetailSkeleton } from "../product-detail/product-detail-skeleton";
import { ProductGrid } from "../product-grid/product-grid";
import { ProductGridSkeleton } from "../product-grid/product-grid-skeleton";

/** The product page, connected to GET /products/:slug, with related perfumes below. */
export function ProductPageContent({ slug }: { slug: string }) {
  const { data: product, isPending, isError, error, refetch } = useProduct(slug);

  if (isPending) return <ProductDetailSkeleton />;

  if (isError) {
    if (getErrorStatus(error) === 404) {
      return (
        <EmptyState
          title="We can't find this perfume"
          description="It may have been renamed or is no longer available."
          action={
            <Button asChild>
              <Link href="/products">Browse all perfumes</Link>
            </Button>
          }
        />
      );
    }
    return <QueryError error={error} title="This perfume didn't load" onRetry={() => void refetch()} />;
  }

  return (
    <div className="space-y-24">
      {/* Add to bag is connected in the cart step. */}
      <ProductDetail product={product} />
      <RelatedProducts slug={slug} category={product.category?.slug} />
    </div>
  );
}

/** Up to 4 others from the same collection, or the newest perfumes if it has none. */
function RelatedProducts({ slug, category }: { slug: string; category?: string }) {
  const sameCategory = useProducts({ category, limit: 5 });
  const others = (sameCategory.data?.data ?? []).filter((p) => p.slug !== slug);
  const newest = useProducts({ limit: 5 }, { enabled: sameCategory.isSuccess && others.length === 0 });

  const products = others.length > 0 ? others : (newest.data?.data ?? []).filter((p) => p.slug !== slug);
  const loading = sameCategory.isPending || (others.length === 0 && newest.isFetching);

  if (!loading && products.length === 0) return null;

  return (
    <section className="space-y-10 border-t pt-16">
      <SectionHeading eyebrow="You may also like" title="More from the house" />
      {loading ? <ProductGridSkeleton count={4} /> : <ProductGrid products={products.slice(0, 4)} />}
    </section>
  );
}
