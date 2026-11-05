import { Suspense } from "react";
import { notFound } from "next/navigation";
import { SectionHeading } from "@/components/common";
import { ProductDetail, ProductDetailSkeleton, ProductGrid } from "@/components/product";
import { findMockProduct, mockProducts } from "@/mocks";

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

/** Sample data for now. Later: `useProduct(slug)` and `useAddToCart()` for `onAddToCart`. */
async function Product({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = findMockProduct(slug);
  if (!product) notFound();

  const related = mockProducts.filter((p) => p.category?.slug === product.category?.slug && p.slug !== slug);
  const more = related.length > 0 ? related : mockProducts.filter((p) => p.slug !== slug).slice(0, 4);

  return (
    <div className="space-y-24">
      <ProductDetail product={product} />
      <section className="space-y-10 border-t pt-16">
        <SectionHeading eyebrow="You may also like" title="More from the house" />
        <ProductGrid products={more.slice(0, 4)} />
      </section>
    </div>
  );
}
