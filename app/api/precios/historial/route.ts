import type { NextRequest } from "next/server";
import {
  jsonFail,
  jsonOk,
} from "@/lib/api";
import {
  clearSearchHistory,
  deleteSearchHistoryItem,
  listSearchHistory,
} from "@/lib/precios/history";
import { LIMIT_SOFT, enforceRateLimit } from "@/lib/rate-limit";

function actorFromRl(userId: string) {
  // Cuando exista login: pasar también userId de sesión
  return { anonymousId: userId, userId: null as string | null };
}

export async function GET(request: NextRequest) {
  const rl = await enforceRateLimit(
    request,
    "precios:historial",
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

  const limitRaw = request.nextUrl.searchParams.get("limit");
  const limit = limitRaw ? Number(limitRaw) : 12;
  const data = await listSearchHistory(
    actorFromRl(rl.userId),
    Number.isFinite(limit) ? limit : 12,
  );

  return jsonOk(data, { userId: rl.userId, isNew: rl.isNew });
}

export async function DELETE(request: NextRequest) {
  const rl = await enforceRateLimit(
    request,
    "precios:historial:delete",
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

  const id = request.nextUrl.searchParams.get("id");
  const all = request.nextUrl.searchParams.get("all") === "1";
  const actor = actorFromRl(rl.userId);

  if (all) {
    const deleted = await clearSearchHistory(actor);
    return jsonOk({ deleted }, { userId: rl.userId, isNew: rl.isNew });
  }

  if (!id?.trim()) {
    return jsonFail("Indica id o all=1.", {
      status: 400,
      userId: rl.userId,
      isNew: rl.isNew,
    });
  }

  const ok = await deleteSearchHistoryItem(actor, id.trim());
  if (!ok) {
    return jsonFail("No se encontró esa búsqueda.", {
      status: 404,
      userId: rl.userId,
      isNew: rl.isNew,
    });
  }

  return jsonOk({ deleted: 1 }, { userId: rl.userId, isNew: rl.isNew });
}
