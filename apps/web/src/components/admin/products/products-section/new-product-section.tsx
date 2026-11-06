"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { QueryError } from "@/components/common";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminCategories } from "@/hooks/admin/categories";
import { useAdminScentFamilies } from "@/hooks/admin/scent-families";
import { useCreateProduct } from "@/hooks/admin/products";
import { toastAndRethrow } from "@/lib/toast-failure";
import { ProductForm } from "../product-form/product-form";

/** /admin/products/new, connected. After saving, opens the product so photos can be added. */
export function NewProductSection() {
  const router = useRouter();
  const categories = useAdminCategories();
  const scentFamilies = useAdminScentFamilies();
  const createProduct = useCreateProduct();

  if (categories.isPending || scentFamilies.isPending) return <Skeleton className="h-96" />;
  if (categories.isError) return <QueryError error={categories.error} onRetry={() => void categories.refetch()} />;

  return (
    <ProductForm
      categories={categories.data}
      scentFamilies={scentFamilies.data ?? []}
      isPending={createProduct.isPending}
      onSubmit={async (input) => {
        const product = await createProduct.mutateAsync(input).catch(toastAndRethrow("We couldn't create this product."));
        toast.success(`${product.name} created. Add its photos next.`);
        router.push(`/admin/products/${product.id}`);
      }}
    />
  );
}
