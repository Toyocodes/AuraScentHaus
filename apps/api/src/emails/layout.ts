/** Minimal, email-client-safe wrapper (inline styles, table layout). */
export function emailLayout(title: string, bodyHtml: string): string {
  return `<!doctype html>
<html>
  <head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${escapeHtml(title)}</title></head>
  <body style="margin:0;padding:0;background:#f6f3ef;font-family:Georgia,'Times New Roman',serif;color:#1c1917;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
      <tr><td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#ffffff;border-radius:12px;padding:32px;">
          <tr><td style="font-size:20px;letter-spacing:2px;text-transform:uppercase;padding-bottom:24px;">AuraScentHaus</td></tr>
          <tr><td style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;">${bodyHtml}</td></tr>
        </table>
        <p style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#78716c;margin-top:16px;">
          You received this email because of activity on your AuraScentHaus account.
        </p>
      </td></tr>
    </table>
  </body>
</html>`;
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
