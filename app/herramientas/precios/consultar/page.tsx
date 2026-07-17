import type { Metadata } from "next";
import { ToolVisitTracker } from "@/components/analytics/tool-visit-tracker";
import { PreciosTool } from "@/components/precios/precios-tool";
import { toolAppMetadata } from "@/lib/seo/tools";

export const metadata: Metadata = toolAppMetadata("precios");

export default function PreciosConsultarPage() {
  return (
    <main className="flex-1">
      <ToolVisitTracker toolId="precios" />
      <PreciosTool />
    </main>
  );
}
