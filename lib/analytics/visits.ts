import { getPrisma } from "@/lib/prisma";
import { type ToolAnalyticsId } from "./tool-ids";

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
