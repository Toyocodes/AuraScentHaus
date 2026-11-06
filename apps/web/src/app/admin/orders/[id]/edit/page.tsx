import { Suspense } from "react";
import { EditOrderSection } from "@/components/admin/orders";
import { Skeleton } from "@/components/ui/skeleton";

export default function EditOrderPage({ params }: PageProps<"/admin/orders/[id]/edit">) {
  return (
    <Suspense fallback={<Skeleton className="h-96" />}>
      <Editor params={params} />
    </Suspense>
  );
}

async function Editor({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EditOrderSection orderId={id} />;
}
