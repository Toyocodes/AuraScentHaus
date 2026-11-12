import { formatNaira, ROLE_PERMISSIONS, type NotificationDTO, type NotificationsResponse, type Role } from "@aurascenthaus/shared";
import { prisma } from "../../config/prisma.js";
import type { Notification } from "../../generated/prisma/client.js";
import { ApiError } from "../../utils/api-error.js";

const LIST_LIMIT = 20;

export interface NotificationInput {
  title: string;
  body: string;
  link?: string | null;
}

function toNotificationDTO(n: Notification): NotificationDTO {
  return {
    id: n.id,
    title: n.title,
    body: n.body,
    link: n.link,
    readAt: n.readAt?.toISOString() ?? null,
    createdAt: n.createdAt.toISOString(),
  };
}

/** The bell: the latest notifications and how many are unread. */
export async function listNotifications(userId: string): Promise<NotificationsResponse> {
  const [rows, unreadCount] = await Promise.all([
    prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: LIST_LIMIT }),
    prisma.notification.count({ where: { userId, readAt: null } }),
  ]);
  return { data: rows.map(toNotificationDTO), unreadCount };
}

export async function markRead(userId: string, notificationId: string) {
  const { count } = await prisma.notification.updateMany({
    where: { id: notificationId, userId, readAt: null },
    data: { readAt: new Date() },
  });
  if (count === 0 && !(await prisma.notification.findFirst({ where: { id: notificationId, userId }, select: { id: true } }))) {
    throw ApiError.notFound("Notification");
  }
}

export async function markAllRead(userId: string) {
  await prisma.notification.updateMany({ where: { userId, readAt: null }, data: { readAt: new Date() } });
}

// ─── Sending ─────────────────────────────────────────────────

/** Roles that see orders in the admin, so they hear about new paid orders. */
const ORDER_ROLES = (Object.keys(ROLE_PERMISSIONS) as Role[]).filter((role) => ROLE_PERMISSIONS[role].includes("orders:read"));

/** One notification per admin, so each one has their own read state. */
export async function notifyAdmins(input: NotificationInput) {
  const admins = await prisma.user.findMany({ where: { role: { in: ORDER_ROLES } }, select: { id: true } });
  if (admins.length === 0) return;
  await prisma.notification.createMany({
    data: admins.map((a) => ({ userId: a.id, title: input.title, body: input.body, link: input.link ?? null })),
  });
}

export async function notifyUser(userId: string, input: NotificationInput) {
  await prisma.notification.create({ data: { userId, title: input.title, body: input.body, link: input.link ?? null } });
}

/** A failed notification is logged and never undoes the payment or status change it is about. */
export const quietly = (what: string) => (err: unknown) => console.error(`${what} notification failed:`, err);

export const newPaidOrderNotification = (order: {
  id: string;
  orderNumber: string;
  total: number;
  customerName: string | null;
  pickup: boolean;
}): NotificationInput => ({
  title: "New paid order",
  body: `${order.orderNumber} · ${formatNaira(order.total)}${order.customerName ? ` from ${order.customerName}` : ""}${order.pickup ? " · store pickup" : ""}`,
  link: `/admin/orders/${order.id}`,
});
