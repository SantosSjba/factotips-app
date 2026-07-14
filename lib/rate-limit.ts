import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import type { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "ft_uid";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

type Bucket = {
  count: number;
  resetAt: number;
};

const globalStore = globalThis as unknown as {
  __ftRateLimit?: Map<string, Bucket>;
};

function buckets(): Map<string, Bucket> {
  if (!globalStore.__ftRateLimit) {
    globalStore.__ftRateLimit = new Map();
  }
  return globalStore.__ftRateLimit;
}

function clientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }
  return request.headers.get("x-real-ip") ?? "unknown";
}

export async function ensureUserId(
  request: NextRequest,
): Promise<{ userId: string; isNew: boolean }> {
  const jar = await cookies();
  const existing = jar.get(COOKIE_NAME)?.value;
  if (existing) {
    return { userId: existing, isNew: false };
  }
  // Also check request cookie if middleware/set mid-flight
  const fromReq = request.cookies.get(COOKIE_NAME)?.value;
  if (fromReq) {
    return { userId: fromReq, isNew: false };
  }
  return { userId: randomUUID(), isNew: true };
}

export function attachUserCookie(response: NextResponse, userId: string): void {
  response.cookies.set({
    name: COOKIE_NAME,
    value: userId,
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
    secure: process.env.NODE_ENV === "production",
  });
}

export type RateLimitResult =
  | { ok: true; remaining: number }
  | { ok: false; retryAfter: number };

/**
 * Ventana fija de `windowSeconds`. Máximo `limit` hits por clave.
 */
export function checkRateLimit(
  key: string,
  limit: number,
  windowSeconds: number,
): RateLimitResult {
  const now = Date.now();
  const map = buckets();
  const current = map.get(key);

  if (!current || now >= current.resetAt) {
    map.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
    return { ok: true, remaining: limit - 1 };
  }

  if (current.count >= limit) {
    const retryAfter = Math.max(1, Math.ceil((current.resetAt - now) / 1000));
    return { ok: false, retryAfter };
  }

  current.count += 1;
  return { ok: true, remaining: limit - current.count };
}

export function rateLimitKey(
  scope: string,
  userId: string,
  ip: string,
): string {
  return `${scope}:${userId}:${ip}`;
}

export async function enforceRateLimit(
  request: NextRequest,
  scope: string,
  limit: number,
  windowSeconds: number,
): Promise<
  | { ok: true; userId: string; isNew: boolean; remaining: number }
  | { ok: false; userId: string; isNew: boolean; retryAfter: number }
> {
  const { userId, isNew } = await ensureUserId(request);
  const ip = clientIp(request);
  const key = rateLimitKey(scope, userId, ip);
  const result = checkRateLimit(key, limit, windowSeconds);

  if (!result.ok) {
    return { ok: false, userId, isNew, retryAfter: result.retryAfter };
  }
  return { ok: true, userId, isNew, remaining: result.remaining };
}

/** 1 consulta de precios por minuto */
export const LIMIT_BUSCAR = { limit: 1, windowSeconds: 60 } as const;

/** Soft throttle para autocomplete / ubigeo / detalle */
export const LIMIT_SOFT = { limit: 20, windowSeconds: 60 } as const;
