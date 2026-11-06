"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { X } from "lucide-react";
import { Pagination, QueryError, SearchForm } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminProducts } from "@/hooks/admin/products";
import { ProductsTable } from "../products-table/products-table";

const PAGE_SIZE = 20;

/**
 * /admin/products, connected: every product, including hidden ones. ?category=slug limits it to
 * one category and its subcategories. Needs a <Suspense> boundary above it.
 */
export function ProductsSection() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const category = useSearchParams().get("category") ?? undefined;
  const products = useAdminProducts({ search: search || undefined, category, page, limit: PAGE_SIZE });

  return (
    <>
      <SearchForm
        placeholder="Search products…"
        className="max-w-sm"
        onSearch={(text) => {
          setSearch(text);
          setPage(1);
        }}
      />
      {category && (
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/products">
            <X /> Category: {category}
          </Link>
        </Button>
      )}
      {products.isPending ? (
        <Skeleton className="h-64" />
      ) : products.isError ? (
        <QueryError error={products.error} onRetry={() => void products.refetch()} />
      ) : (
        <>
          <ProductsTable products={products.data.data} />
          <Pagination page={products.data.meta.page} totalPages={products.data.meta.totalPages} onPageChange={setPage} />
        </>
      )}
    </>
  );
}
