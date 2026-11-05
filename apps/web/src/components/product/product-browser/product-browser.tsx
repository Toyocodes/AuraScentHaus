"use client";

import { Pagination, QueryError } from "@/components/common";
import { useProducts } from "@/hooks/products";
import { cn } from "@/lib/utils";
import { ProductFilters } from "../product-filters/product-filters";
import { ProductGrid } from "../product-grid/product-grid";
import { ProductGridSkeleton } from "../product-grid/product-grid-skeleton";
import { useFilterParams } from "./use-filter-params";

const PAGE_SIZE = 12;

interface ProductBrowserProps {
  /** Limit to one collection (category slug). */
  category?: string;
}

/**
 * Filters + product grid + pagination, connected to GET /products.
 * Needs a <Suspense> boundary above it (it reads the URL).
 */
export function ProductBrowser({ category }: ProductBrowserProps) {
  const { params, formValues, setFilters, setPage } = useFilterParams();
  const { data, isPending, isError, error, refetch, isPlaceholderData } = useProducts({
    ...params,
    category,
    limit: PAGE_SIZE,
  });

  return (
    <div className="space-y-10">
      <ProductFilters defaultValues={formValues} onChange={setFilters} />

      {isPending ? (
        <ProductGridSkeleton />
      ) : isError ? (
        <QueryError error={error} title="We couldn't load the perfumes" onRetry={() => void refetch()} />
      ) : (
        <>
          <p className="text-sm text-muted-foreground" aria-live="polite">
            {data.meta.total} {data.meta.total === 1 ? "perfume" : "perfumes"}
          </p>
          <div className={cn("transition-opacity", isPlaceholderData && "opacity-60")}>
            <ProductGrid products={data.data} />
          </div>
          <Pagination page={data.meta.page} totalPages={data.meta.totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}

/** What shows while the URL is read: the filters and an empty grid. */
export function ProductBrowserSkeleton() {
  return (
    <div className="space-y-10">
      <ProductFilters />
      <ProductGridSkeleton />
    </div>
  );
}
