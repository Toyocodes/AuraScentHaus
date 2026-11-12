import {
  ORDER_STATUS_TRANSITIONS,
  type OrderQuery,
  type OrderStatus,
  type PaginationInput,
} from "@aurascenthaus/shared";
import { prisma } from "../../config/prisma.js";
import type { Prisma } from "../../generated/prisma/client.js";
import { ApiError } from "../../utils/api-error.js";
import { paginated, toSkipTake } from "../../utils/pagination.js";
import { sendOrderStatusEmail, type NotifiedStatus } from "../../emails/order-status.js";
import { notifyUser, quietly, type NotificationInput } from "../notifications/notifications.service.js";
import { addressLines, orderInclude, toOrderDTO, type OrderRow } from "./orders.mapper.js";

// ─── Customer ────────────────────────────────────────────────

/** Unpaid checkout attempts are hidden from the customer's order history. */
const visibleToCustomer: Prisma.OrderWhereInput = { status: { not: "PENDING" } };

export async function listMyOrders(userId: string, query: PaginationInput) {
  const where: Prisma.OrderWhereInput = { userId, ...visibleToCustomer };
  const [rows, total] = await prisma.$transaction([
    prisma.order.findMany({ where, include: orderInclude, orderBy: { createdAt: "desc" }, ...toSkipTake(query) }),
    prisma.order.count({ where }),
  ]);
  return paginated(
    rows.map((o) => toOrderDTO(o)),
    total,
    query,
  );
}

export async function getMyOrder(userId: string, orderId: string) {
  const order = await prisma.order.findFirst({ where: { id: orderId, userId }, include: orderInclude });
  if (!order) throw ApiError.notFound("Order");
  return toOrderDTO(order);
}

// ─── Admin ───────────────────────────────────────────────────

export async function adminListOrders(query: OrderQuery) {
  const where: Prisma.OrderWhereInput = {
    ...(query.status && { status: query.status }),
    ...(query.search && {
      OR: [
        { orderNumber: { contains: query.search, mode: "insensitive" } },
        { user: { email: { contains: query.search, mode: "insensitive" } } },
        { shipFullName: { contains: query.search, mode: "insensitive" } },
        { contactName: { contains: query.search, mode: "insensitive" } },
        { contactPhone: { contains: query.search } },
      ],
    }),
  };
  const [rows, total] = await prisma.$transaction([
    prisma.order.findMany({ where, include: orderInclude, orderBy: { createdAt: "desc" }, ...toSkipTake(query) }),
    prisma.order.count({ where }),
  ]);
  return paginated(
    rows.map((o) => toOrderDTO(o, { includeCustomer: true })),
    total,
    query,
  );
}

export async function adminGetOrder(orderId: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId }, include: orderInclude });
  if (!order) throw ApiError.notFound("Order");
  return toOrderDTO(order, { includeCustomer: true });
}

/**
 * Moves an order through its lifecycle (see ORDER_STATUS_TRANSITIONS).
 * Cancelling puts the stock back: for online orders only once paid (that is when stock
 * is taken), for in-store orders always (stock is taken when the sale is recorded). Refunds are done manually
 * in the Paystack dashboard (or add a refund call here).
 */
export async function adminUpdateOrderStatus(orderId: string, next: OrderStatus) {
  const updated = await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id: orderId }, include: { items: true } });
    if (!order) throw ApiError.notFound("Order");

    if (!ORDER_STATUS_TRANSITIONS[order.status].includes(next)) {
      throw ApiError.badRequest(`Can't change an order from ${order.status} to ${next}`, "INVALID_TRANSITION", {
        allowed: ORDER_STATUS_TRANSITIONS[order.status],
      });
    }

    const stockWasTaken = order.paidAt !== null || order.channel === "IN_STORE";
    if (next === "CANCELLED" && stockWasTaken) {
      for (const item of order.items) {
        if (!item.variantId) continue;
        await tx.productVariant.updateMany({
          where: { id: item.variantId },
          data: { stock: { increment: item.quantity } },
        });
      }
    }

    return tx.order.update({
      where: { id: orderId },
      data: { status: next, ...(STEP_TIME[next] && { [STEP_TIME[next]]: new Date() }) },
      include: orderInclude,
    });
  });

  notifyCustomer(updated);
  if (updated.userId) {
    const message = statusNotification(updated);
    if (message) notifyUser(updated.userId, message).catch(quietly(`Order ${next.toLowerCase()}`));
  }
  return toOrderDTO(updated, { includeCustomer: true });
}

/** The order column that records when it reached each step, for the progress tracker. */
const STEP_TIME: Partial<Record<OrderStatus, "processingAt" | "shippedAt" | "deliveredAt" | "cancelledAt">> = {
  PROCESSING: "processingAt",
  SHIPPED: "shippedAt",
  DELIVERED: "deliveredAt",
  CANCELLED: "cancelledAt",
};

/** The bell message the customer gets for a status change (none for an unpaid checkout being cancelled). */
function statusNotification(order: OrderRow): NotificationInput | null {
  const pickup = order.deliveryMethod === "PICKUP";
  const link = `/account/orders/${order.id}`;
  const n = order.orderNumber;
  switch (order.status) {
    case "PROCESSING":
      return { title: "We're preparing your order", body: `${n} is being packed.`, link };
    case "SHIPPED":
      return pickup
        ? { title: "Ready to collect", body: `${n} is ready for pickup at our store.`, link }
        : { title: "Your order is on its way", body: `${n} is out for delivery.`, link };
    case "DELIVERED":
      return pickup
        ? { title: "Order collected", body: `${n} has been collected. Enjoy!`, link }
        : { title: "Order delivered", body: `${n} has been delivered. Enjoy!`, link };
    case "CANCELLED":
      return order.paidAt ? { title: "Order cancelled", body: `${n} was cancelled. Your refund is on its way.`, link } : null;
    default:
      return null;
  }
}

const NOTIFIED: readonly OrderStatus[] = ["SHIPPED", "DELIVERED", "CANCELLED"] satisfies NotifiedStatus[];

/**
 * Emails the customer when their order ships, arrives or is cancelled. Sent after the change is
 * saved, and a failed email never undoes it. Unpaid checkouts that are cancelled aren't emailed:
 * the customer simply left the payment page.
 */
function notifyCustomer(order: OrderRow) {
  if (!order.user || !NOTIFIED.includes(order.status)) return;
  if (order.status === "CANCELLED" && !order.paidAt) return;

  sendOrderStatusEmail({
    to: order.user.email,
    name: order.user.name,
    orderId: order.id,
    orderNumber: order.orderNumber,
    status: order.status as NotifiedStatus,
    total: order.total,
    wasPaid: order.paidAt !== null,
    items: order.items,
    address: addressLines(order),
    pickup: order.deliveryMethod === "PICKUP",
  }).catch((err) => console.error(`Order ${order.status.toLowerCase()} email failed:`, err));
}
