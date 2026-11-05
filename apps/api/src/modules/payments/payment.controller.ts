import type { Request, Response } from "express";
import { checkoutSchema } from "@aurascenthaus/shared";
import { parseBody } from "../../middlewares/validate.js";
import * as payments from "./payment.service.js";

/** POST /api/payments/checkout  → { authorizationUrl, reference, ... } */
export async function checkout(req: Request, res: Response) {
  const input = parseBody(checkoutSchema, req);
  res.status(201).json({ data: await payments.startCheckout(req.user!, input) });
}

/** GET /api/payments/verify/:reference  → order (used by /checkout/callback) */
export async function verify(req: Request<{ reference: string }>, res: Response) {
  res.json({ data: await payments.verifyForUser(req.user!.id, req.params.reference) });
}

/**
 * POST /api/payments/webhook  (called by Paystack, NOT the browser)
 * Mounted with express.raw() in app.ts so we can verify the signature on the exact bytes.
 * Set this URL in Paystack Dashboard → Settings → API Keys & Webhooks.
 */
export async function webhook(req: Request, res: Response) {
  const raw = req.body as Buffer;
  if (!Buffer.isBuffer(raw) || !payments.isValidPaystackSignature(raw, req.get("x-paystack-signature"))) {
    res.status(401).json({ error: { message: "Invalid signature" } });
    return;
  }

  const event = JSON.parse(raw.toString("utf8")) as { event: string; data?: { reference?: string } };

  if (event.event === "charge.success" && event.data?.reference) {
    // If this throws, we return 500 and Paystack retries. confirmPayment is idempotent.
    await payments.confirmPayment(event.data.reference);
  }

  res.sendStatus(200);
}
