import type { Metadata } from "next";
import { ProductForm } from "@/components/admin/products";
import { BackLink, PageHeader } from "@/components/common";
import { mockCategories } from "@/mocks";

export const metadata: Metadata = { title: "New product" };

/** Sample data for now. Later: `useAdminCategories()` for `categories`, `useCreateProduct()` for `onSubmit`. */
export default function NewProductPage() {
  return (
    <div className="space-y-6">
      <BackLink href="/admin/products">All products</BackLink>
      <PageHeader title="New product" />
      <ProductForm categories={mockCategories} />
    </div>
  );
}
