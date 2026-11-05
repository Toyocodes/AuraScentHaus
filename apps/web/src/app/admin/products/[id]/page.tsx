import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ProductEditor } from "@/components/admin/products";
import { BackLink } from "@/components/common";
import { Skeleton } from "@/components/ui/skeleton";
import { findMockProductById, mockCategories } from "@/mocks";

export default function EditProductPage({ params }: PageProps<"/admin/products/[id]">) {
  return (
    <div className="space-y-6">
      <BackLink href="/admin/products">All products</BackLink>
      <Suspense fallback={<Skeleton className="h-96" />}>
        <Editor params={params} />
      </Suspense>
    </div>
  );
}

/** Sample data for now. Later: `useAdminProduct(id)` + the product, variant and image mutations. */
async function Editor({ params }: { params: Promise<{ id: string }> }) {
  const product = findMockProductById((await params).id);
  if (!product) notFound();
  return <ProductEditor product={product} categories={mockCategories} />;
}
