"use client";

import Link from "next/link";
import { EmptyState, PageHeader, QueryError } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCategory } from "@/hooks/categories";
import { getErrorStatus } from "@/hooks/helper/errors";
import { ProductBrowser } from "../product-browser/product-browser";

/** /collections/[slug], connected: the category heading plus its filtered products. Needs <Suspense> above it. */
export function CollectionPageContent({ slug }: { slug: string }) {
  const { data: category, isPending, isError, error, refetch } = useCategory(slug);

  if (isError) {
    if (getErrorStatus(error) === 404) {
      return (
        <EmptyState
          title="We can't find this collection"
          action={
            <Button asChild>
              <Link href="/products">Browse all perfumes</Link>
            </Button>
          }
        />
      );
    }
    return <QueryError error={error} title="This collection didn't load" onRetry={() => void refetch()} />;
  }

  return (
    <>
      {isPending ? (
        <div className="space-y-3">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-12 w-64" />
        </div>
      ) : (
        <PageHeader eyebrow="Collection" title={category.name} description={category.description} />
      )}
      <ProductBrowser category={slug} />
    </>
  );
}
