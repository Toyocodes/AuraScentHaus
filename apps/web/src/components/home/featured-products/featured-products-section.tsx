"use client";

import { useProducts } from "@/hooks/products";
import { FeaturedProducts } from "./featured-products";

/**
 * Home page favourites, connected: products marked "Featured" in the admin.
 * If none are featured yet, the newest products fill the section instead.
 */
export function FeaturedProductsSection() {
  const featured = useProducts({ featured: true, limit: 8 });
  const noneFeatured = featured.isSuccess && featured.data.data.length === 0;
  const newest = useProducts({ limit: 8 }, { enabled: noneFeatured });

  const source = noneFeatured ? newest : featured;
  return <FeaturedProducts products={source.data?.data ?? []} isPending={source.isPending} />;
}
