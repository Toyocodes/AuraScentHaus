import { Suspense } from "react";
import { DEFAULT_STATS_RANGE, isStatsRangeKey } from "@aurascenthaus/shared";
import {
  LowStockList,
  RangeFilter,
  RecentOrders,
  RevenueChart,
  SalesBreakdown,
  StatsGrid,
  TopProducts,
} from "@/components/admin/dashboard";
import { PageHeader } from "@/components/common";
import { Skeleton } from "@/components/ui/skeleton";
import { firstParam } from "@/lib/utils";
import { mockStatsFor } from "@/mocks";

export default function AdminDashboard({ searchParams }: PageProps<"/admin">) {
  return (
    <div className="space-y-8">
      {/* The range lives in the URL (?range=last_6_months), which is only known at request time. */}
      <Suspense fallback={<DashboardSkeleton />}>
        <Dashboard searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

/** Sample data for now. Later: `useAdminStats({ range })`. */
async function Dashboard({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const requested = firstParam((await searchParams).range);
  const range = isStatsRangeKey(requested) ? requested : DEFAULT_STATS_RANGE;
  const stats = mockStatsFor(range);

  return (
    <>
      <PageHeader eyebrow="Overview" title="Dashboard" actions={<RangeFilter value={range} />} />
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
    </>
  );
}

function DashboardSkeleton() {
  return (
    <>
      <Skeleton className="h-16 w-72" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-36" />
        ))}
      </div>
      <Skeleton className="h-80" />
    </>
  );
}
