import type { Metadata } from "next";
import { ToolVisitTracker } from "@/components/analytics/tool-visit-tracker";
import { QrTool } from "@/components/qr/qr-tool";
import { toolAppMetadata } from "@/lib/seo/tools";

export const metadata: Metadata = toolAppMetadata("qr");

export default function QrUsarPage() {
  return (
    <main className="flex-1">
      <ToolVisitTracker toolId="qr" />
      <QrTool />
    </main>
  );
}
