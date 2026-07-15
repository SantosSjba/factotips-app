import { config } from "dotenv";
import { defineConfig } from "prisma/config";

config({ path: ".env.local" });
config();

/**
 * Placeholder para `prisma generate` en CI/Docker sin DATABASE_URL real.
 * En runtime y en migrate se usa process.env.DATABASE_URL.
 */
const datasourceUrl =
  process.env.DATABASE_URL ??
  "postgresql://postgres:postgres@127.0.0.1:5432/factotips_db";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: datasourceUrl,
  },
});
