import { Suspense } from "react";
import type { Metadata } from "next";
import { CategoryPageContent, ProductBrowserSkeleton } from "@/components/product";
import { categoryMetadata } from "@/lib/catalog-metadata";

export async function generateMetadata({ params }: PageProps<"/shop/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  return categoryMetadata(slug);
}

export default function CategoryPage({ params }: PageProps<"/shop/[slug]">) {
  return (
    <div className="container-page space-y-10 py-16">
      {/* The URL is only known at request time, so the category streams in. */}
      <Suspense fallback={<ProductBrowserSkeleton />}>
        <Category params={params} />
      </Suspense>
    </div>
  );
}

async function Category({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <CategoryPageContent slug={slug} />;
}
