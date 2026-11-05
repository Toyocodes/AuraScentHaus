import type { Metadata } from "next";
import { CategoriesTable, CategoryForm } from "@/components/admin/categories";
import { PageHeader } from "@/components/common";
import { mockCategories } from "@/mocks";

export const metadata: Metadata = { title: "Categories" };

/** Sample data for now. Later: `useAdminCategories()`, `useCreateCategory()`, `useDeleteCategory()`. */
export default function AdminCategoriesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Catalog"
        title="Categories"
        description="Each category gets its own page at /collections/[slug]."
      />
      <CategoryForm />
      <CategoriesTable categories={mockCategories} />
    </div>
  );
}
