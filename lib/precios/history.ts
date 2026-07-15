import type { Prisma } from "@/lib/generated/prisma/client";
import { getPrisma } from "@/lib/prisma";
import type { SearchHistoryItem } from "@/lib/types/precios";

/** Identidad de quien busca. Hoy solo `anonymousId`; mañana también `userId`. */
export type SearchActor = {
  anonymousId: string;
  userId?: string | null;
};

export type SearchHistoryInput = {
  codigoProducto: string;
  nombreProducto: string;
  concent?: string | null;
  nombreFormaFarmaceutica?: string | null;
  codGrupoFF?: string | null;
  codigoDepartamento: string;
  codigoProvincia?: string | null;
  codigoUbigeo?: string | null;
  ubicacionLabel?: string | null;
  codTipoEstablecimiento?: string | null;
  nombreEstablecimiento?: string | null;
  nombreLaboratorio?: string | null;
  resultCount: number;
  fromCache: boolean;
};

const MAX_PER_ACTOR = 30;
const DEFAULT_LIMIT = 12;

/** Filtro listo para login: si hay userId, ese es la clave canónica. */
export function historyActorWhere(
  actor: SearchActor,
): Prisma.SearchHistoryWhereInput {
  if (actor.userId) {
    return { userId: actor.userId };
  }
  return { anonymousId: actor.anonymousId, userId: null };
}

export async function recordSearchHistory(
  actor: SearchActor,
  input: SearchHistoryInput,
): Promise<void> {
  const prisma = getPrisma();
  if (!prisma) return;

  try {
    await prisma.searchHistory.create({
      data: {
        anonymousId: actor.anonymousId,
        userId: actor.userId ?? null,
        codigoProducto: input.codigoProducto,
        nombreProducto: input.nombreProducto.slice(0, 300),
        concent: input.concent?.slice(0, 120) ?? null,
        nombreFormaFarmaceutica:
          input.nombreFormaFarmaceutica?.slice(0, 120) ?? null,
        codGrupoFF: input.codGrupoFF ?? null,
        codigoDepartamento: input.codigoDepartamento,
        codigoProvincia: input.codigoProvincia ?? null,
        codigoUbigeo: input.codigoUbigeo ?? null,
        ubicacionLabel: input.ubicacionLabel?.slice(0, 200) ?? null,
        codTipoEstablecimiento: input.codTipoEstablecimiento ?? null,
        nombreEstablecimiento:
          input.nombreEstablecimiento?.slice(0, 200) ?? null,
        nombreLaboratorio: input.nombreLaboratorio?.slice(0, 200) ?? null,
        resultCount: input.resultCount,
        fromCache: input.fromCache,
      },
    });

    const where = historyActorWhere(actor);
    const keep = await prisma.searchHistory.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: MAX_PER_ACTOR,
      select: { id: true },
    });
    const keepIds = keep.map((r) => r.id);
    if (keepIds.length >= MAX_PER_ACTOR) {
      await prisma.searchHistory.deleteMany({
        where: {
          ...where,
          id: { notIn: keepIds },
        },
      });
    }
  } catch (err) {
    console.warn("[search-history] no se pudo guardar:", err);
  }
}

export async function listSearchHistory(
  actor: SearchActor,
  limit = DEFAULT_LIMIT,
): Promise<SearchHistoryItem[]> {
  const prisma = getPrisma();
  if (!prisma) return [];

  try {
    const rows = await prisma.searchHistory.findMany({
      where: historyActorWhere(actor),
      orderBy: { createdAt: "desc" },
      take: Math.min(50, Math.max(1, limit)),
    });

    return rows.map((row) => ({
      id: row.id,
      codigoProducto: row.codigoProducto,
      nombreProducto: row.nombreProducto,
      concent: row.concent,
      nombreFormaFarmaceutica: row.nombreFormaFarmaceutica,
      codGrupoFF: row.codGrupoFF,
      codigoDepartamento: row.codigoDepartamento,
      codigoProvincia: row.codigoProvincia,
      codigoUbigeo: row.codigoUbigeo,
      ubicacionLabel: row.ubicacionLabel,
      codTipoEstablecimiento: row.codTipoEstablecimiento,
      nombreEstablecimiento: row.nombreEstablecimiento,
      nombreLaboratorio: row.nombreLaboratorio,
      resultCount: row.resultCount,
      fromCache: row.fromCache,
      createdAt: row.createdAt.toISOString(),
    }));
  } catch (err) {
    console.warn("[search-history] lectura falló:", err);
    return [];
  }
}

export async function deleteSearchHistoryItem(
  actor: SearchActor,
  id: string,
): Promise<boolean> {
  const prisma = getPrisma();
  if (!prisma) return false;

  try {
    const result = await prisma.searchHistory.deleteMany({
      where: { id, ...historyActorWhere(actor) },
    });
    return result.count > 0;
  } catch (err) {
    console.warn("[search-history] delete falló:", err);
    return false;
  }
}

export async function clearSearchHistory(actor: SearchActor): Promise<number> {
  const prisma = getPrisma();
  if (!prisma) return 0;

  try {
    const result = await prisma.searchHistory.deleteMany({
      where: historyActorWhere(actor),
    });
    return result.count;
  } catch (err) {
    console.warn("[search-history] clear falló:", err);
    return 0;
  }
}

/**
 * Cuando exista login: asociar historial anónimo a la cuenta.
 * No se usa aún; deja el camino listo.
 */
export async function claimAnonymousHistory(
  anonymousId: string,
  userId: string,
): Promise<number> {
  const prisma = getPrisma();
  if (!prisma) return 0;

  try {
    const result = await prisma.searchHistory.updateMany({
      where: { anonymousId, userId: null },
      data: { userId },
    });
    return result.count;
  } catch (err) {
    console.warn("[search-history] claim falló:", err);
    return 0;
  }
}
