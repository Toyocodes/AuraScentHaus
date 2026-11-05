import {
  LOW_STOCK_THRESHOLD,
  ORDER_CHANNELS,
  ORDER_STATUSES,
  PAYMENT_METHODS,
  bucketIndex,
  buildStatsBuckets,
  previousStatsRange,
  resolveStatsRange,
  statsChartEnd,
  startOfShopMonth,
  type AdminStatsDTO,
  type OrderChannel,
  type OrderStatus,
  type PaymentMethod,
  type StatsRangeKey,
} from "@aurascenthaus/shared";
import { prisma } from "../../config/prisma.js";
import type { Prisma } from "../../generated/prisma/client.js";
import { orderInclude, toOrderDTO } from "../orders/orders.mapper.js";

const zeroes = <K extends string>(keys: readonly K[]) =>
  Object.fromEntries(keys.map((k) => [k, 0])) as Record<K, number>;

/** Revenue counts orders that were paid (by paidAt) and not cancelled. */
const paidBetween = (from: Date, to: Date): Prisma.OrderWhereInput => ({
  paidAt: { gte: from, lt: to },
  status: { not: "CANCELLED" },
});

/**
 * Dashboard numbers for a date range (today, last 30 days, last 6 months…).
 * Fine for a boutique's volume. For very large order counts, move the bucketing into SQL.
 */
export async function getDashboardStats(rangeKey: StatsRangeKey, now = new Date()): Promise<AdminStatsDTO> {
  const range = resolveStatsRange(rangeKey, now);

  // "All time" starts at the month of the first paid order.
  let from = range.from;
  if (!from) {
    const first = await prisma.order.findFirst({
      where: { paidAt: { not: null } },
      orderBy: { paidAt: "asc" },
      select: { paidAt: true },
    });
    from = startOfShopMonth(first?.paidAt ?? now);
  }
  const to = range.to;
  const paidWhere = paidBetween(from, to);
  const previous = previousStatsRange(range);

  const [paidOrders, items, topProducts, byStatus, newCustomers, prev, customers, products, lowStock, recent] =
    await Promise.all([
      prisma.order.findMany({ where: paidWhere, select: { total: true, paidAt: true, channel: true, paymentMethod: true } }),
      prisma.orderItem.aggregate({ _sum: { quantity: true }, where: { order: paidWhere } }),
      prisma.orderItem.groupBy({
        by: ["productName"],
        where: { order: paidWhere },
        _sum: { quantity: true, lineTotal: true },
        orderBy: { _sum: { lineTotal: "desc" } },
        take: 5,
      }),
      prisma.order.groupBy({ by: ["status"], where: { createdAt: { gte: from, lt: to } }, _count: { _all: true } }),
      prisma.user.count({ where: { role: "CUSTOMER", createdAt: { gte: from, lt: to } } }),
      previous
        ? prisma.order.aggregate({ where: paidBetween(previous.from, previous.to), _sum: { total: true }, _count: { _all: true } })
        : null,
      prisma.user.count({ where: { role: "CUSTOMER" } }),
      prisma.product.count({ where: { isActive: true } }),
      prisma.productVariant.findMany({
        where: { isActive: true, stock: { lte: LOW_STOCK_THRESHOLD }, product: { isActive: true } },
        orderBy: { stock: "asc" },
        take: 10,
        include: { product: { select: { name: true } } },
      }),
      prisma.order.findMany({
        where: { status: { not: "PENDING" } },
        orderBy: { createdAt: "desc" },
        take: 8,
        include: orderInclude,
      }),
    ]);

  const buckets = buildStatsBuckets(from, statsChartEnd(range, from), range.granularity);
  const series = buckets.map((b) => ({ start: b.start.toISOString(), label: b.label, revenue: 0, orders: 0 }));
  const revenueByChannel = zeroes<OrderChannel>(ORDER_CHANNELS);
  const revenueByPaymentMethod = zeroes<PaymentMethod>(PAYMENT_METHODS);
  let revenue = 0;

  for (const o of paidOrders) {
    revenue += o.total;
    revenueByChannel[o.channel] += o.total;
    revenueByPaymentMethod[o.paymentMethod] += o.total;
    const i = o.paidAt ? bucketIndex(buckets, o.paidAt) : -1;
    if (i >= 0) {
      series[i]!.revenue += o.total;
      series[i]!.orders += 1;
    }
  }

  const ordersByStatus = zeroes<OrderStatus>(ORDER_STATUSES);
  for (const row of byStatus) ordersByStatus[row.status] = row._count._all;

  return {
    range: {
      key: range.key,
      label: range.label,
      from: from.toISOString(),
      to: to.toISOString(),
      granularity: range.granularity,
    },
    revenue,
    orders: paidOrders.length,
    averageOrderValue: paidOrders.length ? Math.round(revenue / paidOrders.length) : 0,
    itemsSold: items._sum.quantity ?? 0,
    newCustomers,
    previous: prev ? { revenue: prev._sum.total ?? 0, orders: prev._count._all } : null,
    revenueByChannel,
    revenueByPaymentMethod,
    ordersByStatus,
    series,
    topProducts: topProducts.map((p) => ({
      productName: p.productName,
      quantity: p._sum.quantity ?? 0,
      revenue: p._sum.lineTotal ?? 0,
    })),
    customers,
    products,
    lowStock: lowStock.map((v) => ({ variantId: v.id, productName: v.product.name, sizeMl: v.sizeMl, stock: v.stock })),
    recentOrders: recent.map((o) => toOrderDTO(o, { includeCustomer: true })),
  };
}
