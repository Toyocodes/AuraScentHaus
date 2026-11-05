/** TEMPORARY sample data (see catalog.ts). */
import type { AddressDTO, CartDTO, CartItemDTO, OrderDTO, UserDTO } from "@aurascenthaus/shared";
import { mockProductDetails } from "./catalog";

export const mockUser: UserDTO = {
  id: "usr_ada",
  email: "ada@example.com",
  name: "Ada Okafor",
  phone: "+234 801 234 5678",
  role: "SUPER_ADMIN",
  createdAt: "2026-09-02T10:00:00.000Z",
};

export const mockAddresses: AddressDTO[] = [
  {
    id: "addr_home",
    fullName: "Ada Okafor",
    phone: "+234 801 234 5678",
    line1: "12 Admiralty Way",
    line2: "Flat 4B",
    city: "Lekki",
    state: "Lagos",
    country: "Nigeria",
    postalCode: null,
    isDefault: true,
  },
  {
    id: "addr_office",
    fullName: "Ada Okafor",
    phone: "+234 801 234 5678",
    line1: "3 Aminu Kano Crescent",
    line2: null,
    city: "Wuse II",
    state: "Abuja",
    country: "Nigeria",
    postalCode: null,
    isDefault: false,
  },
];

function cartItem(slug: string, sizeMl: number, quantity: number): CartItemDTO {
  const p = mockProductDetails.find((x) => x.slug === slug)!;
  const v = p.variants.find((x) => x.sizeMl === sizeMl)!;
  return {
    variantId: v.id,
    quantity,
    unitPrice: v.price,
    lineTotal: v.price * quantity,
    sizeMl,
    stock: v.stock,
    available: true,
    product: { id: p.id, name: p.name, slug: p.slug, image: null },
  };
}

const cartItems = [cartItem("velvet-rose-noir", 50, 1), cartItem("royal-oud", 75, 1), cartItem("citrus-bloom", 100, 2)];

export const mockCart: CartDTO = {
  items: cartItems,
  itemCount: cartItems.reduce((n, i) => n + i.quantity, 0),
  subtotal: cartItems.reduce((n, i) => n + i.lineTotal, 0),
  updatedAt: "2026-11-05T09:30:00.000Z",
};

const home = mockAddresses[0]!;
const shipTo = {
  fullName: home.fullName,
  phone: home.phone,
  line1: home.line1,
  line2: home.line2,
  city: home.city,
  state: home.state,
  country: home.country,
  postalCode: home.postalCode,
};

type Customer = NonNullable<OrderDTO["customer"]>;

interface OrderSeed {
  n: number;
  status: OrderDTO["status"];
  createdAt: string;
  lines: [slug: string, sizeMl: number, qty: number][];
  /** null = walk-in (no account). */
  customer?: Customer | null;
  /** In-store sale: payment method + who served them. */
  inStore?: { method: "CASH" | "CARD" | "TRANSFER"; attendant: string; walkIn?: { name: string; phone: string | null } };
  delivery?: boolean;
}

