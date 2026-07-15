import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "@/lib/generated/prisma/client";

/** Subir si cambia el schema y el singleton de HMR queda stale. */
const PRISMA_CLIENT_GEN = 3;

const globalForPrisma = globalThis as unknown as {
  __ftPrisma?: PrismaClient;
  __ftPrismaGen?: number;
  __ftPgPool?: Pool;
};

function createPrisma(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL no está configurada.");
  }

  const pool =
    globalForPrisma.__ftPgPool ??
    new Pool({
      connectionString,
      max: 10,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 10_000,
    });

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.__ftPgPool = pool;
  }

  return new PrismaClient({ adapter: new PrismaPg(pool) });
}

export function getPrisma(): PrismaClient | null {
  if (!process.env.DATABASE_URL) return null;

  const stale =
    !globalForPrisma.__ftPrisma ||
    globalForPrisma.__ftPrismaGen !== PRISMA_CLIENT_GEN ||
    typeof globalForPrisma.__ftPrisma.searchHistory?.findMany !== "function";

  if (stale) {
    globalForPrisma.__ftPrisma = createPrisma();
    globalForPrisma.__ftPrismaGen = PRISMA_CLIENT_GEN;
  }

  return globalForPrisma.__ftPrisma ?? null;
}
