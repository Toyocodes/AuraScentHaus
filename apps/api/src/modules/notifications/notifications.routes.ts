import { Router } from "express";
import * as c from "./notifications.controller.js";

/** Mounted at /api/notifications, signed in. Everyone only ever sees their own. */
export const notificationRouter = Router();
notificationRouter.get("/", c.list);
notificationRouter.post("/read-all", c.readAll);
notificationRouter.post("/:id/read", c.read);
