import type { Metadata } from "next";
import { ToolVisitTracker } from "@/components/analytics/tool-visit-tracker";
import { GratificacionTool } from "@/components/gratificacion/gratificacion-tool";
import { toolAppMetadata } from "@/lib/seo/tools";

export const metadata: Metadata = toolAppMetadata("gratificacion");

export default function GratificacionUsarPage() {
  return (
    <main className="flex-1">
      <ToolVisitTracker toolId="gratificacion" />
      <GratificacionTool />
    </main>
  );
}
