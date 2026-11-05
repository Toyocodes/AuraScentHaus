import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** "Label ........ value" line used in order and cart summaries. */
export function SummaryRow({ label, value, strong }: { label: ReactNode; value: ReactNode; strong?: boolean }) {
  return (
    <div className={cn("flex justify-between gap-4 text-sm", strong && "text-base font-medium")}>
      <span className={strong ? undefined : "text-muted-foreground"}>{label}</span>
      <span className="text-right break-all">{value}</span>
    </div>
  );
}
