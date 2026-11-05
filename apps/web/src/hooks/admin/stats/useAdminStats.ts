"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { DEFAULT_STATS_RANGE } from "@aurascenthaus/shared";
import { queryKeys } from "../../helper/query-keys";
import { routes } from "../../helper/routes";
import { useAxios } from "../../useAxios";
import type { AdminStatsParams, AdminStatsResponse } from "./types";

/**
 * Dashboard analytics for a date range: today, yesterday, last 7 days, last month, last 6 months…
 * Keeps the previous range on screen while a new one loads (no flash).
 */
export function useAdminStats({ range = DEFAULT_STATS_RANGE }: AdminStatsParams = {}) {
  const axios = useAxios();

  return useQuery({
    queryKey: queryKeys.admin.stats.range(range),
    queryFn: async () => {
      const { data } = await axios.get<AdminStatsResponse>(routes.ADMIN_STATS, { params: { range } });
      return data.data;
    },
    placeholderData: keepPreviousData,
    refetchInterval: 60 * 1000,
  });
}
