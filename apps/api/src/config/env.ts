import { z } from "zod";

/** Treat empty strings in .env as "not set". */
const optional = <T extends z.ZodType>(schema: T) =>
  z.preprocess((v) => (v === "" ? undefined : v), schema.optional());

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  WEB_URL: z.url().default("http://localhost:3002"),

  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

  SUPABASE_URL: optional(z.url()),
  SUPABASE_SERVICE_ROLE_KEY: optional(z.string()),
  SUPABASE_STORAGE_BUCKET: z.string().default("product-images"),

  AUTH_SECRET: z.string().min(32, "AUTH_SECRET must be at least 32 characters"),
  SESSION_COOKIE_NAME: z.string().default("ash_session"),
  SESSION_TTL_DAYS: z.coerce.number().int().positive().default(30),
  OTP_TTL_MINUTES: z.coerce.number().int().positive().default(10),
  COOKIE_DOMAIN: optional(z.string()),
  TRUST_PROXY: z.coerce.number().int().nonnegative().default(1),

  RESEND_API_KEY: optional(z.string()),
  MAIL_FROM: z.string().default("AuraScentHaus <onboarding@resend.dev>"),

  PAYSTACK_SECRET_KEY: optional(z.string()),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:\n" + z.prettifyError(parsed.error));
  process.exit(1);
}

export const env = parsed.data;
export const isProd = env.NODE_ENV === "production";
export const isDev = env.NODE_ENV === "development";

if (isProd && !env.RESEND_API_KEY) {
  console.error("❌ RESEND_API_KEY is required in production (login codes are sent by email).");
  process.exit(1);
}
if (isProd && !env.PAYSTACK_SECRET_KEY) {
  console.error("❌ PAYSTACK_SECRET_KEY is required in production.");
  process.exit(1);
}
