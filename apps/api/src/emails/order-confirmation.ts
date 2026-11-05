import { formatNaira } from "@aurascenthaus/shared";
import { env } from "../config/env.js";
import { sendMail } from "../config/mailer.js";
import { emailLayout, escapeHtml } from "./layout.js";

interface OrderEmailInput {
  to: string;
  name: string | null;
  orderId: string;
  orderNumber: string;
  total: number;
  items: Array<{ productName: string; sizeMl: number; quantity: number; lineTotal: number }>;
}

export async function sendOrderConfirmationEmail(order: OrderEmailInput): Promise<void> {
  const rows = order.items
    .map(
      (i) => `<tr>
        <td style="padding:6px 0;">${escapeHtml(i.productName)} (${i.sizeMl}ml) × ${i.quantity}</td>
        <td align="right" style="padding:6px 0;">${formatNaira(i.lineTotal)}</td>
      </tr>`,
    )
    .join("");

  const url = `${env.WEB_URL}/account/orders/${order.orderId}`;
  const greeting = order.name ? `Hi ${escapeHtml(order.name)},` : "Hi,";

  const html = emailLayout(
    `Order ${order.orderNumber} confirmed`,
    `<p>${greeting}</p>
     <p>Thank you! We've received your payment for order <strong>${order.orderNumber}</strong>.</p>
     <table role="presentation" width="100%" style="border-top:1px solid #e7e5e4;border-bottom:1px solid #e7e5e4;margin:16px 0;">${rows}
       <tr><td style="padding:8px 0;font-weight:bold;">Total</td><td align="right" style="padding:8px 0;font-weight:bold;">${formatNaira(order.total)}</td></tr>
     </table>
     <p><a href="${url}" style="color:#1c1917;">View your order</a></p>`,
  );

  await sendMail({
    to: order.to,
    subject: `Order ${order.orderNumber} confirmed`,
    html,
    text: `Thank you! Order ${order.orderNumber} is confirmed. Total: ${formatNaira(order.total)}. View it at ${url}`,
  });
}
