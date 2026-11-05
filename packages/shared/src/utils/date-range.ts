/**
 * Dashboard date ranges, shared by the API (to query) and the web app (to label).
 * Days and months follow the shop's local time: Africa/Lagos (WAT, UTC+1, no daylight saving).
 */

export const STATS_RANGES = [
  { key: "today", label: "Today" },
  { key: "yesterday", label: "Yesterday" },
  { key: "last_7_days", label: "Last 7 days" },
  { key: "last_30_days", label: "Last 30 days" },
  { key: "this_month", label: "This month" },
  { key: "last_month", label: "Last month" },
  { key: "last_3_months", label: "Last 3 months" },
  { key: "last_6_months", label: "Last 6 months" },
  { key: "last_12_months", label: "Last 12 months" },
  { key: "this_year", label: "This year" },
  { key: "all_time", label: "All time" },
] as const;

export type StatsRangeKey = (typeof STATS_RANGES)[number]["key"];
export const STATS_RANGE_KEYS = STATS_RANGES.map((r) => r.key) as [StatsRangeKey, ...StatsRangeKey[]];
export const DEFAULT_STATS_RANGE: StatsRangeKey = "last_30_days";

export type StatsGranularity = "hour" | "day" | "month";

export interface ResolvedStatsRange {
  key: StatsRangeKey;
  label: string;
  /** Inclusive start. null = all time (the caller picks the earliest data point). */
  from: Date | null;
  /** Exclusive end. */
  to: Date;
  granularity: StatsGranularity;
}

const SHOP_UTC_OFFSET_MS = 60 * 60 * 1000; // WAT = UTC+1
const DAY_MS = 24 * 60 * 60 * 1000;

/** Shift a real instant to the shop's wall clock (read the result with getUTC*). */
const toShop = (d: Date) => new Date(d.getTime() + SHOP_UTC_OFFSET_MS);
const fromShop = (d: Date) => new Date(d.getTime() - SHOP_UTC_OFFSET_MS);

export function startOfShopDay(d: Date, daysBack = 0): Date {
  const s = toShop(d);
  return fromShop(new Date(Date.UTC(s.getUTCFullYear(), s.getUTCMonth(), s.getUTCDate() - daysBack)));
}

export function startOfShopMonth(d: Date, monthsBack = 0): Date {
  const s = toShop(d);
  return fromShop(new Date(Date.UTC(s.getUTCFullYear(), s.getUTCMonth() - monthsBack, 1)));
}

function startOfShopYear(d: Date): Date {
  return fromShop(new Date(Date.UTC(toShop(d).getUTCFullYear(), 0, 1)));
}

export function isStatsRangeKey(value: unknown): value is StatsRangeKey {
  return typeof value === "string" && (STATS_RANGE_KEYS as string[]).includes(value);
}

export function resolveStatsRange(key: StatsRangeKey, now: Date = new Date()): ResolvedStatsRange {
  const label = STATS_RANGES.find((r) => r.key === key)!.label;
  const today = startOfShopDay(now);
  const end = new Date(now.getTime() + 1); // include "right now"
  const r = (from: Date | null, to: Date, granularity: StatsGranularity): ResolvedStatsRange => ({
    key,
    label,
    from,
    to,
    granularity,
  });

  switch (key) {
    case "today":
      return r(today, end, "hour");
    case "yesterday":
      return r(startOfShopDay(now, 1), today, "hour");
    case "last_7_days":
      return r(startOfShopDay(now, 6), end, "day");
    case "last_30_days":
      return r(startOfShopDay(now, 29), end, "day");
    case "this_month":
      return r(startOfShopMonth(now), end, "day");
    case "last_month":
      return r(startOfShopMonth(now, 1), startOfShopMonth(now), "day");
    case "last_3_months":
      return r(startOfShopMonth(now, 2), end, "month");
    case "last_6_months":
      return r(startOfShopMonth(now, 5), end, "month");
    case "last_12_months":
      return r(startOfShopMonth(now, 11), end, "month");
    case "this_year":
      return r(startOfShopYear(now), end, "month");
    case "all_time":
      return r(null, end, "month");
  }
}

/** The same-length window just before a range, for "vs previous period". null for all time. */
export function previousStatsRange(range: { from: Date | null; to: Date }): { from: Date; to: Date } | null {
  if (!range.from) return null;
  const length = range.to.getTime() - range.from.getTime();
  return { from: new Date(range.from.getTime() - length), to: range.from };
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export interface StatsBucket {
  start: Date;
  end: Date;
  label: string;
}

/** Chart buckets (hours, days or months) covering [from, to). */
export function buildStatsBuckets(from: Date, to: Date, granularity: StatsGranularity): StatsBucket[] {
  const buckets: StatsBucket[] = [];
  let start = from;
  while (start < to && buckets.length < 400) {
    const s = toShop(start);
    let end: Date;
    let label: string;
    if (granularity === "hour") {
      end = new Date(start.getTime() + 60 * 60 * 1000);
      label = `${String(s.getUTCHours()).padStart(2, "0")}:00`;
    } else if (granularity === "day") {
      end = new Date(start.getTime() + DAY_MS);
      label = `${s.getUTCDate()} ${MONTHS[s.getUTCMonth()]}`;
    } else {
      end = fromShop(new Date(Date.UTC(s.getUTCFullYear(), s.getUTCMonth() + 1, 1)));
      label = `${MONTHS[s.getUTCMonth()]} ${String(s.getUTCFullYear()).slice(2)}`;
    }
    buckets.push({ start, end, label });
    start = end;
  }
  return buckets;
}

/** Index of the bucket that contains `at`, or -1. Buckets must be sorted (they are). */
export function bucketIndex(buckets: StatsBucket[], at: Date): number {
  const t = at.getTime();
  let lo = 0;
  let hi = buckets.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    const b = buckets[mid]!;
    if (t < b.start.getTime()) hi = mid - 1;
    else if (t >= b.end.getTime()) lo = mid + 1;
    else return mid;
  }
  return -1;
}

/** Where the chart's x-axis ends: hourly charts always show the whole day (00:00–23:00). */
export function statsChartEnd(range: { to: Date; granularity: StatsGranularity }, from: Date): Date {
  return range.granularity === "hour" ? new Date(from.getTime() + DAY_MS) : range.to;
}
