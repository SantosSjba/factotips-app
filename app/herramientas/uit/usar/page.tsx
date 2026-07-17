import type { Metadata } from "next";
import { ToolVisitTracker } from "@/components/analytics/tool-visit-tracker";
import { UitTool } from "@/components/uit/uit-tool";
import { toolAppMetadata } from "@/lib/seo/tools";

export const metadata: Metadata = toolAppMetadata("uit");

export default function UitUsarPage() {
  return (
    <main className="flex-1">
      <ToolVisitTracker toolId="uit" />
      <UitTool />
    </main>
  );
}
