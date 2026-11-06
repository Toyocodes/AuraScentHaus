"use client";

import { toast } from "sonner";
import { QueryError } from "@/components/common";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminCategories, useCreateCategory, useDeleteCategory } from "@/hooks/admin/categories";
import { usePermission } from "@/hooks/auth";
import { toastAndRethrow } from "@/lib/toast-failure";
import { CategoriesTable } from "../categories-table/categories-table";
import { CategoryForm } from "../category-form/category-form";

/** /admin/categories, connected: add and delete categories. */
export function CategoriesSection() {
  const { can } = usePermission();
  const categories = useAdminCategories();
  const createCategory = useCreateCategory();
  const deleteCategory = useDeleteCategory();

  return (
    <>
      <CategoryForm
        isPending={createCategory.isPending}
        onSubmit={async (input) => {
          await createCategory.mutateAsync(input).catch(toastAndRethrow("We couldn't add this category."));
          toast.success(`${input.name} added.`);
        }}
      />
      {categories.isPending ? (
        <Skeleton className="h-64" />
      ) : categories.isError ? (
        <QueryError error={categories.error} onRetry={() => void categories.refetch()} />
      ) : (
        <CategoriesTable
          categories={categories.data}
          canDelete={can("categories:delete")}
          onDelete={async (categoryId) => {
            await deleteCategory.mutateAsync(categoryId).catch(toastAndRethrow("We couldn't delete this category."));
            toast.success("Category deleted.");
          }}
        />
      )}
    </>
  );
}
