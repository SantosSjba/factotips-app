import { getPrisma } from "@/lib/prisma";
import { TOOL_IDS, type ToolAnalyticsId } from "./tool-ids";

export type { ToolAnalyticsId } from "./tool-ids";
export { TOOL_IDS, isToolAnalyticsId } from "./tool-ids";

export async function recordToolVisit(input: {
  anonymousId: string;
  userId?: string | null;
  toolId: ToolAnalyticsId;
  path: string;
}): Promise<boolean> {
  const prisma = getPrisma();
  if (!prisma) return false;

  const path = input.path.slice(0, 300);
  await prisma.toolVisit.create({
    data: {
      anonymousId: input.anonymousId,
      userId: input.userId ?? null,
      toolId: input.toolId,
      path,
    },
  });
  return true;
}

export type ToolVisitStats = {
  toolId: string;
  views: number;
  uniqueVisitors: number;
};

/** Totales por herramienta (todas las fechas). */
export async function getToolVisitStats(): Promise<ToolVisitStats[]> {
  const prisma = getPrisma();
  if (!prisma) return [];

  const grouped = await prisma.toolVisit.groupBy({
    by: ["toolId"],
    _count: { _all: true },
  });

  const uniqueRows = await prisma.$queryRaw<
    { tool_id: string; unique_visitors: bigint }[]
  >`
    SELECT tool_id, COUNT(DISTINCT anonymous_id)::bigint AS unique_visitors
    FROM tool_visit
    GROUP BY tool_id
  `;

  const uniqueMap = new Map(
    uniqueRows.map((r) => [r.tool_id, Number(r.unique_visitors)]),
  );

  return TOOL_IDS.map((toolId) => {
    const row = grouped.find((g) => g.toolId === toolId);
    return {
      toolId,
      views: row?._count._all ?? 0,
      uniqueVisitors: uniqueMap.get(toolId) ?? 0,
    };
  });
}
