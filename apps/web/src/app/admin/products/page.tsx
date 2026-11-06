import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { ProductsSection } from "@/components/admin/products";
import { PageHeader } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = { title: "Products" };

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
      <Suspense fallback={<Skeleton className="h-64" />}>
        <ProductsSection />
      </Suspense>
    </div>
  );
}
