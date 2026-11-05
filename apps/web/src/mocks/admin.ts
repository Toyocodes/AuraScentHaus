/** TEMPORARY sample data (see catalog.ts). */
import {
  ORDER_CHANNELS,
  ORDER_STATUSES,
  PAYMENT_METHODS,
  bucketIndex,
  buildStatsBuckets,
  previousStatsRange,
  resolveStatsRange,
  startOfShopDay,
  startOfShopMonth,
  statsChartEnd,
  type AdminStatsDTO,
  type OrderChannel,
  type OrderStatus,
  type PaymentMethod,
  type SellableVariantDTO,
  type StatsRangeKey,
  type UserDTO,
} from "@aurascenthaus/shared";
import { mockOrders, mockUser } from "./account";
import { mockProductDetails } from "./catalog";

const lowStock = mockProductDetails
  .flatMap((p) => p.variants.map((v) => ({ variantId: v.id, productName: p.name, sizeMl: v.sizeMl, stock: v.stock })))
  .filter((v) => v.stock <= 5)
  .sort((a, b) => a.stock - b.stock);

export const mockSellableVariants: SellableVariantDTO[] = mockProductDetails.flatMap((p) =>
  p.variants.map((v) => ({
    variantId: v.id,
    productId: p.id,
    productName: p.name,
    sizeMl: v.sizeMl,
    sku: v.sku,
    price: v.price,
    stock: v.stock,
    isActive: v.isActive && p.isActive,
  })),
);

// ─── Fake sales history, so the dashboard's date filter has something to show ───

interface FakeSale {
  paidAt: Date;
  total: number;
  channel: OrderChannel;
  paymentMethod: PaymentMethod;
  productName: string;
  quantity: number;
}

