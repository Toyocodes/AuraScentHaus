"use client";

import { useState } from "react";
import { Pagination, QueryError, SearchForm } from "@/components/common";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminProducts } from "@/hooks/admin/products";
import { ProductsTable } from "../products-table/products-table";

const PAGE_SIZE = 20;

/** /admin/products, connected: every product, including hidden ones. */
export function ProductsSection() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const products = useAdminProducts({ search: search || undefined, page, limit: PAGE_SIZE });

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
