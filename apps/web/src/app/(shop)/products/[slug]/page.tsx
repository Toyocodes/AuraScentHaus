import { Suspense } from "react";
import type { Metadata } from "next";
import { ProductDetailSkeleton, ProductPageContent } from "@/components/product";
import { productMetadata } from "@/lib/catalog-metadata";

export async function generateMetadata({ params }: PageProps<"/products/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  return productMetadata(slug);
}

export default function ProductPage({ params }: PageProps<"/products/[slug]">) {
  return (
    <div className="container-page py-12 md:py-16">
      {/* The slug is only known at request time, so the product streams in. */}
      <Suspense fallback={<ProductDetailSkeleton />}>
        <Product params={params} />
      </Suspense>
    </div>
  );
}

async function Product({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ProductPageContent slug={slug} />;
}
