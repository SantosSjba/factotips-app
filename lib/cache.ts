type CacheEntry<T> = {
  value: T;
  expiresAt: number;
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

export const CACHE_TTL = {
  autocomplete: 60 * 60,
  ubigeo: 60 * 60 * 24,
} as const;
