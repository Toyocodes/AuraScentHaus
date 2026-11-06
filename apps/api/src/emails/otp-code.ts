import { env } from "../config/env.js";
import { sendMail } from "../config/mailer.js";
import { color, emailEyebrow, emailHeading, emailLayout, escapeHtml, font } from "./layout.js";

export function renderOtpEmail(code: string, minutes: number): string {
  return emailLayout({
    title: "Your sign-in code",
    preheader: `Your code expires in ${minutes} minutes. Never share it with anyone.`,
    body: `
      <div style="text-align:center;">
        ${emailEyebrow("Sign in")}
        ${emailHeading("Your sign-in code")}
        <p style="margin:0;color:${color.muted};">Enter this code to continue to your account.</p>
      </div>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:32px 0;">
        <tr>
          <td align="center" bgcolor="${color.panel}" style="padding:28px 12px;border:1px solid ${color.line};border-radius:4px;">
            <span style="display:inline-block;padding-left:10px;font-family:${font.sans};font-size:38px;font-weight:600;letter-spacing:10px;line-height:1.1;color:${color.ink};">${escapeHtml(code)}</span>
            <p style="margin:12px 0 0;font-size:13px;color:${color.muted};">Expires in ${minutes} minutes</p>
          </td>
        </tr>
      </table>

      <p style="margin:0;text-align:center;font-size:13px;color:${color.muted};">
        We'll never ask you for this code. If you didn't request it, you can safely ignore this email. Your account is still secure.
      </p>`,
  });
}

export async function sendOtpEmail(to: string, code: string): Promise<void> {
  const minutes = env.OTP_TTL_MINUTES;

  await sendMail({
    to,
    subject: `${code} is your AuraScentHaus sign-in code`,
    html: renderOtpEmail(code, minutes),
    text: `Your AuraScentHaus sign-in code is ${code}. It expires in ${minutes} minutes. If you didn't request it, you can ignore this email.`,
  });
}
