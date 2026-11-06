"use client";

import { useSearchParams } from "next/navigation";
import { DEFAULT_STATS_RANGE, isStatsRangeKey } from "@aurascenthaus/shared";
import { PageHeader, QueryError } from "@/components/common";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminStats } from "@/hooks/admin/stats";
import { cn } from "@/lib/utils";
import { LowStockList } from "../low-stock-list/low-stock-list";
import { RangeFilter } from "../range-filter/range-filter";
import { RecentOrders } from "../recent-orders/recent-orders";
import { RevenueChart } from "../revenue-chart/revenue-chart";
import { SalesBreakdown } from "../sales-breakdown/sales-breakdown";
import { StatsGrid } from "../stats-grid/stats-grid";
import { TopProducts } from "../top-products/top-products";

/**
 * The dashboard, connected to GET /admin/stats. The range lives in the URL (?range=last_6_months),
 * so it survives a refresh and can be shared. Needs a <Suspense> boundary above it.
 */
export function DashboardSection() {
  const requested = useSearchParams().get("range");
  const range = isStatsRangeKey(requested) ? requested : DEFAULT_STATS_RANGE;
  const { data: stats, isPending, isError, error, refetch, isPlaceholderData } = useAdminStats({ range });

  return (
    <>
      <PageHeader eyebrow="Overview" title="Dashboard" actions={<RangeFilter value={range} />} />
      {isPending ? (
        <DashboardBodySkeleton />
      ) : isError ? (
        <QueryError error={error} title="The dashboard didn't load" onRetry={() => void refetch()} />
      ) : (
        <div className={cn("space-y-8 transition-opacity", isPlaceholderData && "opacity-60")}>
          <StatsGrid stats={stats} />
          <div className="grid gap-6 xl:grid-cols-[1fr_22rem]">
            <RevenueChart series={stats.series} rangeLabel={stats.range.label} />
            <SalesBreakdown stats={stats} />
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <TopProducts products={stats.topProducts} />
            <LowStockList items={stats.lowStock} />
          </div>
          <RecentOrders orders={stats.recentOrders} />
        </div>
      )}
    </>
  );
}

function DashboardBodySkeleton() {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-36" />
        ))}
      </div>
      <Skeleton className="h-80" />
    </>
  );
}

/** What shows while the URL is read. */
export function DashboardSkeleton() {
  return (
    <>
      <Skeleton className="h-16 w-72" />
      <DashboardBodySkeleton />
    </>
  );
}