/** Small seeded random generator, so the numbers are the same on every reload. */
function seeded(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function fakeSales(now: Date): FakeSale[] {
  const variants = mockSellableVariants;
  const sales: FakeSale[] = [];
  const hourMs = 60 * 60 * 1000;
  for (let d = 0; d < 420; d++) {
    const dayStart = startOfShopDay(now, d); // shop-local midnight
    const rand = seeded(Math.floor(dayStart.getTime() / hourMs));
    // Busier towards today and on weekends: 0–6 sales a day.
    const growth = 1 + (420 - d) / 420;
    const weekday = new Date(dayStart.getTime() + hourMs).getUTCDay(); // local day of week
    const weekend = weekday === 0 || weekday === 6 ? 1.5 : 1;
    const count = Math.floor(rand() * 3.2 * growth * weekend);
    for (let i = 0; i < count; i++) {
      const v = variants[Math.floor(rand() * variants.length)]!;
      const quantity = rand() < 0.8 ? 1 : 2;
      const inStore = rand() < 0.4;
      const hour = 9 + Math.floor(rand() * 12); // shop open 09:00–21:00
      const paidAt = new Date(dayStart.getTime() + hour * hourMs + Math.floor(rand() * hourMs));
      if (paidAt > now) continue;
      sales.push({
        paidAt,
        total: v.price * quantity,
        channel: inStore ? "IN_STORE" : "ONLINE",
        paymentMethod: inStore ? (["CASH", "CARD", "TRANSFER"] as const)[Math.floor(rand() * 3)]! : "PAYSTACK",
        productName: v.productName,
        quantity,
      });
    }
  }
  return sales;
}

const zeroes = <K extends string>(keys: readonly K[]) =>
  Object.fromEntries(keys.map((k) => [k, 0])) as Record<K, number>;

/** Same shape and range rules as GET /api/admin/stats?range=…, built from fake sales. */
export function mockStatsFor(rangeKey: StatsRangeKey, now: Date = new Date()): AdminStatsDTO {
  const range = resolveStatsRange(rangeKey, now);
  const all = fakeSales(now);
  const from = range.from ?? startOfShopMonth(all.at(-1)?.paidAt ?? now);
  const inRange = (s: FakeSale, a: Date, b: Date) => s.paidAt >= a && s.paidAt < b;
  const sales = all.filter((s) => inRange(s, from, range.to));
  const prevWindow = previousStatsRange(range);
  const prev = prevWindow ? all.filter((s) => inRange(s, prevWindow.from, prevWindow.to)) : null;

  const buckets = buildStatsBuckets(from, statsChartEnd(range, from), range.granularity);
  const series = buckets.map((b) => ({ start: b.start.toISOString(), label: b.label, revenue: 0, orders: 0 }));
  const revenueByChannel = zeroes(ORDER_CHANNELS);
  const revenueByPaymentMethod = zeroes(PAYMENT_METHODS);
  const products = new Map<string, { quantity: number; revenue: number }>();
  let revenue = 0;
  let itemsSold = 0;

  for (const s of sales) {
    revenue += s.total;
    itemsSold += s.quantity;
    revenueByChannel[s.channel] += s.total;
    revenueByPaymentMethod[s.paymentMethod] += s.total;
    const i = bucketIndex(buckets, s.paidAt);
    if (i >= 0) {
      series[i]!.revenue += s.total;
      series[i]!.orders += 1;
    }
    const p = products.get(s.productName) ?? { quantity: 0, revenue: 0 };
    products.set(s.productName, { quantity: p.quantity + s.quantity, revenue: p.revenue + s.total });
  }

  const ordersByStatus = zeroes<OrderStatus>(ORDER_STATUSES);
  ordersByStatus.DELIVERED = Math.round(sales.length * 0.7);
  ordersByStatus.SHIPPED = Math.round(sales.length * 0.1);
  ordersByStatus.PROCESSING = Math.round(sales.length * 0.08);
  ordersByStatus.PAID = sales.length - ordersByStatus.DELIVERED - ordersByStatus.SHIPPED - ordersByStatus.PROCESSING;
  ordersByStatus.PENDING = Math.round(sales.length * 0.06);
  ordersByStatus.CANCELLED = Math.round(sales.length * 0.03);

  return {
    range: { key: range.key, label: range.label, from: from.toISOString(), to: range.to.toISOString(), granularity: range.granularity },
    revenue,
    orders: sales.length,
    averageOrderValue: sales.length ? Math.round(revenue / sales.length) : 0,
    itemsSold,
    newCustomers: Math.round(sales.length * 0.35),
    previous: prev ? { revenue: prev.reduce((n, s) => n + s.total, 0), orders: prev.length } : null,
    revenueByChannel,
    revenueByPaymentMethod,
    ordersByStatus,
    series,
    topProducts: [...products]
      .map(([productName, v]) => ({ productName, ...v }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5),
    customers: 3,
    products: mockProductDetails.length,
    lowStock,
    recentOrders: mockOrders.filter((o) => o.status !== "PENDING").slice(0, 6),
  };
}

export const mockCustomers: (UserDTO & { paidOrders: number })[] = [
  { id: "usr_chioma", email: "chioma@example.com", name: "Chioma Eze", phone: "+234 803 555 0101", role: "CUSTOMER", createdAt: "2026-10-01T12:00:00.000Z", paidOrders: 2 },
  { id: "usr_tunde", email: "tunde@example.com", name: "Tunde Bakare", phone: null, role: "CUSTOMER", createdAt: "2026-10-15T08:30:00.000Z", paidOrders: 1 },
  { id: "usr_ife", email: "ife@example.com", name: null, phone: null, role: "CUSTOMER", createdAt: "2026-11-02T19:45:00.000Z", paidOrders: 0 },
];

export const mockTeam: UserDTO[] = [
  mockUser,
  { id: "usr_kemi", email: "kemi@example.com", name: "Kemi Adeyemi", phone: null, role: "ADMIN", createdAt: "2026-09-20T09:00:00.000Z" },
  ...mockCustomers.map((c): UserDTO => ({
    id: c.id,
    email: c.email,
    name: c.name,
    phone: c.phone,
    role: c.role,
    createdAt: c.createdAt,
  })),
];
