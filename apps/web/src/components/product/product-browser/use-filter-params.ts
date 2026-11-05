"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { GENDERS, PRODUCT_SORTS, type Gender, type ProductSort } from "@aurascenthaus/shared";
import { ALL_GENDERS } from "../product-filters/filter-options";
import type { ProductFilterParams, ProductFilterValues } from "../product-filters/filter-schema";

const isGender = (v: string | null): v is Gender => GENDERS.includes(v as Gender);
const isSort = (v: string | null): v is ProductSort => PRODUCT_SORTS.includes(v as ProductSort);

/**
 * Shop filters live in the URL (?search=&gender=&sort=&page=), so a filtered page can be
 * shared or bookmarked and the back button works. Needs a <Suspense> boundary above it.
 */
export function useFilterParams() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const search = searchParams.get("search") ?? "";
  const gender = searchParams.get("gender");
  const sort = searchParams.get("sort");
  const page = Math.max(1, Number(searchParams.get("page")) || 1);

  const params: ProductFilterParams & { page: number } = {
    search: search || undefined,
    gender: isGender(gender) ? gender : undefined,
    sort: isSort(sort) ? sort : "newest",
    page,
  };

  const formValues: ProductFilterValues = {
    search,
    gender: params.gender ?? ALL_GENDERS,
    sort: params.sort,
  };

  const push = useCallback(
    (next: Record<string, string | number | undefined>) => {
      const query = new URLSearchParams();
      for (const [key, value] of Object.entries(next)) {
        if (value !== undefined && value !== "") query.set(key, String(value));
      }
      if (query.get("sort") === "newest") query.delete("sort");
      if (query.get("page") === "1") query.delete("page");
      const qs = query.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router],
  );

  return {
    params,
    formValues,
    /** New filters start again from page 1. */
    setFilters: (filters: ProductFilterParams) => push({ ...filters, page: 1 }),
    setPage: (nextPage: number) => {
      push({ search: params.search, gender: params.gender, sort: params.sort, page: nextPage });
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
  };
}
