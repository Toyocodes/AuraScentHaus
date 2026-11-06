import type { Metadata } from "next";
import { NewProductSection } from "@/components/admin/products";
import { BackLink, PageHeader } from "@/components/common";

export const metadata: Metadata = { title: "New product" };

export default function NewProductPage() {
  return (
    <div className="space-y-6">
      <BackLink href="/admin/products">All products</BackLink>
      <PageHeader title="New product" />
      <NewProductSection />
    </div>
  );
}
