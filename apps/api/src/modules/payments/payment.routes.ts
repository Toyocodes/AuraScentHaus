import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate.js";
import * as c from "./payment.controller.js";

/**
 * Mounted at /api/payments.
 * The webhook route is registered separately in app.ts (it needs the raw body).
 */
export const paymentRouter = Router();
paymentRouter.post("/checkout", authenticate, c.checkout);
paymentRouter.get("/verify/:reference", authenticate, c.verify);
