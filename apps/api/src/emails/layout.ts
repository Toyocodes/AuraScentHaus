import { env } from "../config/env.js";

/**
 * Shared look for every email, matching the store: ivory, espresso and gold.
 * Email apps ignore most modern CSS, so this uses tables and inline styles, plus system fonts
 * (web fonts don't load in Gmail or Outlook).
 */
export const color = {
  page: "#F3EEE6",
  card: "#FFFDF9",
  panel: "#F7F2E9",
  line: "#E6DCCB",
  espresso: "#2B1F17",
  ink: "#2B1F17",
  muted: "#75695D",
  gold: "#C9A45C", // on espresso
  goldText: "#8A6A2B", // on light backgrounds (readable at small sizes)
  ivory: "#F7F3EC",
};

export const font = {
  serif: "Georgia,'Times New Roman',serif",
  sans: "'Helvetica Neue',Helvetica,Arial,sans-serif",
};

interface EmailLayoutInput {
  /** The <title>, shown by some email apps. */
  title: string;
  /** Grey preview text beside the subject in the inbox. Not shown in the email itself. */
  preheader: string;
  body: string;
}

export function emailLayout({ title, preheader, body }: EmailLayoutInput): string {
  const year = new Date().getFullYear();

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <meta name="color-scheme" content="light only">
    <meta name="supported-color-schemes" content="light only">
    <title>${escapeHtml(title)}</title>
    <style>
      @media (max-width: 600px) {
        .outer { padding: 0 !important; }
        .card { border-radius: 0 !important; }
        .pad { padding-left: 24px !important; padding-right: 24px !important; }
        .heading { font-size: 26px !important; }
      }
    </style>
  </head>
  <body style="margin:0;padding:0;background-color:${color.page};color:${color.ink};-webkit-text-size-adjust:100%;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${escapeHtml(preheader)}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${color.page}">
      <tr>
        <td align="center" class="outer" style="padding:40px 16px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="card" style="max-width:560px;border-radius:6px;overflow:hidden;">
            <tr>
              <td align="center" bgcolor="${color.espresso}" style="padding:28px 24px;border-bottom:3px solid ${color.gold};">
                <a href="${env.WEB_URL}" style="font-family:${font.serif};font-size:20px;letter-spacing:5px;text-transform:uppercase;text-decoration:none;color:${color.ivory};">Aura<span style="color:${color.gold};">Scent</span>Haus</a>
              </td>
            </tr>
            <tr>
              <td bgcolor="${color.card}" class="pad" style="padding:44px 44px 40px;font-family:${font.sans};font-size:15px;line-height:1.65;color:${color.ink};">
                ${body}
              </td>
            </tr>
            <tr>
              <td align="center" bgcolor="${color.panel}" class="pad" style="padding:24px 44px;border-top:1px solid ${color.line};font-family:${font.sans};font-size:12px;line-height:1.6;color:${color.muted};">
                <a href="${env.WEB_URL}/products" style="color:${color.ink};text-decoration:none;">Shop perfumes</a>
                &nbsp;&middot;&nbsp;
                <a href="${env.WEB_URL}/account/orders" style="color:${color.ink};text-decoration:none;">My orders</a>
                <br><br>
                Signature fragrances, delivered across Nigeria.<br>
                &copy; ${year} AuraScentHaus. You received this email because of activity on your account.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

/** Small gold label above a heading. */
export function emailEyebrow(text: string): string {
  return `<p style="margin:0 0 10px;font-size:11px;font-weight:600;letter-spacing:3px;text-transform:uppercase;color:${color.goldText};">${escapeHtml(text)}</p>`;
}

export function emailHeading(text: string): string {
  return `<h1 class="heading" style="margin:0 0 16px;font-family:${font.serif};font-size:30px;font-weight:400;line-height:1.2;color:${color.ink};">${escapeHtml(text)}</h1>`;
}

/** A solid button that also works in Outlook. */
export function emailButton(label: string, href: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:32px auto 0;">
    <tr>
      <td align="center" bgcolor="${color.espresso}" style="border-radius:3px;">
        <a href="${escapeHtml(href)}" style="display:inline-block;padding:15px 36px;font-family:${font.sans};font-size:12px;font-weight:600;letter-spacing:2.5px;text-transform:uppercase;text-decoration:none;color:${color.ivory};">${escapeHtml(label)}</a>
      </td>
    </tr>
  </table>`;
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
