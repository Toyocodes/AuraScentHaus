"use client";

import { useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { CalendarRange } from "lucide-react";
import { STATS_RANGES, type StatsRangeKey } from "@aurascenthaus/shared";
import { Select, SelectContent, SelectItem, SelectSeparator, SelectTrigger, SelectValue } from "@/components/ui/select";

interface RangeFilterProps {
  value: StatsRangeKey;
  /** Leave out to put the range in the URL (?range=…), so it survives refresh and can be shared. */
  onChange?: (range: StatsRangeKey) => void;
}

const GROUPS: StatsRangeKey[][] = [
  ["today", "yesterday"],
  ["last_7_days", "last_30_days", "this_month", "last_month"],
  ["last_3_months", "last_6_months", "last_12_months", "this_year", "all_time"],
];

/** Date range for the whole dashboard. Sits above everything it filters. */
export function RangeFilter({ value, onChange }: RangeFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const label = (key: StatsRangeKey) => STATS_RANGES.find((r) => r.key === key)!.label;

  return (
    <Select
      value={value}
      onValueChange={(v) => {
        const range = v as StatsRangeKey;
        if (onChange) return onChange(range);
        startTransition(() => router.push(`${pathname}?range=${range}`, { scroll: false }));
      }}
    >
      <SelectTrigger className="w-56 bg-card" aria-label="Date range" data-pending={isPending || undefined}>
        <CalendarRange className="text-gold" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {GROUPS.map((group, i) => (
          <div key={group[0]}>
            {i > 0 && <SelectSeparator />}
            {group.map((key) => (
              <SelectItem key={key} value={key}>
                {label(key)}
              </SelectItem>
            ))}
          </div>
        ))}
      </SelectContent>
    </Select>
  );
}
