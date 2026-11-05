import { Suspense } from "react";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/common";
import { ProductFilters, ProductGrid, ProductGridSkeleton } from "@/components/product";
import { findMockCategory, mockProductsInCategory } from "@/mocks";

export default function CollectionPage({ params }: PageProps<"/collections/[slug]">) {
  return (
    <div className="container-page space-y-10 py-16">
      {/* The URL is only known at request time, so the collection streams in. */}
      <Suspense fallback={<ProductGridSkeleton />}>
        <Collection params={params} />
      </Suspense>
    </div>
  );
}

/** Sample data for now. Later: `useCategory(slug)` and `useProducts({ category: slug, ...filters })`. */
async function Collection({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = findMockCategory(slug);
  if (!category) notFound();
  const products = mockProductsInCategory(slug);

  return (
    <>
      <PageHeader eyebrow="Collection" title={category.name} description={category.description} />
      <ProductFilters />
      <ProductGrid products={products} />
    </>
  );
}
