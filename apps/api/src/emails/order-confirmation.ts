import { formatNaira, formatSize, type OrderDTO, type SizeUnit } from "@aurascenthaus/shared";
import { env } from "../config/env.js";
import { sendMail } from "../config/mailer.js";
import { color, emailButton, emailEyebrow, emailHeading, emailLayout, escapeHtml, font } from "./layout.js";

export interface OrderEmailInput {
  to: string;
  name: string | null;
  orderId: string;
  orderNumber: string;
  subtotal: number;
  shippingFee: number;
  total: number;
  items: Array<{ productName: string; sizeMl: number; sizeUnit: SizeUnit; quantity: number; lineTotal: number; imageUrl: string | null }>;
  /** Lines of the delivery address, or null if there isn't one. */
  address: string[] | null;
  /** The delivery option chosen at checkout (null on older orders). */
  delivery: OrderDTO["delivery"];
}

/** A photo, or the perfume's first letter on a sand square when it has none. */
function thumbnail(item: OrderEmailInput["items"][number]): string {
  if (item.imageUrl) {
    return `<img src="${escapeHtml(item.imageUrl)}" alt="" width="56" height="70" style="display:block;width:56px;height:70px;object-fit:cover;border-radius:3px;">`;
  }
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
    <td align="center" valign="middle" width="56" height="70" bgcolor="${color.panel}" style="width:56px;height:70px;border:1px solid ${color.line};border-radius:3px;font-family:${font.serif};font-size:22px;color:${color.goldText};">${escapeHtml(item.productName.charAt(0))}</td>
  </tr></table>`;
}

function totalRow(label: string, value: string, strong = false): string {
  const style = strong
    ? `font-family:${font.serif};font-size:20px;color:${color.ink};padding-top:12px;`
    : `font-size:14px;color:${color.muted};padding-top:6px;`;
  // Georgia's digits are uneven, so the amount stays in the sans font.
  const valueStyle = strong ? `${style}font-family:${font.sans};font-size:18px;font-weight:600;` : style;
  return `<tr>
    <td style="${style}">${escapeHtml(label)}</td>
    <td align="right" style="${valueStyle}">${escapeHtml(value)}</td>
  </tr>`;
}

export function renderOrderConfirmationEmail(order: OrderEmailInput, url: string): string {
  const firstName = order.name?.trim().split(/\s+/)[0];
  const itemCount = order.items.reduce((n, i) => n + i.quantity, 0);

  const rows = order.items
    .map(
      (i) => `<tr>
        <td width="56" valign="top" style="padding:16px 16px 16px 0;border-bottom:1px solid ${color.line};">${thumbnail(i)}</td>
        <td valign="top" style="padding:16px 0;border-bottom:1px solid ${color.line};">
          <p style="margin:0;font-family:${font.serif};font-size:18px;line-height:1.3;color:${color.ink};">${escapeHtml(i.productName)}</p>
          <p style="margin:4px 0 0;font-size:13px;color:${color.muted};">${formatSize(i.sizeMl, i.sizeUnit)} &middot; Qty ${i.quantity}</p>
        </td>
        <td align="right" valign="top" style="padding:16px 0 16px 12px;border-bottom:1px solid ${color.line};font-size:14px;white-space:nowrap;color:${color.ink};">${formatNaira(i.lineTotal)}</td>
      </tr>`,
    )
    .join("");

  const pickup = order.delivery?.method === "PICKUP";
  const deliveryTime = order.delivery?.time
    ? `<p style="margin:6px 0 0;font-size:13px;color:${color.muted};">${pickup ? "Ready" : "Usually arrives in"} ${escapeHtml(order.delivery.time)}</p>`
    : "";
  const address = pickup
    ? `<p style="margin:28px 0 6px;font-size:11px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:${color.goldText};">Store pickup</p>
       <p style="margin:0;font-size:14px;line-height:1.6;color:${color.ink};">We'll let you know when your order is ready to collect from our store.</p>${deliveryTime}`
    : order.address
    ? `<p style="margin:28px 0 6px;font-size:11px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:${color.goldText};">Delivering to</p>
       <p style="margin:0;font-size:14px;line-height:1.6;color:${color.ink};">${order.address.map(escapeHtml).join("<br>")}</p>${deliveryTime}`
    : "";

  return emailLayout({
    title: `Order ${order.orderNumber} confirmed`,
    preheader: `We've received your payment of ${formatNaira(order.total)}. Here's your receipt.`,
    body: `
      <div style="text-align:center;">
        ${emailEyebrow("Order confirmed")}
        ${emailHeading(firstName ? `Thank you, ${firstName}` : "Thank you for your order")}
        <p style="margin:0;color:${color.muted};">We've received your payment and are getting your ${itemCount === 1 ? "item" : "items"} ready.</p>
        <p style="margin:12px 0 0;font-size:13px;color:${color.muted};">Order <strong style="color:${color.ink};">${escapeHtml(order.orderNumber)}</strong></p>
      </div>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:24px;border-top:1px solid ${color.line};">
        ${rows}
      </table>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:10px;">
        ${totalRow("Subtotal", formatNaira(order.subtotal))}
        ${totalRow(pickup ? "Store pickup" : order.delivery ? `Delivery: ${order.delivery.option}` : "Delivery", formatNaira(order.shippingFee))}
        ${totalRow("Total", formatNaira(order.total), true)}
      </table>

      ${address}
      ${emailButton("View your order", url)}`,
  });
}

export async function sendOrderConfirmationEmail(order: OrderEmailInput): Promise<void> {
  const url = `${env.WEB_URL}/account/orders/${order.orderId}`;

  await sendMail({
    to: order.to,
    subject: `Order ${order.orderNumber} confirmed`,
    html: renderOrderConfirmationEmail(order, url),
    text: `Thank you! Order ${order.orderNumber} is confirmed. Total: ${formatNaira(order.total)}. View it at ${url}`,
  });
}
