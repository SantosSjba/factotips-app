import type { Metadata } from "next";
import { ToolVisitTracker } from "@/components/analytics/tool-visit-tracker";
import { SueldoNetoTool } from "@/components/sueldo-neto/sueldo-neto-tool";
import { toolAppMetadata } from "@/lib/seo/tools";

export const metadata: Metadata = toolAppMetadata("sueldo-neto");

export default function SueldoNetoUsarPage() {
  return (
    <main className="flex-1">
      <ToolVisitTracker toolId="sueldo-neto" />
      <SueldoNetoTool />
    </main>
  );
}
