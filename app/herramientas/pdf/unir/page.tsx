import type { Metadata } from "next";
import { ToolVisitTracker } from "@/components/analytics/tool-visit-tracker";
import { PdfUnirLanding } from "@/components/marketing/pdf-unir-landing";
import { es } from "@/lib/i18n/dictionaries/es";
import { buildPageMetadata, JsonLd } from "@/lib/seo/metadata";
import { faqJsonLd, PDF_TOOL_SEO, pdfUnirSoftwareJsonLd } from "@/lib/seo/tools";

export const metadata: Metadata = buildPageMetadata(PDF_TOOL_SEO.unir.landing);

const faqs = [
  { question: es.pdfUnirLanding.faq1Q, answer: es.pdfUnirLanding.faq1A },
  { question: es.pdfUnirLanding.faq2Q, answer: es.pdfUnirLanding.faq2A },
  { question: es.pdfUnirLanding.faq3Q, answer: es.pdfUnirLanding.faq3A },
  { question: es.pdfUnirLanding.faq4Q, answer: es.pdfUnirLanding.faq4A },
];

export default function PdfUnirLandingPage() {
  return (
    <main className="flex-1">
      <ToolVisitTracker toolId="pdf" />
      <JsonLd data={pdfUnirSoftwareJsonLd()} />
      <JsonLd data={faqJsonLd(faqs)} />
      <PdfUnirLanding />
    </main>
  );
}
