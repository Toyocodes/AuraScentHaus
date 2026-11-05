import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env } from "./env.js";
import { ApiError } from "../utils/api-error.js";

/**
 * Supabase is used ONLY for Storage (product images) here; all database access
 * goes through Prisma. The service-role key never leaves the server.
 *
 * Create a PUBLIC bucket named SUPABASE_STORAGE_BUCKET in the Supabase dashboard.
 */
let client: SupabaseClient | null = null;

export function storage() {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new ApiError(503, "Image storage is not configured", "STORAGE_NOT_CONFIGURED");
  }
  client ??= createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client.storage.from(env.SUPABASE_STORAGE_BUCKET);
}
