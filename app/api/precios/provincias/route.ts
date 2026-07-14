import type { NextRequest } from "next/server";
import { ZodError } from "zod";
import {
  jsonFail,
  jsonOk,
  jsonValidationError,
  readJsonBody,
} from "@/lib/api";
import { CACHE_TTL, cacheRemember } from "@/lib/cache";
import {
  DigemidHttpError,
  cacheKey,
  digemidPost,
  provinciasSchema,
} from "@/lib/digemid";
import { LIMIT_SOFT, enforceRateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const rl = await enforceRateLimit(
    request,
    "precios:provincias",
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
  if (raw === null) {
    return jsonFail("Body JSON inválido.", {
      status: 400,
      userId: rl.userId,
      isNew: rl.isNew,
    });
  }

  try {
    const { codigoDepartamento } = provinciasSchema.parse(raw);
    const key = cacheKey("snippf_prov", [codigoDepartamento]);

    const data = await cacheRemember(key, CACHE_TTL.ubigeo, async () => {
      try {
        const body = await digemidPost(
          "/parametro/provincias",
          { codigo: codigoDepartamento, codigoDos: null },
          15_000,
        );
        return Array.isArray(body.data) ? body.data : [];
      } catch (err) {
        if (err instanceof DigemidHttpError) {
          console.warn("[precios/provincias]", err.message);
        }
        return [];
      }
    });

    return jsonOk(data, { userId: rl.userId, isNew: rl.isNew });
  } catch (err) {
    if (err instanceof ZodError) return jsonValidationError(err);
    console.error("[precios/provincias]", err);
    return jsonFail("Error inesperado al listar provincias.", {
      status: 500,
      userId: rl.userId,
      isNew: rl.isNew,
    });
  }
}
