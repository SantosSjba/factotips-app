import type { Metadata } from "next";
import { ToolVisitTracker } from "@/components/analytics/tool-visit-tracker";
import { IgvTool } from "@/components/igv/igv-tool";
import { toolAppMetadata } from "@/lib/seo/tools";

export const metadata: Metadata = toolAppMetadata("igv");

export default function IgvUsarPage() {
  return (
    <main className="flex-1">
      <ToolVisitTracker toolId="igv" />
      <IgvTool />
    </main>
  );
}
