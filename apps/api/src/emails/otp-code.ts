import { env } from "../config/env.js";
import { sendMail } from "../config/mailer.js";
import { emailLayout } from "./layout.js";

export async function sendOtpEmail(to: string, code: string): Promise<void> {
  const minutes = env.OTP_TTL_MINUTES;
  const html = emailLayout(
    "Your sign-in code",
    `<p>Use this code to sign in to AuraScentHaus:</p>
     <p style="font-size:32px;font-weight:bold;letter-spacing:8px;margin:24px 0;font-family:'Courier New',monospace;">${code}</p>
     <p>This code expires in ${minutes} minutes. If you didn't request it, you can ignore this email. Your account is safe.</p>`,
  );

  await sendMail({
    to,
    subject: `${code} is your AuraScentHaus sign-in code`,
    html,
    text: `Your AuraScentHaus sign-in code is ${code}. It expires in ${minutes} minutes.`,
  });
}
