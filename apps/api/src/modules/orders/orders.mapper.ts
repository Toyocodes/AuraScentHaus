import { formatSize, type OrderDTO } from "@aurascenthaus/shared";
import type { Prisma } from "../../generated/prisma/client.js";

export const orderInclude = {
  items: true,
  payment: true,
  user: { select: { id: true, email: true, name: true, phone: true } },
} satisfies Prisma.OrderInclude;

export type OrderRow = Prisma.OrderGetPayload<{ include: typeof orderInclude }>;

type ShipFields = Pick<OrderRow, "shipFullName" | "shipPhone" | "shipLine1" | "shipLine2" | "shipCity" | "shipState">;

/** The delivery address as lines for an email, or null if it was collected in store. */
export function addressLines(o: ShipFields): string[] | null {
  if (!o.shipLine1) return null;
  return [o.shipFullName, o.shipPhone, o.shipLine1, o.shipLine2, [o.shipCity, o.shipState].filter(Boolean).join(", ")].filter(
    (line): line is string => Boolean(line),
  );
}

function toShippingAddress(o: OrderRow): OrderDTO["shippingAddress"] {
  if (!o.shipLine1 || !o.shipFullName) return null; // collected in store
  return {
    fullName: o.shipFullName,
    phone: o.shipPhone ?? "",
    line1: o.shipLine1,
    line2: o.shipLine2,
    city: o.shipCity ?? "",
    state: o.shipState ?? "",
    country: o.shipCountry ?? "Nigeria",
    postalCode: o.shipPostalCode,
  };
}

export function toOrderDTO(o: OrderRow, opts: { includeCustomer?: boolean } = {}): OrderDTO {
  return {
    id: o.id,
    orderNumber: o.orderNumber,
    status: o.status,
    subtotal: o.subtotal,
    shippingFee: o.shippingFee,
    total: o.total,
    currency: o.currency,
    note: o.note,
    shippingAddress: toShippingAddress(o),
    channel: o.channel,
    paymentMethod: o.paymentMethod,
    contact: {
      name: o.contactName ?? o.user?.name ?? o.shipFullName ?? null,
      phone: o.contactPhone ?? o.user?.phone ?? o.shipPhone ?? null,
    },
    attendant: o.attendantName ? { id: o.attendedById, name: o.attendantName } : null,
    items: o.items.map((i) => ({
      id: i.id,
      variantId: i.variantId,
      productName: i.productName,
      sizeMl: i.sizeMl,
      sizeUnit: i.sizeUnit,
      sizeLabel: formatSize(i.sizeMl, i.sizeUnit),
      unitPrice: i.unitPrice,
      quantity: i.quantity,
      lineTotal: i.lineTotal,
      image: i.imageUrl,
    })),
    payment: o.payment
      ? {
          reference: o.payment.reference,
          status: o.payment.status,
          channel: o.payment.channel,
          paidAt: o.payment.paidAt?.toISOString() ?? null,
        }
      : null,
    ...(opts.includeCustomer && { customer: o.user }),
    createdAt: o.createdAt.toISOString(),
    paidAt: o.paidAt?.toISOString() ?? null,
  };
}
