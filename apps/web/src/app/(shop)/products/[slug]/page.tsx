import { Suspense } from "react";
import { ProductDetailSkeleton, ProductPageContent } from "@/components/product";

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
