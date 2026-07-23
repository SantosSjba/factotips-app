import type { Metadata } from "next";
import { ToolVisitTracker } from "@/components/analytics/tool-visit-tracker";
import { DividirPdfTool } from "@/components/pdf/dividir-tool";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { PDF_TOOL_SEO } from "@/lib/seo/tools";

export const metadata: Metadata = buildPageMetadata(PDF_TOOL_SEO.dividir.app);

export default function PdfDividirUsarPage() {
  return (
    <main className="flex-1">
      <ToolVisitTracker toolId="pdf" />
      <DividirPdfTool />
    </main>
  );
}
