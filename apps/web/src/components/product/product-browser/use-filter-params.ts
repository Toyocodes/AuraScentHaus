"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { GENDERS, nairaToKobo, PRODUCT_SORTS, type Gender, type ProductSort } from "@aurascenthaus/shared";

const isGender = (v: string | null): v is Gender => GENDERS.includes(v as Gender);
const isSort = (v: string | null): v is ProductSort => PRODUCT_SORTS.includes(v as ProductSort);

const toNumber = (value: string | null) => {
  const n = Number(value);
  return value && Number.isFinite(n) && n >= 0 ? n : undefined;
};

export interface ShopFilters {
  search: string;
  /** Scent family slugs. */
  scents: string[];
  gender?: Gender;
  /** In naira, as typed. */
  minPrice?: number;
  maxPrice?: number;
  inStock: boolean;
  sort: ProductSort;
  page: number;
}

function toQuery(f: ShopFilters): URLSearchParams {
  const query = new URLSearchParams();
  if (f.search) query.set("search", f.search);
  if (f.scents.length) query.set("scent", f.scents.join(","));
  if (f.gender) query.set("gender", f.gender);
  if (f.minPrice !== undefined) query.set("min", String(f.minPrice));
  if (f.maxPrice !== undefined) query.set("max", String(f.maxPrice));
  if (f.inStock) query.set("stock", "1");
  if (f.sort !== "newest") query.set("sort", f.sort);
  if (f.page > 1) query.set("page", String(f.page));
  return query;
}

/**
 * Shop filters live in the URL, so a filtered page can be shared or bookmarked and the back
 * button works: /shop/perfumes?scent=oud,woody&min=20000&stock=1
 * Needs a <Suspense> boundary above it.
 */
export function useFilterParams() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const serialised = searchParams.toString();

  const filters = useMemo<ShopFilters>(() => {
    const read = new URLSearchParams(serialised);
    const gender = read.get("gender");
    const sort = read.get("sort");
    return {
      search: read.get("search") ?? "",
      scents: (read.get("scent") ?? "").split(",").map((s) => s.trim()).filter(Boolean),
      gender: isGender(gender) ? gender : undefined,
      minPrice: toNumber(read.get("min")),
      maxPrice: toNumber(read.get("max")),
      inStock: read.get("stock") === "1",
      sort: isSort(sort) ? sort : "newest",
      page: Math.max(1, Number(read.get("page")) || 1),
    };
  }, [serialised]);

  const go = useCallback(
    (next: ShopFilters) => {
      const qs = toQuery(next).toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router],
  );

  return {
    filters,
    /** Ready for `useProducts`. Prices are stored in kobo. */
    apiParams: {
      search: filters.search || undefined,
      scent: filters.scents.join(",") || undefined,
      gender: filters.gender,
      minPrice: filters.minPrice !== undefined ? nairaToKobo(filters.minPrice) : undefined,
      maxPrice: filters.maxPrice !== undefined ? nairaToKobo(filters.maxPrice) : undefined,
      inStock: filters.inStock || undefined,
      sort: filters.sort,
      page: filters.page,
    },
    /** Change some filters. Any change returns to page 1. */
    setFilters: (changes: Partial<ShopFilters>) => go({ ...filters, ...changes, page: 1 }),
    setPage: (page: number) => {
      go({ ...filters, page });
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    clearFilters: () => go({ search: "", scents: [], inStock: false, sort: filters.sort, page: 1 }),
    /** A link to another category that keeps the current filters. */
    hrefFor: (path: string) => {
      const qs = toQuery({ ...filters, page: 1 }).toString();
      return qs ? `${path}?${qs}` : path;
    },
  };
}
