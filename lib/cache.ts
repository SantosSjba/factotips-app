import type { Prisma } from "@/lib/generated/prisma/client";
import { getPrisma } from "@/lib/prisma";

type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

export type DigemidCacheEndpoint =
  | "autocomplete"
  | "provincias"
  | "distritos"
  | "buscar"
  | "detalle";

export type RememberResult<T> = {
  value: T;
  total?: number;
  source: "memory" | "database" | "origin";
};

const globalStore = globalThis as unknown as {
  __ftCache?: Map<string, CacheEntry<unknown>>;
};

function store(): Map<string, CacheEntry<unknown>> {
  if (!globalStore.__ftCache) {
    globalStore.__ftCache = new Map();
  }
  return globalStore.__ftCache;
}

export function cacheGet<T>(key: string): T | undefined {
  const entry = store().get(key);
  if (!entry) return undefined;
  if (Date.now() > entry.expiresAt) {
    store().delete(key);
    return undefined;
  }
  return entry.value as T;
}

export function cacheSet<T>(key: string, value: T, ttlSeconds: number): void {
  store().set(key, {
    value,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
}

export async function cacheRemember<T>(
  key: string,
  ttlSeconds: number,
  factory: () => Promise<T>,
): Promise<T> {
  const hit = cacheGet<T>(key);
  if (hit !== undefined) return hit;
  const value = await factory();
  cacheSet(key, value, ttlSeconds);
  return value;
}

/**
 * Caché en memoria + PostgreSQL.
 * Si la fila en BD aún no expiró (`expiresAt`), se reutiliza y no se llama a DIGEMID.
 */
export async function digemidCacheRemember<T>(options: {
  key: string;
  endpoint: DigemidCacheEndpoint;
  ttlSeconds: number;
  factory: () => Promise<{ data: T; total?: number }>;
}): Promise<RememberResult<T>> {
  const { key, endpoint, ttlSeconds, factory } = options;

  const mem = cacheGet<{ data: T; total?: number }>(key);
  if (mem !== undefined) {
    return { value: mem.data, total: mem.total, source: "memory" };
  }

  const prisma = getPrisma();
  if (prisma) {
    try {
      const row = await prisma.digemidCache.findUnique({ where: { cacheKey: key } });
      if (row && row.expiresAt.getTime() > Date.now()) {
        const data = row.payload as T;
        const total = row.total ?? undefined;
        const wrapped = { data, total };
        cacheSet(
          key,
          wrapped,
          Math.max(1, Math.floor((row.expiresAt.getTime() - Date.now()) / 1000)),
        );
        return { value: data, total, source: "database" };
      }
    } catch (err) {
      console.warn("[digemid-cache] lectura BD falló, se consulta origen:", err);
    }
  }

  const fresh = await factory();
  cacheSet(key, fresh, ttlSeconds);

  if (prisma) {
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000);
    try {
      await prisma.digemidCache.upsert({
        where: { cacheKey: key },
        create: {
          cacheKey: key,
          endpoint,
          payload: fresh.data as Prisma.InputJsonValue,
          total: fresh.total ?? null,
          fetchedAt: new Date(),
          expiresAt,
        },
        update: {
          endpoint,
          payload: fresh.data as Prisma.InputJsonValue,
          total: fresh.total ?? null,
          fetchedAt: new Date(),
          expiresAt,
        },
      });
    } catch (err) {
      console.warn("[digemid-cache] escritura BD falló:", err);
    }
  }

  return { value: fresh.data, total: fresh.total, source: "origin" };
}

/** TTLs: precios más cortos; ubigeo/autocomplete más largos. */
export const CACHE_TTL = {
  autocomplete: 60 * 60 * 24,
  ubigeo: 60 * 60 * 24 * 7,
  /** Precios: refrescar cada 6 h si alguien vuelve a consultar la misma clave. */
  buscar: 60 * 60 * 6,
  detalle: 60 * 60 * 12,
} as const;
