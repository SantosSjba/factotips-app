import type { NextRequest } from "next/server";
import { z } from "zod";
import {
  jsonFail,
  jsonOk,
  jsonValidationError,
  readJsonBody,
} from "@/lib/api";
import {
  isToolAnalyticsId,
  recordToolVisit,
} from "@/lib/analytics/visits";
import {
  LIMIT_SOFT,
  attachUserCookie,
  enforceRateLimit,
} from "@/lib/rate-limit";

const bodySchema = z.object({
  toolId: z.string().min(1).max(40),
  path: z.string().min(1).max(300),
});

export async function POST(request: NextRequest) {
  const rl = await enforceRateLimit(
    request,
    "analytics:visit",
    LIMIT_SOFT.limit,
    LIMIT_SOFT.windowSeconds,
  );

  if (!rl.ok) {
    return jsonFail(
      `Demasiadas solicitudes. Intenta de nuevo en ${rl.retryAfter}s.`,
      {
        status: 429,
        retryAfter: rl.retryAfter,
        userId: rl.userId,
        isNew: rl.isNew,
      },
    );
  }

  const raw = await readJsonBody(request);
  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success) {
    const res = jsonValidationError(parsed.error);
    if (rl.isNew) attachUserCookie(res, rl.userId);
    return res;
  }

  if (!isToolAnalyticsId(parsed.data.toolId)) {
    return jsonFail("Herramienta no válida.", {
      status: 400,
      userId: rl.userId,
      isNew: rl.isNew,
    });
  }

  try {
    await recordToolVisit({
      anonymousId: rl.userId,
      userId: null,
      toolId: parsed.data.toolId,
      path: parsed.data.path,
    });
  } catch (err) {
    console.error("[analytics/visit]", err);
    // No romper UX si falla el registro
    return jsonOk({ recorded: false }, { userId: rl.userId, isNew: rl.isNew });
  }

  return jsonOk({ recorded: true }, { userId: rl.userId, isNew: rl.isNew });
}
