"use client";

import Link from "next/link";
import { EmptyState, PageHeader, QueryError } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCategory } from "@/hooks/categories";
import { getErrorStatus } from "@/hooks/helper/errors";
import { ProductBrowser } from "../product-browser/product-browser";

/** /shop/[slug], connected: the category heading, its subcategories and its products. Needs <Suspense> above it. */
export function CategoryPageContent({ slug }: { slug: string }) {
  const { data: category, isPending, isError, error, refetch } = useCategory(slug);

  if (isError) {
    if (getErrorStatus(error) === 404) {
      return (
        <EmptyState
          title="We can't find this category"
          action={
            <Button asChild>
              <Link href="/shop">Browse the collection</Link>
            </Button>
          }
        />
      );
    }
    return <QueryError error={error} title="This category didn't load" onRetry={() => void refetch()} />;
  }

  return (
    <>
      {isPending ? (
        <div className="space-y-3">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-12 w-64" />
        </div>
      ) : (
        <div className="space-y-5">
          <nav className="eyebrow flex flex-wrap gap-2" aria-label="Breadcrumb">
            <Link href="/shop" className="hover:text-foreground">
              Shop
            </Link>
            {category.parent && (
              <>
                <span aria-hidden>/</span>
                <Link href={`/shop/${category.parent.slug}`} className="hover:text-foreground">
                  {category.parent.name}
                </Link>
              </>
            )}
          </nav>
          <PageHeader title={category.name} description={category.description} />
          {category.children.length > 0 && (
            <ul className="flex flex-wrap gap-2">
              {category.children.map((child) => (
                <li key={child.id}>
                  <Link href={`/shop/${child.slug}`} className="block rounded-full border px-4 py-1.5 text-sm transition-colors hover:border-foreground/50">
                    {child.name}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      {/* Waits for the category, because whether it offers the gender filter comes from there. */}
      {!isPending && <ProductBrowser category={slug} showGender={category.usesGender} />}
    </>
  );
}
