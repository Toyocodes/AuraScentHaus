import { createHmac } from "node:crypto";
import type { CheckoutInput, CheckoutResponse } from "@aurascenthaus/shared";
import { env } from "../../config/env.js";
import { initializeTransaction, paystackSecret, verifyTransaction } from "../../config/paystack.js";
import { prisma } from "../../config/prisma.js";
import { sendOrderConfirmationEmail } from "../../emails/order-confirmation.js";
import type { PaymentStatus } from "../../generated/prisma/client.js";
import { ApiError } from "../../utils/api-error.js";
import { randomHex, safeEqual } from "../../utils/crypto.js";
import { generateOrderNumber } from "../../utils/order-number.js";
import { calculateShippingFee } from "../orders/shipping.js";
import { orderInclude, toOrderDTO } from "../orders/orders.mapper.js";

/**
 * Checkout flow
 * 1. POST /payments/checkout: snapshot the cart into a PENDING order + payment,
 *    then get a Paystack payment page URL.
 * 2. Customer pays on Paystack and is redirected to WEB_URL/checkout/callback.
 * 3. Paystack calls POST /payments/webhook (server to server). We verify the
 *    signature AND re-verify the transaction with Paystack, then mark the order
 *    PAID, decrement stock and clear those items from the cart.
 *    GET /payments/verify/:reference runs the same idempotent step, so the
 *    callback page works even if the webhook is delayed (or in local dev,
 *    where Paystack can't reach localhost).
 */
export async function startCheckout(
  user: { id: string; email: string },
  input: CheckoutInput,
): Promise<CheckoutResponse> {
  const cart = await prisma.cart.findUnique({
    where: { userId: user.id },
    include: {
      items: {
        include: {
          variant: {
            include: {
              product: {
                select: { name: true, isActive: true, images: { orderBy: { position: "asc" }, take: 1 } },
              },
            },
          },
        },
      },
    },
  });

  if (!cart || cart.items.length === 0) throw ApiError.badRequest("Your cart is empty", "CART_EMPTY");

  // Validate availability + stock for every line.
  const problems = cart.items
    .filter((i) => !i.variant.isActive || !i.variant.product.isActive || i.variant.stock < i.quantity)
    .map((i) => ({
      variantId: i.variantId,
      name: i.variant.product.name,
      requested: i.quantity,
      available: i.variant.isActive && i.variant.product.isActive ? i.variant.stock : 0,
    }));
  if (problems.length > 0) {
    throw ApiError.conflict("Some items in your cart are no longer available", "CART_UNAVAILABLE", problems);
  }

  // Resolve shipping address.
  let address;
  if (input.addressId) {
    address = await prisma.address.findFirst({ where: { id: input.addressId, userId: user.id } });
    if (!address) throw ApiError.notFound("Address");
  } else {
    address = input.address!;
    if (input.saveAddress) {
      const hasAny = await prisma.address.count({ where: { userId: user.id } });
      await prisma.address.create({ data: { ...address, userId: user.id, isDefault: hasAny === 0 } });
    }
  }

  const lines = cart.items.map((i) => ({
    variantId: i.variantId,
    productName: i.variant.product.name,
    sizeMl: i.variant.sizeMl,
    sizeUnit: i.variant.sizeUnit,
    imageUrl: i.variant.product.images[0]?.url ?? null,
    unitPrice: i.variant.price,
    quantity: i.quantity,
    lineTotal: i.variant.price * i.quantity,
  }));
  const subtotal = lines.reduce((sum, l) => sum + l.lineTotal, 0);
  const shippingFee = calculateShippingFee(subtotal, address.state);
  const total = subtotal + shippingFee;

  const orderNumber = generateOrderNumber();
  const reference = `${orderNumber}-${randomHex(3)}`;

  const order = await prisma.order.create({
    data: {
      orderNumber,
      userId: user.id,
      subtotal,
      shippingFee,
      total,
      note: input.note ?? null,
      shipFullName: address.fullName,
      shipPhone: address.phone,
      shipLine1: address.line1,
      shipLine2: address.line2 ?? null,
      shipCity: address.city,
      shipState: address.state,
      shipCountry: address.country,
      shipPostalCode: address.postalCode ?? null,
      contactName: address.fullName,
      contactPhone: address.phone,
      items: { create: lines },
      payment: { create: { reference, amount: total } },
    },
  });

  try {
    const tx = await initializeTransaction({
      email: user.email,
      amount: total,
      reference,
      callbackUrl: `${env.WEB_URL}/checkout/callback`,
      metadata: { orderId: order.id, orderNumber, userId: user.id },
    });
    return { orderId: order.id, orderNumber, reference, authorizationUrl: tx.authorization_url };
  } catch (err) {
    await prisma.$transaction([
      prisma.payment.update({ where: { reference }, data: { status: "FAILED" } }),
      prisma.order.update({ where: { id: order.id }, data: { status: "CANCELLED" } }),
    ]);
    throw err;
  }
}

