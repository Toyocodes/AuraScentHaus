"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { QueryError } from "@/components/common";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminCategories } from "@/hooks/admin/categories";
import { useAdminScentFamilies } from "@/hooks/admin/scent-families";
import { useCreateProduct, useUploadProductImages } from "@/hooks/admin/products";
import { getErrorMessage } from "@/hooks/helper/errors";
import { toastAndRethrow } from "@/lib/toast-failure";
import { ProductForm } from "../product-form/product-form";

/**
 * /admin/products/new, connected. Saves the product, then uploads the photos chosen on the form,
 * then opens the product. If the photos fail, the product is still saved and they can be added there.
 */
export function NewProductSection() {
  const router = useRouter();
  const categories = useAdminCategories();
  const scentFamilies = useAdminScentFamilies();
  const createProduct = useCreateProduct();
  const uploadImages = useUploadProductImages();

  if (categories.isPending || scentFamilies.isPending) return <Skeleton className="h-96" />;
  if (categories.isError) return <QueryError error={categories.error} onRetry={() => void categories.refetch()} />;

  return (
    <ProductForm
      categories={categories.data}
      scentFamilies={scentFamilies.data ?? []}
      isPending={createProduct.isPending || uploadImages.isPending}
      pendingLabel={uploadImages.isPending ? "Uploading photos…" : "Creating…"}
      onSubmit={async (input, photos) => {
        const product = await createProduct.mutateAsync(input).catch(toastAndRethrow("We couldn't create this product."));

        if (photos.length === 0) {
          toast.success(`${product.name} created. Add its photos next.`);
        } else {
          try {
            await uploadImages.mutateAsync({ productId: product.id, files: photos });
            toast.success(`${product.name} created with ${photos.length} ${photos.length === 1 ? "photo" : "photos"}.`);
          } catch (error) {
            toast.warning(`${product.name} was created, but its photos didn't upload. Add them on this page.`, {
              description: getErrorMessage(error, "The upload failed."),
              duration: 10_000,
            });
          }
        }
        router.push(`/admin/products/${product.id}`);
      }}
    />
  );
}
