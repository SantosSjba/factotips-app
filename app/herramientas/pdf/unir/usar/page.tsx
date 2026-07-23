import type { Metadata } from "next";
import { ToolVisitTracker } from "@/components/analytics/tool-visit-tracker";
import { UnirPdfTool } from "@/components/pdf/unir-tool";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { PDF_TOOL_SEO } from "@/lib/seo/tools";

export const metadata: Metadata = buildPageMetadata(PDF_TOOL_SEO.unir.app);

export default function PdfUnirUsarPage() {
  return (
    <main className="flex-1">
      <ToolVisitTracker toolId="pdf" />
      <UnirPdfTool />
    </main>
  );
}
