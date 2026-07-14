import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { attachUserCookie } from "@/lib/rate-limit";

export function jsonOk<T>(
  data: T,
  init?: { total?: number; status?: number; userId?: string; isNew?: boolean },
) {
  const body: { success: true; data: T; total?: number } = {
    success: true,
    data,
  };
  if (init?.total !== undefined) body.total = init.total;

  const res = NextResponse.json(body, { status: init?.status ?? 200 });
  if (init?.isNew && init.userId) {
    attachUserCookie(res, init.userId);
  }
  return res;
}

export function jsonFail(
  message: string,
  init?: {
    status?: number;
    retryAfter?: number;
    userId?: string;
    isNew?: boolean;
  },
) {
  const body: {
    success: false;
    message: string;
    retryAfter?: number;
  } = {
    success: false,
    message,
  };
  if (init?.retryAfter !== undefined) body.retryAfter = init.retryAfter;

  const headers: HeadersInit = {};
  if (init?.retryAfter !== undefined) {
    headers["Retry-After"] = String(init.retryAfter);
  }

  const res = NextResponse.json(body, {
    status: init?.status ?? 200,
    headers,
  });
  if (init?.isNew && init.userId) {
    attachUserCookie(res, init.userId);
  }
  return res;
}

export function jsonValidationError(error: ZodError) {
  const message =
    error.issues[0]?.message ?? "Los datos enviados no son válidos.";
  return jsonFail(message, { status: 400 });
}

export async function readJsonBody(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}