/**
 * Idempotent: safe to call from both the webhook and the verify endpoint,
 * any number of times. Always re-checks with Paystack; never trusts the client.
 */
export async function confirmPayment(reference: string) {
  const payment = await prisma.payment.findUnique({ where: { reference }, include: { order: { select: { channel: true } } } });
  // In-store payments (POS-…) are confirmed by an admin, never through Paystack.
  if (!payment || payment.order.channel !== "ONLINE") throw ApiError.notFound("Payment");
  if (payment.status === "SUCCESS") return { fulfilledNow: false, orderId: payment.orderId };

  const tx = await verifyTransaction(reference);

  if (tx.status !== "success") {
    const status: PaymentStatus | null =
      tx.status === "failed" ? "FAILED" : tx.status === "abandoned" ? "ABANDONED" : null;
    if (status) {
      await prisma.payment.update({ where: { id: payment.id }, data: { status, gatewayData: tx as object } });
    }
    return { fulfilledNow: false, orderId: payment.orderId };
  }

  if (tx.amount !== payment.amount || tx.currency !== payment.currency) {
    console.error(`⚠️ Payment ${reference} amount mismatch: got ${tx.amount} ${tx.currency}, expected ${payment.amount}`);
    await prisma.payment.update({ where: { id: payment.id }, data: { status: "FAILED", gatewayData: tx as object } });
    throw ApiError.badRequest("Payment amount mismatch", "AMOUNT_MISMATCH");
  }

  const paidAt = tx.paid_at ? new Date(tx.paid_at) : new Date();

  const fulfilledNow = await prisma.$transaction(async (db) => {
    // Guard against the webhook and verify endpoint racing each other.
    const claimed = await db.payment.updateMany({
      where: { id: payment.id, status: { not: "SUCCESS" } },
      data: { status: "SUCCESS", channel: tx.channel, paidAt, gatewayData: tx as object },
    });
    if (claimed.count === 0) return false;

    const order = await db.order.update({
      where: { id: payment.orderId },
      data: { status: "PAID", paidAt },
      include: { items: true },
    });

    const variantIds: string[] = [];
    for (const item of order.items) {
      if (!item.variantId) continue;
      variantIds.push(item.variantId);
      // Note: if two customers paid for the last unit at the same moment, stock can
      // dip below 0. The admin dashboard's low-stock list will show it.
      await db.productVariant.updateMany({
        where: { id: item.variantId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    if (order.userId) {
      await db.cartItem.deleteMany({ where: { cart: { userId: order.userId }, variantId: { in: variantIds } } });
    }
    return true;
  });

  if (fulfilledNow) {
    const order = await prisma.order.findUniqueOrThrow({ where: { id: payment.orderId }, include: orderInclude });
    // Online orders always belong to a signed-in customer.
    if (order.user) sendOrderConfirmationEmail({
      to: order.user.email,
      name: order.user.name,
      orderId: order.id,
      orderNumber: order.orderNumber,
      subtotal: order.subtotal,
      shippingFee: order.shippingFee,
      total: order.total,
      items: order.items,
      address: order.shipLine1
        ? ([
            order.shipFullName,
            order.shipPhone,
            order.shipLine1,
            order.shipLine2,
            [order.shipCity, order.shipState].filter(Boolean).join(", "),
          ].filter(Boolean) as string[])
        : null,
    }).catch((err) => console.error("Order confirmation email failed:", err));
  }

  return { fulfilledNow, orderId: payment.orderId };
}

/** For the /checkout/callback page. Only the order's owner may check it. */
export async function verifyForUser(userId: string, reference: string) {
  const payment = await prisma.payment.findUnique({ where: { reference }, include: { order: true } });
  if (!payment || payment.order.userId !== userId) throw ApiError.notFound("Payment");

  await confirmPayment(reference);

  const order = await prisma.order.findUniqueOrThrow({ where: { id: payment.orderId }, include: orderInclude });
  return toOrderDTO(order);
}

/** Paystack signs webhooks with HMAC-SHA512 of the raw body using your secret key. */
export function isValidPaystackSignature(rawBody: Buffer, signature: string | undefined): boolean {
  if (!signature) return false;
  const expected = createHmac("sha512", paystackSecret()).update(rawBody).digest("hex");
  return safeEqual(expected, signature);
}
