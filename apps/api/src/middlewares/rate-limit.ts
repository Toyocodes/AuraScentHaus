import { rateLimit } from "express-rate-limit";

const handler = {
  standardHeaders: "draft-8" as const,
  legacyHeaders: false,
  message: { error: { message: "Too many requests, please try again later", code: "RATE_LIMITED" } },
};

/** Whole API: generous ceiling per IP. */
export const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 600, ...handler });

/**
 * Sending login codes: strict per IP. (Per-email throttling also happens in
 * auth.service using the database, so it holds across server instances.)
 */
export const requestCodeLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, ...handler });

/** Verifying codes: limits brute-force attempts per IP. */
export const verifyCodeLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, ...handler });
