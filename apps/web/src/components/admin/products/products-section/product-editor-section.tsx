"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { EmptyState, QueryError } from "@/components/common";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminCategories } from "@/hooks/admin/categories";
import {
  useAddVariant,
  useAdminProduct,
  useDeleteProduct,
  useDeleteProductImage,
  useDeleteVariant,
  useUpdateProduct,
  useUpdateVariant,
  useUploadProductImages,
} from "@/hooks/admin/products";
import { usePermission } from "@/hooks/auth";
import { getErrorStatus } from "@/hooks/helper/errors";
import { toastAndRethrow, toastFailure } from "@/lib/toast-failure";
import { ProductEditor } from "../product-editor/product-editor";

/** /admin/products/[id], connected: details, sizes, prices, stock and photos. */
export function ProductEditorSection({ productId }: { productId: string }) {
  const router = useRouter();
  const { can } = usePermission();
  const product = useAdminProduct(productId);
  const categories = useAdminCategories();

  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const addVariant = useAddVariant();
  const updateVariant = useUpdateVariant();
  const deleteVariant = useDeleteVariant();
  const uploadImages = useUploadProductImages();
  const deleteImage = useDeleteProductImage();

  if (product.isPending || categories.isPending) return <Skeleton className="h-96" />;
  if (product.isError) {
    if (getErrorStatus(product.error) === 404) return <EmptyState title="We can't find this product" />;
    return <QueryError error={product.error} onRetry={() => void product.refetch()} />;
  }

  return (
    <ProductEditor
      product={product.data}
      categories={categories.data ?? []}
      canDelete={can("products:delete")}
      isSaving={updateProduct.isPending}
      onSave={async (input) => {
        await updateProduct.mutateAsync({ productId, input }).catch(toastAndRethrow("We couldn't save this product."));
        toast.success("Product saved.");
      }}
      onDelete={async () => {
        await deleteProduct.mutateAsync(productId).catch(toastAndRethrow("We couldn't delete this product."));
        toast.success("Product deleted.");
        router.replace("/admin/products");
      }}
      images={{
        isUploading: uploadImages.isPending,
        onUpload: async (files) => {
          await uploadImages.mutateAsync({ productId, files }).catch(toastAndRethrow("We couldn't upload these photos."));
          toast.success(files.length === 1 ? "Photo added." : `${files.length} photos added.`);
        },
        onDelete: (imageId) =>
          deleteImage.mutate({ productId, imageId }, { onError: toastFailure("We couldn't delete this photo.") }),
      }}
      variants={{
        isPending: addVariant.isPending || updateVariant.isPending || deleteVariant.isPending,
        onAdd: async (input) => {
          await addVariant.mutateAsync({ productId, input }).catch(toastAndRethrow("We couldn't add this size."));
          toast.success("Size added.");
        },
        onUpdate: async (variantId, input) => {
          await updateVariant
            .mutateAsync({ productId, variantId, input })
            .catch(toastAndRethrow("We couldn't update this size."));
          toast.success("Size updated.");
        },
        onDelete: async (variantId) => {
          await deleteVariant.mutateAsync({ productId, variantId }).catch(toastAndRethrow("We couldn't delete this size."));
          toast.success("Size deleted.");
        },
      }}
    />
  );
}
