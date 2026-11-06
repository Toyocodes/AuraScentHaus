import { Suspense } from "react";
import { ProductEditorSection } from "@/components/admin/products";
import { BackLink } from "@/components/common";
import { Skeleton } from "@/components/ui/skeleton";

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

async function Editor({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ProductEditorSection productId={id} />;
}
