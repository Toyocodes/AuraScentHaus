import {
  ORDER_CHANNEL_LABELS,
  ORDER_CHANNELS,
  PAYMENT_METHOD_LABELS,
  PAYMENT_METHODS,
  type AdminStatsDTO,
} from "@aurascenthaus/shared";
import { formatNaira } from "@/lib/format";

interface ShareRow {
  label: string;
  amount: number;
}

/** One labelled bar per row: the label and value are text, the bar only shows the share. */
function ShareList({ title, rows }: { title: string; rows: ShareRow[] }) {
  const total = rows.reduce((sum, r) => sum + r.amount, 0);
  return (
    <div className="space-y-4">
      <h3 className="eyebrow text-foreground">{title}</h3>
      <ul className="space-y-3">
        {rows.map((r) => {
          const share = total ? Math.round((r.amount / total) * 100) : 0;
          return (
            <li key={r.label} className="space-y-1.5">
              <div className="flex justify-between gap-4 text-sm">
                <span>{r.label}</span>
                <span className="tabular-nums">
                  {formatNaira(r.amount)} <span className="text-muted-foreground">· {share}%</span>
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-muted">
                <div className="h-full rounded-full bg-chart-5" style={{ width: `${share}%` }} />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** Where the money came from: online vs in store, and how people paid. */
export function SalesBreakdown({ stats }: { stats: AdminStatsDTO }) {
  return (
    <section className="space-y-6 rounded-sm border bg-card p-5 sm:p-6">
      <h2 className="text-2xl">Sales breakdown</h2>
      <ShareList
        title="By channel"
        rows={ORDER_CHANNELS.map((c) => ({ label: ORDER_CHANNEL_LABELS[c], amount: stats.revenueByChannel[c] }))}
      />
      <ShareList
        title="By payment method"
        rows={PAYMENT_METHODS.map((m) => ({ label: PAYMENT_METHOD_LABELS[m], amount: stats.revenueByPaymentMethod[m] }))}
      />
    </section>
  );
}
