import { formatSize } from "@aurascenthaus/shared";
/**
 * In-store sales: orders an admin enters for customers who shop in person.
 *
 * - The attendant is always the signed-in admin (first name saved on the order).
 *   It is never read from the request, so it can't be changed or faked.
 * - Stock is taken when the sale is recorded (the customer has the perfume),
 *   and returned if items are edited or the order is cancelled.
 * - A Payment row is created with reference POS-<orderNumber> so in-store and
 *   online orders look the same everywhere else.
 */
import type {
  AddressInput,
  AdminCreateOrderInput,
  AdminOrderCustomer,
  AdminOrderLine,
  AdminUpdateOrderInput,
  OrderDTO,
} from "@aurascenthaus/shared";
import { prisma, type Tx } from "../../config/prisma.js";
import type { OrderStatus, Prisma } from "../../generated/prisma/client.js";
import { ApiError } from "../../utils/api-error.js";
import { attendantFirstName } from "../../utils/attendant.js";
import { generateOrderNumber } from "../../utils/order-number.js";
import { orderInclude, toOrderDTO } from "./orders.mapper.js";

export interface Actor {
  id: string;
  name: string | null;
  email: string;
}

/** Statuses where the delivery address may still change. */
const ADDRESS_EDITABLE: OrderStatus[] = ["PENDING", "PAID", "PROCESSING"];

// ─── Helpers ─────────────────────────────────────────────────

async function resolveCustomer(tx: Tx, customer: AdminOrderCustomer) {
  if (customer.type === "existing") {
    const user = await tx.user.findUnique({ where: { id: customer.customerId } });
    if (!user) throw ApiError.notFound("Customer");
    return { userId: user.id, contactName: user.name, contactPhone: user.phone };
  }

  if (customer.type === "new") {
    const existing = await tx.user.findUnique({ where: { email: customer.email } });
    if (existing) {
      throw ApiError.conflict(
        "A customer with this email already exists. Choose them from your customers instead.",
        "CUSTOMER_EXISTS",
        { customerId: existing.id },
      );
    }
    const user = await tx.user.create({
      data: { email: customer.email, name: customer.name, phone: customer.phone ?? null, role: "CUSTOMER" },
    });
    return { userId: user.id, contactName: user.name, contactPhone: user.phone };
  }

  // Walk-in: no account, just a name and phone for the receipt.
  return { userId: null, contactName: customer.name ?? null, contactPhone: customer.phone ?? null };
}

/** Same size listed twice → one line with the quantities added up. */
function mergeLines(lines: AdminOrderLine[]): AdminOrderLine[] {
  const byVariant = new Map<string, number>();
  for (const l of lines) byVariant.set(l.variantId, (byVariant.get(l.variantId) ?? 0) + l.quantity);
  return [...byVariant].map(([variantId, quantity]) => ({ variantId, quantity }));
}

/** Checks stock, takes it, and returns the price/name snapshot for each line. */
async function takeStock(tx: Tx, input: AdminOrderLine[]) {
  const lines = mergeLines(input);
  const variants = await tx.productVariant.findMany({
    where: { id: { in: lines.map((l) => l.variantId) } },
    include: { product: { select: { name: true, images: { orderBy: { position: "asc" }, take: 1 } } } },
  });

  return Promise.all(
    lines.map(async (line) => {
      const v = variants.find((x) => x.id === line.variantId);
      if (!v) throw ApiError.notFound("Product size");

      // Atomic: only succeeds if there's enough stock at this exact moment.
      const taken = await tx.productVariant.updateMany({
        where: { id: v.id, stock: { gte: line.quantity } },
        data: { stock: { decrement: line.quantity } },
      });
      if (taken.count === 0) {
        throw ApiError.conflict(
          `Only ${v.stock} left of ${v.product.name} ${formatSize(v.sizeMl, v.sizeUnit)}`,
          "INSUFFICIENT_STOCK",
          { variantId: v.id, available: v.stock, requested: line.quantity },
        );
      }

      return {
        variantId: v.id,
        productName: v.product.name,
        sizeMl: v.sizeMl,
        sizeUnit: v.sizeUnit,
        imageUrl: v.product.images[0]?.url ?? null,
        unitPrice: v.price,
        quantity: line.quantity,
        lineTotal: v.price * line.quantity,
      };
    }),
  );
}

async function returnStock(tx: Tx, items: { variantId: string | null; quantity: number }[]) {
  for (const item of items) {
    if (!item.variantId) continue;
    await tx.productVariant.updateMany({ where: { id: item.variantId }, data: { stock: { increment: item.quantity } } });
  }
}

function deliveryFields(address: AddressInput | null) {
  return {
    shipFullName: address?.fullName ?? null,
    shipPhone: address?.phone ?? null,
    shipLine1: address?.line1 ?? null,
    shipLine2: address?.line2 ?? null,
    shipCity: address?.city ?? null,
    shipState: address?.state ?? null,
    shipCountry: address ? (address.country ?? "Nigeria") : null,
    shipPostalCode: address?.postalCode ?? null,
  };
}

