"use client";

import { useState } from "react";
import type { StatsSeriesPoint } from "@aurascenthaus/shared";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatNaira, formatNairaCompact } from "@/lib/format";
import { cn } from "@/lib/utils";

const CHART_HEIGHT = 220;
const MAX_X_LABELS = 8;

/** Rounds the axis top up to a clean step (1, 2, 2.5 or 5 × 10ⁿ) so ticks read nicely. */
function niceMax(value: number) {
  if (value <= 0) return 100_00; // ₦100 so an empty chart still has an axis
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const step = [1, 2, 2.5, 5, 10].find((s) => s * magnitude >= value)!;
  return step * magnitude;
}

interface RevenueChartProps {
  series: StatsSeriesPoint[];
  /** e.g. "Last 30 days" */
  rangeLabel: string;
}

/**
 * Revenue per hour / day / month as columns (one series, so no legend).
 * Hover or focus a column for the exact amount. "View as table" lists every value.
 */
export function RevenueChart({ series, rangeLabel }: RevenueChartProps) {
  const [active, setActive] = useState<number | null>(null);
  const max = niceMax(Math.max(0, ...series.map((p) => p.revenue)));
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => f * max);
  const labelEvery = Math.max(1, Math.ceil(series.length / MAX_X_LABELS));
  const hovered = active !== null ? series[active] : null;

  return (
    <section className="space-y-4 rounded-sm border bg-card p-5 sm:p-6">
      <div>
        <h2 className="text-2xl">Revenue</h2>
        <p className="text-sm text-muted-foreground">Paid orders, {rangeLabel.toLowerCase()}</p>
      </div>

      <div className="grid grid-cols-[3.25rem_1fr] gap-2">
        {/* y-axis labels */}
        <div className="relative text-right text-[0.6875rem] text-muted-foreground tabular-nums" style={{ height: CHART_HEIGHT }}>
          {ticks.map((t) => (
            <span key={t} className="absolute right-0 -translate-y-1/2" style={{ bottom: `${(t / max) * 100}%` }}>
              {formatNairaCompact(t)}
            </span>
          ))}
        </div>

        <div>
          <div className="relative" style={{ height: CHART_HEIGHT }} onPointerLeave={() => setActive(null)}>
            {/* hairline gridlines */}
            {ticks.map((t) => (
              <div key={t} className="absolute inset-x-0 border-t border-border" style={{ bottom: `${(t / max) * 100}%` }} />
            ))}

            {/* columns: max 24px wide, 2px gaps, rounded top, square at the baseline */}
            <div className="absolute inset-0 flex items-end gap-[2px]">
              {series.map((p, i) => (
                <div
                  key={p.start}
                  role="img"
                  tabIndex={0}
                  aria-label={`${p.label}: ${formatNaira(p.revenue)}, ${p.orders} orders`}
                  className="group relative flex h-full flex-1 cursor-default items-end justify-center outline-none"
                  onPointerEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  onBlur={() => setActive(null)}
                >
                  <div
                    className={cn(
                      "w-full max-w-6 rounded-t-[4px] bg-chart-5 transition-opacity group-focus-visible:ring-2 group-focus-visible:ring-ring",
                      active !== null && active !== i && "opacity-45",
                    )}
                    style={{ height: `${(p.revenue / max) * 100}%`, minHeight: p.revenue > 0 ? 2 : 0 }}
                  />
                </div>
              ))}
            </div>

            {/* tooltip: value first, then the period */}
            {hovered && active !== null && (
              <div
                className="pointer-events-none absolute -top-2 z-10 -translate-x-1/2 -translate-y-full rounded-sm border bg-popover px-3 py-2 text-sm whitespace-nowrap shadow-md"
                style={{ left: `${((active + 0.5) / series.length) * 100}%` }}
              >
                <p className="font-medium tabular-nums">{formatNaira(hovered.revenue)}</p>
                <p className="text-xs text-muted-foreground">
                  {hovered.label} · {hovered.orders} {hovered.orders === 1 ? "order" : "orders"}
                </p>
              </div>
            )}
          </div>

          {/* x-axis labels (thinned so they never collide) */}
          <div className="mt-2 flex gap-[2px] text-[0.6875rem] text-muted-foreground">
            {series.map((p, i) => (
              <span key={p.start} className="flex-1 truncate text-center">
                {i % labelEvery === 0 ? p.label : ""}
              </span>
            ))}
          </div>
        </div>
      </div>

      <details className="text-sm">
        <summary className="cursor-pointer text-muted-foreground hover:text-foreground">View as table</summary>
        <div className="mt-3 max-h-72 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Period</TableHead>
                <TableHead className="text-right">Orders</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {series.map((p) => (
                <TableRow key={p.start}>
                  <TableCell>{p.label}</TableCell>
                  <TableCell className="text-right tabular-nums">{p.orders}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatNaira(p.revenue)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </details>
    </section>
  );
}
