import type { NextRequest } from "next/server";
import { ZodError } from "zod";
import {
  jsonFail,
  jsonOk,
  jsonValidationError,
  readJsonBody,
} from "@/lib/api";
import {
  DigemidHttpError,
  buscarSchema,
  digemidPost,
  isDigemidSuccess,
} from "@/lib/digemid";
import { LIMIT_BUSCAR, enforceRateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const rl = await enforceRateLimit(
    request,
    "precios:buscar",
    LIMIT_BUSCAR.limit,
    LIMIT_BUSCAR.windowSeconds,
  );

  if (!rl.ok) {
    return jsonFail(
      `Puedes hacer 1 consulta por minuto. Intenta de nuevo en ${rl.retryAfter}s.`,
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
    const input = buscarSchema.parse(raw);
    const codigoProducto = Number(input.codigoProducto);

    if (!Number.isFinite(codigoProducto) || codigoProducto <= 0) {
      return jsonFail("Producto inválido.", {
        status: 400,
        userId: rl.userId,
        isNew: rl.isNew,
      });
    }

    const filtro = {
      codigoProducto,
      codigoDepartamento: input.codigoDepartamento,
      codigoProvincia: input.codigoProvincia ?? null,
      codigoUbigeo: input.codigoUbigeo ?? null,
      codTipoEstablecimiento: input.codTipoEstablecimiento ?? null,
      catEstablecimiento: null,
      nombreEstablecimiento: input.nombreEstablecimiento ?? null,
      nombreLaboratorio: input.nombreLaboratorio ?? null,
      codGrupoFF: input.codGrupoFF ?? null,
      concent: input.concent ?? "",
      tamanio: 100,
      pagina: input.pagina ?? 1,
      tokenGoogle: "",
      nombreProducto: null,
    };

    try {
      const body = await digemidPost("/preciovista/ciudadano", filtro, 30_000);

      if (isDigemidSuccess(body)) {
        return jsonOk(Array.isArray(body.data) ? body.data : [], {
          total: typeof body.cantidad === "number" ? body.cantidad : 0,
          userId: rl.userId,
          isNew: rl.isNew,
        });
      }

      return jsonFail(
        body.mensaje ?? "Error al consultar el servicio DIGEMID.",
        { userId: rl.userId, isNew: rl.isNew },
      );
    } catch (err) {
      const message =
        err instanceof DigemidHttpError
          ? err.message
          : "Error inesperado al consultar precios.";
      if (!(err instanceof DigemidHttpError)) {
        console.error("[precios/buscar]", err);
      }
      return jsonFail(message, { userId: rl.userId, isNew: rl.isNew });
    }
  } catch (err) {
    if (err instanceof ZodError) return jsonValidationError(err);
    console.error("[precios/buscar]", err);
    return jsonFail("Error inesperado al consultar precios.", {
      status: 500,
      userId: rl.userId,
      isNew: rl.isNew,
    });
  }
}
