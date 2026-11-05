import type { NextFunction, Request, Response } from "express";
import {
  clearSessionCookie,
  readSessionCookie,
  setSessionCookie,
  validateSession,
} from "../modules/auth/session.service.js";
import { ApiError } from "../utils/api-error.js";

async function loadUser(req: Request, res: Response): Promise<boolean> {
  const token = readSessionCookie(req);
  if (!token) return false;

  const result = await validateSession(token);
  if (!result) {
    clearSessionCookie(res);
    return false;
  }

  req.user = result.user;
  req.sessionId = result.sessionId;
  if (result.renewedExpiresAt) setSessionCookie(res, token, result.renewedExpiresAt);
  return true;
}

/** Requires a valid session cookie; sets req.user. */
export async function authenticate(req: Request, res: Response, next: NextFunction) {
  if (!(await loadUser(req, res))) return next(ApiError.unauthorized());
  next();
}

/** Sets req.user if signed in, but never blocks the request. */
export async function optionalAuth(req: Request, res: Response, next: NextFunction) {
  await loadUser(req, res);
  next();
}
