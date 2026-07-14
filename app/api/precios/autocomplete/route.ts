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
  autocompleteSchema,
  cacheKey,
  digemidPost,
} from "@/lib/digemid";
import { LIMIT_SOFT, enforceRateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const rl = await enforceRateLimit(
    request,
    "precios:autocomplete",
    LIMIT_SOFT.limit,
    LIMIT_SOFT.windowSeconds,
  );

  if (!rl.ok) {
    return jsonFail(
      `Demasiadas búsquedas. Intenta de nuevo en ${rl.retryAfter}s.`,
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
    const { query } = autocompleteSchema.parse(raw);
    const key = cacheKey("snippf_auto", [query]);

    const data = await cacheRemember(key, CACHE_TTL.autocomplete, async () => {
      try {
        const body = await digemidPost(
          "/producto/autocompleteciudadano",
          {
            nombreProducto: query,
            pagina: 1,
            tamanio: 15,
            tokenGoogle: "",
          },
          15_000,
        );
        return Array.isArray(body.data) ? body.data : [];
      } catch (err) {
        if (err instanceof DigemidHttpError) {
          console.warn("[precios/autocomplete]", err.message);
        }
        return [];
      }
    });

    return jsonOk(data, { userId: rl.userId, isNew: rl.isNew });
  } catch (err) {
    if (err instanceof ZodError) return jsonValidationError(err);
    console.error("[precios/autocomplete]", err);
    return jsonFail("Error inesperado en autocomplete.", {
      status: 500,
      userId: rl.userId,
      isNew: rl.isNew,
    });
  }
}
