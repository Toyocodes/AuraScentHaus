import Link from "next/link";
import type { Metadata } from "next";
import { ProductsTable } from "@/components/admin/products";
import { PageHeader, SearchForm } from "@/components/common";
import { Button } from "@/components/ui/button";
import { mockProducts } from "@/mocks";

export const metadata: Metadata = { title: "Products" };

/** Sample data for now. Later: `useAdminProducts({ search })`. */
export default function AdminProductsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Catalog"
        title="Products"
        actions={
          <Button asChild>
            <Link href="/admin/products/new">+ New product</Link>
          </Button>
        }
      />
      <SearchForm placeholder="Search products…" className="max-w-sm" />
      <ProductsTable products={mockProducts} />
    </div>
  );
}
