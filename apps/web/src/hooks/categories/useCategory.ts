"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../helper/query-keys";
import { routes } from "../helper/routes";
import { useAxios } from "../useAxios";
import type { CategoryDetailResponse } from "./types";

/** One category by slug, for /shop/[slug]. */
export function useCategory(slug: string | undefined) {
  const axios = useAxios();

  return useQuery({
    queryKey: queryKeys.categories.detail(slug ?? ""),
    queryFn: async () => {
      const { data } = await axios.get<CategoryDetailResponse>(routes.FETCH_SINGLE_CATEGORY(slug!));
      return data.data;
    },
    enabled: Boolean(slug),
  });
}
