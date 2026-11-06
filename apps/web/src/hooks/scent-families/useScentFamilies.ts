"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../helper/query-keys";
import { useHasMounted } from "../helper/useHasMounted";
import { routes } from "../helper/routes";
import { useAxios } from "../useAxios";
import type { ScentFamilyListResponse } from "./types";

/** Active scent families, with how many products are on sale in each. */
export function useScentFamilies() {
  const axios = useAxios();
  const hasMounted = useHasMounted();

  const query = useQuery({
    queryKey: queryKeys.scentFamilies.all,
    queryFn: async () => {
      const { data } = await axios.get<ScentFamilyListResponse>(routes.FETCH_SCENT_FAMILIES);
      return data.data;
    },
    staleTime: 10 * 60 * 1000,
  });

  // Scent families are used all over the page, including parts that hydrate late: see useHasMounted.
  return { ...query, data: hasMounted ? query.data : undefined };
}
