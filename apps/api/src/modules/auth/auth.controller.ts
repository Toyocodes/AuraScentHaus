import type { Request, Response } from "express";
import { requestCodeSchema, verifyCodeSchema } from "@aurascenthaus/shared";
import { parseBody } from "../../middlewares/validate.js";
import { toUserDTO } from "../users/users.mapper.js";
import * as auth from "./auth.service.js";
import * as sessions from "./session.service.js";

/** POST /api/auth/request-code  { email } */
export async function requestCode(req: Request, res: Response) {
  const { email } = parseBody(requestCodeSchema, req);
  const result = await auth.requestLoginCode(email, req.ip);
  res.json({
    message: "If that email is valid, a sign-in code is on its way.",
    expiresAt: result.expiresAt,
    resendAfterSeconds: result.resendAfterSeconds,
  });
}

/** POST /api/auth/verify-code  { email, code }  → sets httpOnly session cookie */
export async function verifyCode(req: Request, res: Response) {
  const { email, code } = parseBody(verifyCodeSchema, req);
  const { user, isNewUser } = await auth.verifyLoginCode(email, code);

  const { token, expiresAt } = await sessions.createSession(user.id, req);
  sessions.setSessionCookie(res, token, expiresAt);

  res.json({ user: toUserDTO(user), isNewUser });
}

/** GET /api/auth/me */
export async function me(req: Request, res: Response) {
  res.json({ user: toUserDTO(req.user!) });
}

/** POST /api/auth/logout */
export async function logout(req: Request, res: Response) {
  if (req.sessionId) await sessions.revokeSession(req.sessionId);
  sessions.clearSessionCookie(res);
  res.status(204).end();
}

/** POST /api/auth/logout-all: sign out on every device */
export async function logoutAll(req: Request, res: Response) {
  await sessions.revokeAllSessions(req.user!.id);
  sessions.clearSessionCookie(res);
  res.status(204).end();
}