function order({ n, status, createdAt, lines, customer = me, inStore, delivery = !inStore }: OrderSeed): OrderDTO {
  const items = lines.map(([slug, sizeMl, quantity], i) => {
    const c = cartItem(slug, sizeMl, quantity);
    return {
      id: `oi_${n}_${i}`,
      variantId: c.variantId,
      productName: c.product.name,
      sizeMl,
      unitPrice: c.unitPrice,
      quantity,
      lineTotal: c.lineTotal,
      image: null,
    };
  });
  const subtotal = items.reduce((s, i) => s + i.lineTotal, 0);
  const paid = status !== "PENDING" && status !== "CANCELLED";
  const orderNumber = `ASH-${createdAt.slice(2, 10).replaceAll("-", "")}-${String(10000 + n * 731).slice(0, 5)}`;
  return {
    id: `ord_${n}`,
    orderNumber,
    status,
    subtotal,
    shippingFee: 0,
    total: subtotal,
    currency: "NGN",
    note: n === 1 ? "Please gift wrap." : null,
    shippingAddress: delivery ? shipTo : null,
    channel: inStore ? "IN_STORE" : "ONLINE",
    paymentMethod: inStore?.method ?? "PAYSTACK",
    contact: {
      name: inStore?.walkIn?.name ?? customer?.name ?? null,
      phone: inStore?.walkIn?.phone ?? customer?.phone ?? null,
    },
    attendant: inStore ? { id: inStore.attendant === "Ada" ? mockUser.id : "usr_kemi", name: inStore.attendant } : null,
    items,
    payment: {
      reference: inStore ? `POS-${orderNumber}` : `ASH_${n}_7f3k${n}q`,
      status: paid ? "SUCCESS" : status === "CANCELLED" ? "ABANDONED" : "PENDING",
      channel: paid ? (inStore?.method.toLowerCase() ?? "card") : null,
      paidAt: paid ? createdAt : null,
    },
    customer,
    createdAt,
    paidAt: paid ? createdAt : null,
  };
}

const me: Customer = { id: mockUser.id, email: mockUser.email, name: mockUser.name, phone: mockUser.phone };
const chioma: Customer = { id: "usr_chioma", email: "chioma@example.com", name: "Chioma Eze", phone: "+234 803 555 0101" };
const tunde: Customer = { id: "usr_tunde", email: "tunde@example.com", name: "Tunde Bakare", phone: null };

export const mockOrders: OrderDTO[] = [
  order({ n: 7, status: "DELIVERED", createdAt: "2026-11-05T10:12:00.000Z", lines: [["royal-oud", 30, 1]], customer: chioma, inStore: { method: "CARD", attendant: "Ada" } }),
  order({ n: 8, status: "DELIVERED", createdAt: "2026-11-05T09:40:00.000Z", lines: [["citrus-bloom", 100, 2]], customer: null, inStore: { method: "CASH", attendant: "Kemi", walkIn: { name: "Bisi", phone: "+234 809 111 2233" } } }),
  order({ n: 1, status: "PAID", createdAt: "2026-11-04T15:20:00.000Z", lines: [["velvet-rose-noir", 100, 1], ["citrus-bloom", 100, 1]] }),
  order({ n: 9, status: "PENDING", createdAt: "2026-11-04T12:05:00.000Z", lines: [["amber-nights", 100, 1]], customer: tunde, inStore: { method: "TRANSFER", attendant: "Kemi" } }),
  order({ n: 2, status: "PROCESSING", createdAt: "2026-11-03T11:05:00.000Z", lines: [["cedar-smoke", 50, 2]], customer: chioma }),
  order({ n: 3, status: "SHIPPED", createdAt: "2026-10-28T18:40:00.000Z", lines: [["royal-oud", 75, 1]], customer: tunde }),
  order({ n: 10, status: "PAID", createdAt: "2026-10-20T16:30:00.000Z", lines: [["jasmine-silk", 50, 1]], inStore: { method: "TRANSFER", attendant: "Ada" }, delivery: true }),
  order({ n: 4, status: "DELIVERED", createdAt: "2026-10-12T09:15:00.000Z", lines: [["amber-nights", 50, 1], ["jasmine-silk", 30, 1]] }),
  order({ n: 5, status: "PENDING", createdAt: "2026-11-05T08:02:00.000Z", lines: [["midnight-oud", 100, 1]], customer: chioma }),
  order({ n: 6, status: "CANCELLED", createdAt: "2026-10-02T13:30:00.000Z", lines: [["santal-dune", 100, 1]], customer: tunde }),
];

/** What the customer sees in their account (unpaid attempts are hidden, like the API does). */
export const mockMyOrders = mockOrders.filter((o) => o.customer?.id === mockUser.id && o.status !== "PENDING");
export const findMockOrder = (id: string) => mockOrders.find((o) => o.id === id);
