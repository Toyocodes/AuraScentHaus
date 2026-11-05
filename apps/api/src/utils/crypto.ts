import { createHash, createHmac, randomBytes, randomInt, timingSafeEqual } from "node:crypto";
import { OTP_LENGTH } from "@aurascenthaus/shared";
import { env } from "../config/env.js";

/** Cryptographically random numeric code, e.g. "048213". */
export function generateOtp(): string {
  return randomInt(0, 10 ** OTP_LENGTH)
    .toString()
    .padStart(OTP_LENGTH, "0");
}

/** Keyed hash for low-entropy secrets (OTP codes), so a DB leak can't be brute-forced offline. */
export function hmac(value: string): string {
  return createHmac("sha256", env.AUTH_SECRET).update(value).digest("hex");
}

/** Plain hash for high-entropy secrets (session tokens). */
export function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export function randomToken(bytes = 32): string {
  return randomBytes(bytes).toString("base64url");
}

export function randomHex(bytes = 4): string {
  return randomBytes(bytes).toString("hex");
}

/** Constant-time string comparison. */
export function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}
