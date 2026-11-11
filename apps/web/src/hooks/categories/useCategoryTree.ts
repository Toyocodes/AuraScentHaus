"use client";

import { useQuery } from "@tanstack/react-query";
import { useServerCategoryTree } from "@/components/providers/category-tree-provider";
import { queryKeys } from "../helper/query-keys";
import { useHasMounted } from "../helper/useHasMounted";
import { routes } from "../helper/routes";
import { useAxios } from "../useAxios";
import type { CategoryTreeResponse } from "./types";

/**
 * Main categories with their subcategories, for the menu, footer and home page.
 * Only includes categories with products on sale, so the menu never leads to an empty shelf.
 */
export function useCategoryTree() {
  const axios = useAxios();
  const hasMounted = useHasMounted();
  const serverTree = useServerCategoryTree();

  const query = useQuery({
    queryKey: queryKeys.categories.tree(),
    queryFn: async () => {
      const { data } = await axios.get<CategoryTreeResponse>(routes.FETCH_CATEGORIES, { params: { tree: true } });
      return data.data;
    },
    staleTime: 10 * 60 * 1000,
  });

  // When the server rendered the page with the categories (CategoryTreeProvider), every part of the
  // page starts from that same list, so the menu is complete at once and never changes after loading.
  // The fresh copy from the browser takes over when it arrives.
  if (serverTree) return { ...query, data: query.data ?? serverTree };

  // Otherwise wait until mounted: parts that hydrate late must match the server's HTML (see useHasMounted).
  return { ...query, data: hasMounted ? query.data : undefined };
}
