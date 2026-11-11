import { formatNaira, formatSize, type SizeUnit } from "@aurascenthaus/shared";
import { env } from "../config/env.js";
import { sendMail } from "../config/mailer.js";
import { color, emailButton, emailEyebrow, emailHeading, emailLayout, escapeHtml, font } from "./layout.js";

/** The order updates customers are emailed about. */
export type NotifiedStatus = "SHIPPED" | "DELIVERED" | "CANCELLED";

export interface OrderStatusEmailInput {
  to: string;
  name: string | null;
  orderId: string;
  orderNumber: string;
  status: NotifiedStatus;
  total: number;
  /** Whether the customer had paid (decides what a cancellation email says about refunds). */
  wasPaid: boolean;
  items: Array<{ productName: string; sizeMl: number; sizeUnit: SizeUnit; quantity: number }>;
  /** Lines of the delivery address, or null if there isn't one. */
  address: string[] | null;
  /** The customer collects it from the store, so "shipped" means ready to collect. */
  pickup: boolean;
}

interface Copy {
  subject: string;
  eyebrow: string;
  heading: (firstName?: string) => string;
  message: string;
}

function copyFor(order: OrderStatusEmailInput): Copy {
  if (order.pickup && order.status === "SHIPPED") {
    return {
      subject: `Your order ${order.orderNumber} is ready to collect`,
      eyebrow: "Ready for pickup",
      heading: (n) => (n ? `It's ready, ${n}` : "Your order is ready to collect"),
      message: "Your order is ready. You can collect it from our store during opening hours. Please bring your order number.",
    };
  }
  if (order.pickup && order.status === "DELIVERED") {
    return {
      subject: `Your order ${order.orderNumber} has been collected`,
      eyebrow: "Order collected",
      heading: (n) => (n ? `Enjoy, ${n}` : "Thank you for collecting your order"),
      message: "Your order has been collected. We hope you love it. If anything isn't right, get in touch and we'll help.",
    };
  }
  switch (order.status) {
    case "SHIPPED":
      return {
        subject: `Your order ${order.orderNumber} is on its way`,
        eyebrow: "Order shipped",
        heading: (n) => (n ? `It's on its way, ${n}` : "Your order is on its way"),
        message: order.address
          ? "Your order has left us and is with the courier. They'll call the number below before they arrive."
          : "Your order has left us and is on its way to you.",
      };
    case "DELIVERED":
      return {
        subject: `Your order ${order.orderNumber} has been delivered`,
        eyebrow: "Order delivered",
        heading: (n) => (n ? `Enjoy, ${n}` : "Your order has arrived"),
        message: "Your order has been delivered. We hope you love it. If anything isn't right, get in touch and we'll help.",
      };
    case "CANCELLED":
      return {
        subject: `Your order ${order.orderNumber} has been cancelled`,
        eyebrow: "Order cancelled",
        heading: () => "Your order has been cancelled",
        message: order.wasPaid
          ? `We've cancelled this order. Your payment of ${formatNaira(order.total)} will be refunded to the card or account you paid with. Banks usually take 5 to 10 working days to show it.`
          : "We've cancelled this order. You haven't been charged.",
      };
  }
}

export function renderOrderStatusEmail(order: OrderStatusEmailInput, url: string, contactUrl: string): string {
  const copy = copyFor(order);
  const firstName = order.name?.trim().split(/\s+/)[0];

  const items = order.items
    .map(
      (i) => `<tr>
        <td style="padding:10px 0;border-bottom:1px solid ${color.line};font-size:14px;color:${color.ink};">${escapeHtml(i.productName)}
          <span style="color:${color.muted};">&middot; ${formatSize(i.sizeMl, i.sizeUnit)}</span></td>
        <td align="right" style="padding:10px 0;border-bottom:1px solid ${color.line};font-size:14px;color:${color.muted};white-space:nowrap;">Qty ${i.quantity}</td>
      </tr>`,
    )
    .join("");

  const address =
    order.address && order.status === "SHIPPED"
      ? `<p style="margin:28px 0 6px;font-size:11px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:${color.goldText};">Delivering to</p>
         <p style="margin:0;font-size:14px;line-height:1.6;color:${color.ink};">${order.address.map(escapeHtml).join("<br>")}</p>`
      : "";

  return emailLayout({
    title: copy.subject,
    preheader: copy.message,
    body: `
      <div style="text-align:center;">
        ${emailEyebrow(copy.eyebrow)}
        ${emailHeading(copy.heading(firstName))}
        <p style="margin:0;color:${color.muted};">${escapeHtml(copy.message)}</p>
        <p style="margin:12px 0 0;font-size:13px;color:${color.muted};">Order <strong style="color:${color.ink};">${escapeHtml(order.orderNumber)}</strong></p>
      </div>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:24px;border-top:1px solid ${color.line};">
        ${items}
      </table>

      ${address}
      ${emailButton("View your order", url)}
      <p style="margin:24px 0 0;text-align:center;font-family:${font.sans};font-size:13px;color:${color.muted};">
        Questions? <a href="${escapeHtml(contactUrl)}" style="color:${color.ink};">Contact us</a>
      </p>`,
  });
}

export async function sendOrderStatusEmail(order: OrderStatusEmailInput): Promise<void> {
  const url = `${env.WEB_URL}/account/orders/${order.orderId}`;
  const copy = copyFor(order);

  await sendMail({
    to: order.to,
    subject: copy.subject,
    html: renderOrderStatusEmail(order, url, `${env.WEB_URL}/contact`),
    text: `${copy.message}\n\nOrder ${order.orderNumber}. View it at ${url}`,
  });
}
