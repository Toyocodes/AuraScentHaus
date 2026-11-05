import type { AdminStatsDTO, StatsRangeKey, StatsSeriesPoint } from "@aurascenthaus/shared";
import type { DataResponse } from "../../helper/types";

export type { AdminStatsDTO, StatsRangeKey, StatsSeriesPoint };

/** GET /admin/stats?range=… */
export interface AdminStatsParams {
  range?: StatsRangeKey;
}

export type AdminStatsResponse = DataResponse<AdminStatsDTO>;
