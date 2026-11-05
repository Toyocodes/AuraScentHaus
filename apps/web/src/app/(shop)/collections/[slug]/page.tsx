import { Suspense } from "react";
import { CollectionPageContent, ProductBrowserSkeleton } from "@/components/product";

export default function CollectionPage({ params }: PageProps<"/collections/[slug]">) {
  return (
    <div className="container-page space-y-10 py-16">
      {/* The URL is only known at request time, so the collection streams in. */}
      <Suspense fallback={<ProductBrowserSkeleton />}>
        <Collection params={params} />
      </Suspense>
    </div>
  );
}

async function Collection({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <CollectionPageContent slug={slug} />;
}
