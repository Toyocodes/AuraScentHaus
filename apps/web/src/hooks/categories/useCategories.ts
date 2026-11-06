"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../helper/query-keys";
import { routes } from "../helper/routes";
import { useAxios } from "../useAxios";
import type { CategoryListResponse } from "./types";

/** A flat list of categories with products on sale. They rarely change, so they stay fresh for 10 minutes. */
export function useCategories() {
  const axios = useAxios();

  return useQuery({
    queryKey: queryKeys.categories.list(),
    queryFn: async () => {
      const { data } = await axios.get<CategoryListResponse>(routes.FETCH_CATEGORIES);
      return data.data;
    },
    staleTime: 10 * 60 * 1000,
  });
}
