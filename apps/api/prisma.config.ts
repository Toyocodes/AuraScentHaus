import "dotenv/config";
import { defineConfig } from "prisma/config";

/**
 * Prisma CLI config (migrate, studio, seed).
 *
 * Migrations must use Supabase's DIRECT/session connection (port 5432), not the
 * transaction pooler. The running app uses the pooled DATABASE_URL instead
 * (see src/config/prisma.ts).
 *
 * process.env is read directly (not Prisma's env() helper) so `prisma generate`
 * still works on a fresh clone with no .env file.
 */
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? "",
  },
});
