import type { Metadata } from "next";
import { ToolVisitTracker } from "@/components/analytics/tool-visit-tracker";
import { HonorariosTool } from "@/components/honorarios/honorarios-tool";
import { toolAppMetadata } from "@/lib/seo/tools";

export const metadata: Metadata = toolAppMetadata("honorarios");

export default function HonorariosUsarPage() {
  return (
    <main className="flex-1">
      <ToolVisitTracker toolId="honorarios" />
      <HonorariosTool />
    </main>
  );
}
