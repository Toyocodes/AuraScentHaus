import type { AdminStatsDTO } from "@aurascenthaus/shared";
import { formatNaira } from "@/lib/format";

export function TopProducts({ products }: { products: AdminStatsDTO["topProducts"] }) {
  return (
    <section className="space-y-4 rounded-sm border bg-card p-5 sm:p-6">
      <h2 className="text-2xl">Best sellers</h2>
      {products.length === 0 ? (
        <p className="text-sm text-muted-foreground">No sales in this period yet.</p>
      ) : (
        <ol className="divide-y">
          {products.map((p, i) => (
            <li key={p.productName} className="flex items-center gap-4 py-3 text-sm">
              <span className="w-5 font-heading text-xl text-gold">{i + 1}</span>
              <span className="flex-1">
                <span className="block font-medium">{p.productName}</span>
                <span className="text-muted-foreground">{p.quantity} sold</span>
              </span>
              <span className="tabular-nums">{formatNaira(p.revenue)}</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
