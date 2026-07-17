import type { Metadata } from "next";
import { QrTool } from "@/components/qr/qr-tool";
import { toolAppMetadata } from "@/lib/seo/tools";

export const metadata: Metadata = toolAppMetadata("qr");

export default function QrUsarPage() {
  return (
    <main className="flex-1">
      <QrTool />
    </main>
  );
}
