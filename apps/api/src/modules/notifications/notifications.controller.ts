import type { Request, Response } from "express";
import * as notifications from "./notifications.service.js";

/** GET /api/notifications */
export async function list(req: Request, res: Response) {
  res.json(await notifications.listNotifications(req.user!.id));
}

/** POST /api/notifications/:id/read */
export async function read(req: Request<{ id: string }>, res: Response) {
  await notifications.markRead(req.user!.id, req.params.id);
  res.status(204).end();
}

/** POST /api/notifications/read-all */
export async function readAll(req: Request, res: Response) {
  await notifications.markAllRead(req.user!.id);
  res.status(204).end();
}
