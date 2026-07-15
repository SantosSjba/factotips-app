import type { NextRequest } from "next/server";
import { ZodError } from "zod";
import {
  jsonFail,
  jsonOk,
  jsonValidationError,
  readJsonBody,
} from "@/lib/api";
import { CACHE_TTL, digemidCacheRemember } from "@/lib/cache";
import {
  DigemidHttpError,
  cacheKey,
  detalleSchema,
  digemidPost,
  isDigemidSuccess,
} from "@/lib/digemid";
import { LIMIT_SOFT, enforceRateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const rl = await enforceRateLimit(
    request,
    "precios:detalle",
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
    const input = detalleSchema.parse(raw);
    const codigoProducto = Number(input.codigoProducto);

    if (!Number.isFinite(codigoProducto) || codigoProducto <= 0) {
      return jsonFail("Producto inválido.", {
        status: 400,
        userId: rl.userId,
        isNew: rl.isNew,
      });
    }

    const key = cacheKey("snippf_detalle", [
      String(codigoProducto),
      input.codEstablecimiento,
    ]);

    try {
      const cached = await digemidCacheRemember({
        key,
        endpoint: "detalle",
        ttlSeconds: CACHE_TTL.detalle,
        factory: async () => {
          const body = await digemidPost(
            "/precioproducto/obtener",
            {
              codigoProducto,
              codEstablecimiento: input.codEstablecimiento,
              tokenGoogle: "",
            },
            15_000,
          );

          if (!isDigemidSuccess(body)) {
            throw new DigemidHttpError(
              body.mensaje ?? "Error al obtener el detalle.",
            );
          }

          return { data: body.entidad ?? null };
        },
      });

      return jsonOk(cached.value, {
        userId: rl.userId,
        isNew: rl.isNew,
      });
    } catch (err) {
      const message =
        err instanceof DigemidHttpError
          ? err.message
          : "Error al obtener el detalle del establecimiento.";
      if (!(err instanceof DigemidHttpError)) {
        console.error("[precios/detalle]", err);
      }
      return jsonFail(message, { userId: rl.userId, isNew: rl.isNew });
    }
  } catch (err) {
    if (err instanceof ZodError) return jsonValidationError(err);
    console.error("[precios/detalle]", err);
    return jsonFail("Error inesperado al obtener el detalle.", {
      status: 500,
      userId: rl.userId,
      isNew: rl.isNew,
    });
  }
}
