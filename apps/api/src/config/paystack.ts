import { env } from "./env.js";
import { ApiError } from "../utils/api-error.js";

const PAYSTACK_BASE_URL = "https://api.paystack.co";

interface PaystackEnvelope<T> {
  status: boolean;
  message: string;
  data: T;
}

export interface PaystackInitializeData {
  authorization_url: string;
  access_code: string;
  reference: string;
}

export interface PaystackTransaction {
  id: number;
  status: "success" | "failed" | "abandoned" | "ongoing" | "pending" | "processing" | "queued" | "reversed";
  reference: string;
  amount: number; // kobo
  currency: string;
  channel: string | null;
  paid_at: string | null;
  gateway_response: string;
  customer: { email: string };
  metadata: unknown;
}

export function paystackSecret(): string {
  if (!env.PAYSTACK_SECRET_KEY) {
    throw new ApiError(503, "Payments are not configured", "PAYMENTS_NOT_CONFIGURED");
  }
  return env.PAYSTACK_SECRET_KEY;
}

async function paystackRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${PAYSTACK_BASE_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${paystackSecret()}`,
      "Content-Type": "application/json",
      ...init.headers,
    },
    signal: AbortSignal.timeout(15_000),
  });

  const body = (await res.json().catch(() => null)) as PaystackEnvelope<T> | null;
  if (!res.ok || !body?.status) {
    throw new ApiError(502, body?.message ?? "Payment provider error", "PAYSTACK_ERROR");
  }
  return body.data;
}

/** https://paystack.com/docs/api/transaction/#initialize */
export function initializeTransaction(input: {
  email: string;
  amount: number; // kobo
  reference: string;
  callbackUrl: string;
  metadata?: Record<string, unknown>;
}) {
  return paystackRequest<PaystackInitializeData>("/transaction/initialize", {
    method: "POST",
    body: JSON.stringify({
      email: input.email,
      amount: input.amount,
      currency: "NGN",
      reference: input.reference,
      callback_url: input.callbackUrl,
      metadata: input.metadata,
    }),
  });
}

/** https://paystack.com/docs/api/transaction/#verify */
export function verifyTransaction(reference: string) {
  return paystackRequest<PaystackTransaction>(`/transaction/verify/${encodeURIComponent(reference)}`);
}
