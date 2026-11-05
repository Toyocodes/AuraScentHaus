import { Resend } from "resend";
import { env, isProd } from "./env.js";

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

export interface MailInput {
  to: string;
  subject: string;
  html: string;
  text: string;
}

/**
 * Sends an email through Resend.
 * In development without RESEND_API_KEY, the email is printed to the console
 * instead, so you can copy login codes while testing in Postman.
 */
export async function sendMail({ to, subject, html, text }: MailInput): Promise<void> {
  if (!resend) {
    if (isProd) throw new Error("Resend is not configured");
    console.log(`\n📧 [dev mail] to=${to}\n   subject: ${subject}\n   ${text.replace(/\n/g, "\n   ")}\n`);
    return;
  }

  const { error } = await resend.emails.send({ from: env.MAIL_FROM, to, subject, html, text });
  if (error) {
    throw new Error(`Resend failed: ${error.name}: ${error.message}`);
  }
}
