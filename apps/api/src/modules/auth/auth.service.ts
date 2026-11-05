import { env } from "../../config/env.js";
import { prisma } from "../../config/prisma.js";
import { sendOtpEmail } from "../../emails/otp-code.js";
import { ApiError } from "../../utils/api-error.js";
import { generateOtp, hmac, safeEqual } from "../../utils/crypto.js";

const MAX_ATTEMPTS = 5; // wrong guesses allowed per code
const RESEND_COOLDOWN_MS = 60 * 1000; // 1 code per minute per email
const MAX_CODES_PER_HOUR = 5; // per email

const hashCode = (email: string, code: string) => hmac(`${email}:${code}`);

/**
 * Step 1: email → send a 6-digit code.
 * Works for new and existing users (no separate sign-up).
 */
export async function requestLoginCode(email: string, ip: string | undefined) {
  const now = Date.now();

  const recent = await prisma.otpCode.findMany({
    where: { email, createdAt: { gte: new Date(now - 60 * 60 * 1000) } },
    orderBy: { createdAt: "desc" },
    select: { createdAt: true },
  });

  const last = recent[0];
  if (last && now - last.createdAt.getTime() < RESEND_COOLDOWN_MS) {
    const retryAfter = Math.ceil((RESEND_COOLDOWN_MS - (now - last.createdAt.getTime())) / 1000);
    throw ApiError.tooManyRequests(`Please wait ${retryAfter}s before requesting another code`, { retryAfter });
  }
  if (recent.length >= MAX_CODES_PER_HOUR) {
    throw ApiError.tooManyRequests("Too many codes requested. Try again in an hour.");
  }

  const code = generateOtp();
  const expiresAt = new Date(now + env.OTP_TTL_MINUTES * 60 * 1000);

  await prisma.$transaction([
    // Only the newest code is valid: retire any older unused ones.
    prisma.otpCode.updateMany({
      where: { email, consumedAt: null },
      data: { consumedAt: new Date(now) },
    }),
    prisma.otpCode.create({
      data: { email, codeHash: hashCode(email, code), expiresAt, ip: ip ?? null },
    }),
  ]);

  await sendOtpEmail(email, code);

  return { expiresAt, resendAfterSeconds: RESEND_COOLDOWN_MS / 1000 };
}

/**
 * Step 2: email + code → user (created on first login).
 * The caller then creates the session and sets the cookie.
 */
export async function verifyLoginCode(email: string, code: string) {
  const otp = await prisma.otpCode.findFirst({
    where: { email, consumedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });

  if (!otp) {
    throw ApiError.badRequest("This code has expired. Request a new one.", "OTP_EXPIRED");
  }

  if (!safeEqual(otp.codeHash, hashCode(email, code))) {
    const attempts = otp.attempts + 1;
    await prisma.otpCode.update({
      where: { id: otp.id },
      data: { attempts, consumedAt: attempts >= MAX_ATTEMPTS ? new Date() : null },
    });
    const remaining = MAX_ATTEMPTS - attempts;
    throw remaining > 0
      ? ApiError.badRequest(`Incorrect code. ${remaining} attempt(s) left.`, "OTP_INCORRECT", { remaining })
      : ApiError.badRequest("Too many wrong attempts. Request a new code.", "OTP_LOCKED");
  }

  // Consume atomically so the same code can't be used twice in parallel requests.
  const consumed = await prisma.otpCode.updateMany({
    where: { id: otp.id, consumedAt: null },
    data: { consumedAt: new Date() },
  });
  if (consumed.count === 0) {
    throw ApiError.badRequest("This code was already used. Request a new one.", "OTP_USED");
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  const user = existing ?? (await prisma.user.create({ data: { email } }));

  return { user, isNewUser: !existing };
}
