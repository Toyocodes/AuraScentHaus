import type { CookieOptions, Request, Response } from "express";
import { env, isProd } from "../../config/env.js";
import { prisma } from "../../config/prisma.js";
import { randomToken, sha256 } from "../../utils/crypto.js";

const DAY = 24 * 60 * 60 * 1000;
const ttlMs = () => env.SESSION_TTL_DAYS * DAY;

/**
 * Sessions are opaque random tokens stored in an httpOnly cookie.
 * The DB keeps only sha256(token), so sessions can be listed/revoked server-side
 * (e.g. "log out everywhere"), and nothing in the cookie is readable by JS.
 */
export async function createSession(userId: string, req: Request) {
  const token = randomToken(32);
  const expiresAt = new Date(Date.now() + ttlMs());

  await prisma.session.create({
    data: {
      tokenHash: sha256(token),
      userId,
      expiresAt,
      userAgent: req.get("user-agent")?.slice(0, 255) ?? null,
      ip: req.ip ?? null,
    },
  });

  return { token, expiresAt };
}

/**
 * Looks up the session for a raw token. Returns null if missing/expired.
 * Sliding expiry: when less than half the lifetime is left, it's extended
 * (`renewedExpiresAt` is set so the caller can refresh the cookie).
 */
export async function validateSession(token: string) {
  const session = await prisma.session.findUnique({
    where: { tokenHash: sha256(token) },
    include: {
      user: { select: { id: true, email: true, name: true, phone: true, role: true, createdAt: true } },
    },
  });
  if (!session) return null;

  const now = Date.now();
  if (session.expiresAt.getTime() <= now) {
    await prisma.session.delete({ where: { id: session.id } }).catch(() => {});
    return null;
  }

  let renewedExpiresAt: Date | null = null;
  if (session.expiresAt.getTime() - now < ttlMs() / 2) {
    renewedExpiresAt = new Date(now + ttlMs());
    await prisma.session.update({
      where: { id: session.id },
      data: { expiresAt: renewedExpiresAt, lastUsedAt: new Date() },
    });
  }

  return { sessionId: session.id, user: session.user, renewedExpiresAt };
}

export async function revokeSession(sessionId: string) {
  await prisma.session.deleteMany({ where: { id: sessionId } });
}

export async function revokeAllSessions(userId: string) {
  await prisma.session.deleteMany({ where: { userId } });
}

function cookieOptions(expires?: Date): CookieOptions {
  return {
    httpOnly: true, // not readable by JavaScript (XSS can't steal it)
    secure: isProd, // HTTPS only in production
    sameSite: "lax", // sent on top-level navigations, blocks most CSRF
    path: "/",
    domain: env.COOKIE_DOMAIN,
    expires,
  };
}

export function setSessionCookie(res: Response, token: string, expiresAt: Date) {
  res.cookie(env.SESSION_COOKIE_NAME, token, cookieOptions(expiresAt));
}

export function clearSessionCookie(res: Response) {
  res.clearCookie(env.SESSION_COOKIE_NAME, cookieOptions());
}

export function readSessionCookie(req: Request): string | undefined {
  const value = req.cookies?.[env.SESSION_COOKIE_NAME];
  return typeof value === "string" && value.length > 0 ? value : undefined;
}
