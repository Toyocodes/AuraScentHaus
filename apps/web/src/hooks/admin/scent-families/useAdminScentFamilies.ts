"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../../helper/query-keys";
import { routes } from "../../helper/routes";
import { useAxios } from "../../useAxios";
import type { AdminScentFamilyListResponse } from "./types";

/** All scent families, including inactive ones. */
export function useAdminScentFamilies() {
  const axios = useAxios();

  return useQuery({
    queryKey: queryKeys.admin.scentFamilies.all,
    queryFn: async () => {
      const { data } = await axios.get<AdminScentFamilyListResponse>(routes.ADMIN_SCENT_FAMILIES);
      return data.data;
    },
  });
}
