"use client";

import { SlidersHorizontal, X } from "lucide-react";
import { Pagination, QueryError } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { useProducts } from "@/hooks/products";
import { useScentFamilies } from "@/hooks/scent-families";
import { formatNaira, humanize } from "@/lib/format";
import { cn } from "@/lib/utils";
import { nairaToKobo } from "@aurascenthaus/shared";
import { FilterPanel } from "../product-filters/filter-panel";
import { ProductFilters } from "../product-filters/product-filters";
import { ProductGrid } from "../product-grid/product-grid";
import { ProductGridSkeleton } from "../product-grid/product-grid-skeleton";
import { useFilterParams, type ShopFilters } from "./use-filter-params";

const PAGE_SIZE = 12;

interface ActiveFilter {
  key: string;
  label: string;
  clear: Partial<ShopFilters>;
}

function useActiveFilters(filters: ShopFilters): ActiveFilter[] {
  const { data: families = [] } = useScentFamilies();
  const active: ActiveFilter[] = [];

  if (filters.search) active.push({ key: "search", label: `"${filters.search}"`, clear: { search: "" } });
  for (const slug of filters.scents) {
    active.push({
      key: `scent-${slug}`,
      label: families.find((f) => f.slug === slug)?.name ?? humanize(slug),
      clear: { scents: filters.scents.filter((s) => s !== slug) },
    });
  }
  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    const from = filters.minPrice !== undefined ? formatNaira(nairaToKobo(filters.minPrice)) : "Any";
    const to = filters.maxPrice !== undefined ? formatNaira(nairaToKobo(filters.maxPrice)) : "Any";
    active.push({ key: "price", label: `${from} to ${to}`, clear: { minPrice: undefined, maxPrice: undefined } });
  }
  if (filters.inStock) active.push({ key: "stock", label: "In stock", clear: { inStock: false } });
  if (filters.gender) active.push({ key: "gender", label: humanize(filters.gender), clear: { gender: undefined } });
  return active;
}

interface ProductBrowserProps {
  /** Limit to one category (and its subcategories). */
  category?: string;
  /** Offer the men / women / unisex filter. */
  showGender?: boolean;
}

/**
 * Filter panel, search, sort, product grid and pagination, connected to GET /products.
 * Needs a <Suspense> boundary above it (it reads the URL).
 */
export function ProductBrowser({ category, showGender }: ProductBrowserProps) {
  const { filters, apiParams, setFilters, setPage, clearFilters, hrefFor } = useFilterParams();
  const { data, isPending, isError, error, refetch, isPlaceholderData } = useProducts({
    ...apiParams,
    category,
    limit: PAGE_SIZE,
  });
  const active = useActiveFilters(filters);

  const panel = (
    <FilterPanel filters={filters} setFilters={setFilters} hrefFor={hrefFor} categorySlug={category} showGender={showGender} />
  );

  return (
    <div className="grid gap-10 lg:grid-cols-[15rem_1fr] lg:gap-14">
      <aside className="hidden lg:block" aria-label="Filters">
        {panel}
      </aside>

      <div className="min-w-0 space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="lg:hidden">
                <SlidersHorizontal /> Filters{active.length > 0 && ` (${active.length})`}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="overflow-y-auto bg-background">
              <SheetHeader>
                <SheetTitle className="font-heading text-2xl">Filters</SheetTitle>
              </SheetHeader>
              <div className="px-4 pb-8">{panel}</div>
            </SheetContent>
          </Sheet>
          {/* Remount when the URL changes, so the boxes match after the back button or "Clear all". */}
          <ProductFilters
            key={`${filters.search}-${filters.sort}`}
            defaultValues={{ search: filters.search, sort: filters.sort }}
            onChange={(values) => setFilters(values)}
          />
        </div>

        {active.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {active.map((filter) => (
              <Button key={filter.key} variant="outline" size="xs" onClick={() => setFilters(filter.clear)} aria-label={`Remove filter: ${filter.label}`}>
                {filter.label} <X />
              </Button>
            ))}
            <Button variant="link" size="xs" onClick={clearFilters}>
              Clear all
            </Button>
          </div>
        )}

        {isPending ? (
          <ProductGridSkeleton />
        ) : isError ? (
          <QueryError error={error} title="We couldn't load the products" onRetry={() => void refetch()} />
        ) : (
          <>
            <p className="text-sm text-muted-foreground" aria-live="polite">
              {data.meta.total} {data.meta.total === 1 ? "product" : "products"}
            </p>
            <div className={cn("transition-opacity", isPlaceholderData && "opacity-60")}>
              <ProductGrid
                products={data.data}
                emptyTitle={active.length > 0 ? "Nothing matches those filters" : "New arrivals are on the way"}
                emptyDescription={active.length > 0 ? "Try removing a filter." : "Nothing is on sale here just yet. Please check back soon."}
              />
            </div>
            <Pagination page={data.meta.page} totalPages={data.meta.totalPages} onPageChange={setPage} />
          </>
        )}
      </div>
    </div>
  );
}

/** What shows while the URL is read. */
export function ProductBrowserSkeleton() {
  return (
    <div className="grid gap-10 lg:grid-cols-[15rem_1fr] lg:gap-14">
      <Skeleton className="hidden h-96 lg:block" />
      <div className="space-y-6">
        <Skeleton className="h-10" />
        <ProductGridSkeleton />
      </div>
    </div>
  );
}
