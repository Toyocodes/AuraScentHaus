import { prisma } from "../../config/prisma.js";
import type { Prisma } from "../../generated/prisma/client.js";

export { rankByUnitsSold } from "./rank-by-units-sold.js";

/** Orders that count as a sale: paid, and not cancelled afterwards. */
const COUNTED_ORDER: Prisma.OrderWhereInput = { paidAt: { not: null }, status: { not: "CANCELLED" } };

/** Units sold per product, online and in store, worked out from the orders themselves. */
export async function unitsSoldByProduct(productIds: readonly string[]): Promise<Map<string, number>> {
  const sold = new Map<string, number>();
  if (productIds.length === 0) return sold;

  const byVariant = await prisma.orderItem.groupBy({
    by: ["variantId"],
    where: { order: COUNTED_ORDER, variant: { productId: { in: [...productIds] } } },
    _sum: { quantity: true },
  });
  const variantIds = byVariant.flatMap((row) => (row.variantId ? [row.variantId] : []));
  const variants = await prisma.productVariant.findMany({
    where: { id: { in: variantIds } },
    select: { id: true, productId: true },
  });
  const productOf = new Map(variants.map((v) => [v.id, v.productId]));

  for (const row of byVariant) {
    const productId = row.variantId && productOf.get(row.variantId);
    if (!productId) continue;
    sold.set(productId, (sold.get(productId) ?? 0) + (row._sum.quantity ?? 0));
  }
  return sold;
}
