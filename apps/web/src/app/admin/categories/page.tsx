import type { Metadata } from "next";
import { CategoriesSection } from "@/components/admin/categories";
import { PageHeader } from "@/components/common";

export const metadata: Metadata = { title: "Categories" };

export default function AdminCategoriesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Catalog"
        title="Categories"
        description="Each category gets its own page at /collections/[slug]."
      />
      <CategoriesSection />
    </div>
  );
}
