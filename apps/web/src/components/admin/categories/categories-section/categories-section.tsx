"use client";

import { Plus } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, QueryError } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useAdminCategories,
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
  useUploadCategoryImage,
} from "@/hooks/admin/categories";
import { usePermission } from "@/hooks/auth";
import { toastAndRethrow } from "@/lib/toast-failure";
import { CategoriesTable } from "../categories-table/categories-table";
import { CategoryDialog } from "../category-dialog/category-dialog";

/** /admin/categories, connected: the category tree, with add, edit, picture and safe delete. */
export function CategoriesSection() {
  const { can } = usePermission();
  const categories = useAdminCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();
  const uploadImage = useUploadCategoryImage();
  const canEdit = can("categories:write");

  const create = async (input: Parameters<typeof createCategory.mutateAsync>[0]) => {
    await createCategory.mutateAsync(input).catch(toastAndRethrow("We couldn't add this category."));
    toast.success(`${input.name} added.`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Catalog"
        title="Categories"
        description="What a product is. Shoppers only see active categories that have products on sale."
        actions={
          canEdit &&
          categories.data && (
            <CategoryDialog
              trigger={
                <Button>
                  <Plus /> Add category
                </Button>
              }
              categories={categories.data}
              isPending={createCategory.isPending}
              onSubmit={create}
            />
          )
        }
      />
      {categories.isPending ? (
        <Skeleton className="h-96" />
      ) : categories.isError ? (
        <QueryError error={categories.error} onRetry={() => void categories.refetch()} />
      ) : (
        <CategoriesTable
          categories={categories.data}
          canEdit={canEdit}
          canDelete={can("categories:delete")}
          isSaving={createCategory.isPending || updateCategory.isPending}
          isDeleting={deleteCategory.isPending}
          onCreate={create}
          onUpdate={async (categoryId, input) => {
            await updateCategory.mutateAsync({ categoryId, input }).catch(toastAndRethrow("We couldn't save this category."));
            toast.success("Category saved.");
          }}
          onDelete={async (categoryId, reassignTo) => {
            await deleteCategory
              .mutateAsync({ categoryId, reassignTo })
              .catch(toastAndRethrow("We couldn't delete this category."));
            toast.success("Category deleted.");
          }}
          onUploadImage={async (categoryId, file) => {
            await uploadImage.mutateAsync({ categoryId, file }).catch(toastAndRethrow("We couldn't upload this picture."));
            toast.success("Picture updated.");
          }}
        />
      )}
    </div>
  );
}
