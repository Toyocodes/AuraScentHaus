import { formatNaira } from "@/lib/format";
import { cn } from "@/lib/utils";

interface PriceProps {
  /** Amount in kobo. */
  amount: number;
  /** Original price in kobo, shown struck through when higher than `amount`. */
  compareAt?: number | null;
  /** Prefix such as "From". */
  prefix?: string;
  className?: string;
}

export function Price({ amount, compareAt, prefix, className }: PriceProps) {
  const onSale = compareAt != null && compareAt > amount;
  return (
    <span className={cn("inline-flex items-baseline gap-2 tabular-nums", className)}>
      {prefix && <span className="text-muted-foreground">{prefix}</span>}
      <span>{formatNaira(amount)}</span>
      {onSale && <span className="text-sm text-muted-foreground line-through">{formatNaira(compareAt)}</span>}
    </span>
  );
}
