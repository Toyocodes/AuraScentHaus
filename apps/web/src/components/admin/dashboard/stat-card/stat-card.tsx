import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  hint?: string;
  /** % change vs the previous period. null = nothing to compare. */
  change?: number | null;
  /** e.g. "vs previous 30 days" */
  changeLabel?: string;
}

export function StatCard({ label, value, hint, change, changeLabel }: StatCardProps) {
  const hasChange = change !== undefined && change !== null;
  const Icon = !hasChange || change === 0 ? Minus : change > 0 ? ArrowUpRight : ArrowDownRight;

  return (
    <Card className="gap-3 rounded-sm">
      <CardHeader className="gap-2">
        <CardDescription className="eyebrow">{label}</CardDescription>
        <CardTitle className="font-heading text-4xl font-normal tabular-nums">{value}</CardTitle>
      </CardHeader>
      {(hasChange || hint) && (
        <CardContent className="space-y-1 text-sm">
          {hasChange && (
            <p
              className={cn(
                "inline-flex items-center gap-1 font-medium",
                change > 0 && "text-emerald-700 dark:text-emerald-400",
                change < 0 && "text-destructive",
                change === 0 && "text-muted-foreground",
              )}
            >
              <Icon className="size-4" aria-hidden />
              {change > 0 ? "+" : ""}
              {change}%<span className="font-normal text-muted-foreground"> {changeLabel}</span>
            </p>
          )}
          {hint && <p className="text-muted-foreground">{hint}</p>}
        </CardContent>
      )}
    </Card>
  );
}
