import type { Metadata } from "next";
import { IgvTool } from "@/components/igv/igv-tool";
import { toolAppMetadata } from "@/lib/seo/tools";

export const metadata: Metadata = toolAppMetadata("igv");

export default function IgvUsarPage() {
  return (
    <main className="flex-1">
      <IgvTool />
    </main>
  );
}
