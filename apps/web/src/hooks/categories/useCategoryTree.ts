"use client";

import { useQuery } from "@tanstack/react-query";
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

  const query = useQuery({
    queryKey: queryKeys.categories.tree(),
    queryFn: async () => {
      const { data } = await axios.get<CategoryTreeResponse>(routes.FETCH_CATEGORIES, { params: { tree: true } });
      return data.data;
    },
    staleTime: 10 * 60 * 1000,
  });

  // Categories are used all over the page, including parts that hydrate late: see useHasMounted.
  return { ...query, data: hasMounted ? query.data : undefined };
}
