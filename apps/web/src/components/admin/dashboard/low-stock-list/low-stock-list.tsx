import type { AdminStatsDTO } from "@aurascenthaus/shared";

export function LowStockList({ items }: { items: AdminStatsDTO["lowStock"] }) {
  return (
    <section className="space-y-4 rounded-sm border bg-card p-5 sm:p-6">
      <h2 className="text-2xl">Low stock</h2>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">Everything is well stocked.</p>
      ) : (
        <ul className="divide-y text-sm">
          {items.map((v) => (
            <li key={v.variantId} className="flex justify-between gap-4 py-3">
              <span>
                {v.productName} · {v.sizeMl} ml
              </span>
              <span className={v.stock <= 0 ? "font-medium text-destructive" : "text-gold"}>
                {v.stock <= 0 ? "Sold out" : `${v.stock} left`}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
