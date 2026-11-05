import type { AdminStatsDTO } from "@aurascenthaus/shared";
import { formatNaira, percentChange } from "@/lib/format";
import { StatCard } from "../stat-card/stat-card";

/** Headline numbers for the selected range, each compared with the period before it. */
export function StatsGrid({ stats }: { stats: AdminStatsDTO }) {
  const prev = stats.previous;
  const vs = "vs previous period";

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label="Revenue"
        value={formatNaira(stats.revenue)}
        change={prev ? percentChange(stats.revenue, prev.revenue) : null}
        changeLabel={vs}
      />
      <StatCard
        label="Paid orders"
        value={stats.orders.toLocaleString("en-NG")}
        change={prev ? percentChange(stats.orders, prev.orders) : null}
        changeLabel={vs}
      />
      <StatCard
        label="Average order"
        value={formatNaira(stats.averageOrderValue)}
        hint={`${stats.itemsSold.toLocaleString("en-NG")} bottles sold`}
      />
      <StatCard
        label="New customers"
        value={stats.newCustomers.toLocaleString("en-NG")}
        hint={`${stats.customers.toLocaleString("en-NG")} customers in total · ${stats.products} products live`}
      />
    </div>
  );
}
