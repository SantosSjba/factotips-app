import type { Metadata } from "next";
import { ToolVisitTracker } from "@/components/analytics/tool-visit-tracker";
import { CtsTool } from "@/components/cts/cts-tool";
import { toolAppMetadata } from "@/lib/seo/tools";

export const metadata: Metadata = toolAppMetadata("cts");

export default function CtsUsarPage() {
  return (
    <main className="flex-1">
      <ToolVisitTracker toolId="cts" />
      <CtsTool />
    </main>
  );
}