/** A paid in-store order is finished (DELIVERED) if they took it, or waits for delivery (PAID). */
const paidStatus = (hasDelivery: boolean): OrderStatus => (hasDelivery ? "PAID" : "DELIVERED");

// ─── Create ──────────────────────────────────────────────────

export async function createInStoreOrder(actor: Actor, input: AdminCreateOrderInput): Promise<OrderDTO> {
  const order = await prisma.$transaction(async (tx) => {
    const customer = await resolveCustomer(tx, input.customer);
    const lines = await takeStock(tx, input.items);

    const subtotal = lines.reduce((sum, l) => sum + l.lineTotal, 0);
    const total = subtotal; // in-store: no shipping fee (add one here if you charge for delivery)
    const now = new Date();
    const paidAt = input.isPaid ? now : null;
    const orderNumber = generateOrderNumber(now);

    return tx.order.create({
      data: {
        orderNumber,
        channel: "IN_STORE",
        paymentMethod: input.paymentMethod,
        status: input.isPaid ? paidStatus(Boolean(input.delivery)) : "PENDING",
        userId: customer.userId,
        contactName: customer.contactName,
        contactPhone: customer.contactPhone,
        attendedById: actor.id,
        attendantName: attendantFirstName(actor),
        subtotal,
        shippingFee: 0,
        total,
        note: input.note ?? null,
        paidAt,
        ...(input.isPaid && !input.delivery && { deliveredAt: now }),
        ...deliveryFields(input.delivery ?? null),
        items: { create: lines },
        payment: {
          create: {
            reference: `POS-${orderNumber}`,
            amount: total,
            status: input.isPaid ? "SUCCESS" : "PENDING",
            channel: input.paymentMethod.toLowerCase(),
            paidAt,
          },
        },
      },
      include: orderInclude,
    });
  });

  return toOrderDTO(order, { includeCustomer: true });
}

// ─── Edit ────────────────────────────────────────────────────

export async function updateOrder(orderId: string, input: AdminUpdateOrderInput): Promise<OrderDTO> {
  const updated = await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id: orderId }, include: { items: true, payment: true } });
    if (!order) throw ApiError.notFound("Order");
    if (order.status === "CANCELLED") throw ApiError.badRequest("Cancelled orders can't be edited", "ORDER_CANCELLED");

    const inStore = order.channel === "IN_STORE";
    const changesSale = input.customer || input.items || input.paymentMethod || input.markAsPaid;
    if (!inStore && changesSale) {
      throw ApiError.badRequest(
        "This order was paid online with Paystack, so only its note and delivery address can be changed.",
        "ONLINE_ORDER_LOCKED",
      );
    }
    // An online order's delivery fee was paid for its option: pickup stays pickup, delivery keeps an address.
    if (!inStore && input.delivery !== undefined && (order.deliveryMethod === "PICKUP" || input.delivery === null)) {
      throw ApiError.badRequest(
        order.deliveryMethod === "PICKUP"
          ? "This order is for store pickup, so it has no delivery address."
          : "An online order's delivery address can be changed but not removed.",
        "ONLINE_DELIVERY_LOCKED",
      );
    }
    if (input.delivery !== undefined && !ADDRESS_EDITABLE.includes(order.status)) {
      throw ApiError.badRequest("The delivery address can't change once an order has shipped or been collected.");
    }

    const data: Prisma.OrderUncheckedUpdateInput = {};
    const payment: Prisma.PaymentUncheckedUpdateInput = {};

    if (input.note !== undefined) data.note = input.note || null;
    if (input.delivery !== undefined) Object.assign(data, deliveryFields(input.delivery));

    if (input.customer) {
      const customer = await resolveCustomer(tx, input.customer);
      Object.assign(data, customer);
    }

    if (input.paymentMethod) {
      data.paymentMethod = input.paymentMethod;
      payment.channel = input.paymentMethod.toLowerCase();
    }

    if (input.items) {
      await returnStock(tx, order.items);
      const lines = await takeStock(tx, input.items);
      const subtotal = lines.reduce((sum, l) => sum + l.lineTotal, 0);
      const total = subtotal + order.shippingFee;
      await tx.orderItem.deleteMany({ where: { orderId } });
      data.items = { create: lines };
      data.subtotal = subtotal;
      data.total = total;
      payment.amount = total;
    }

    if (input.markAsPaid && !order.paidAt) {
      const hasDelivery = input.delivery !== undefined ? input.delivery !== null : Boolean(order.shipLine1);
      const now = new Date();
      data.paidAt = now;
      data.status = paidStatus(hasDelivery);
      if (!hasDelivery) data.deliveredAt = now;
      payment.status = "SUCCESS";
      payment.paidAt = now;
    }

    if (order.payment && Object.keys(payment).length > 0) {
      await tx.payment.update({ where: { id: order.payment.id }, data: payment });
    }

    return tx.order.update({ where: { id: orderId }, data, include: orderInclude });
  });

  return toOrderDTO(updated, { includeCustomer: true });
}
