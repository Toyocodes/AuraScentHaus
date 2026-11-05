"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../../helper/query-keys";
import { routes } from "../../helper/routes";
import { useAxios } from "../../useAxios";
import type { AdminCategoryListResponse } from "./types";

export function useAdminCategories() {
  const axios = useAxios();

  return useQuery({
    queryKey: queryKeys.admin.categories.all,
    queryFn: async () => {
      const { data } = await axios.get<AdminCategoryListResponse>(routes.ADMIN_CATEGORIES);
      return data.data;
    },
  });
}
