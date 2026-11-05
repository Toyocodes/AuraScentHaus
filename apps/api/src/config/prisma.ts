import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";
import { env, isDev } from "./env.js";

/**
 * Single PrismaClient for the whole app.
 * Uses Supabase's pooled connection (DATABASE_URL, port 6543) at runtime.
 */
const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });

export const prisma = new PrismaClient({
  adapter,
  log: isDev ? ["warn", "error"] : ["error"],
});

export type Db = typeof prisma;
/** Client available inside `prisma.$transaction(async (tx) => …)`. */
export type Tx = Parameters<Parameters<Db["$transaction"]>[0]>[0];
