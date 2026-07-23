import type { Metadata } from "next";
import { ToolVisitTracker } from "@/components/analytics/tool-visit-tracker";
import { PdfDividirLanding } from "@/components/marketing/pdf-dividir-landing";
import { es } from "@/lib/i18n/dictionaries/es";
import { buildPageMetadata, JsonLd } from "@/lib/seo/metadata";
import {
  faqJsonLd,
  PDF_TOOL_SEO,
  pdfDividirSoftwareJsonLd,
} from "@/lib/seo/tools";

export const metadata: Metadata = buildPageMetadata(PDF_TOOL_SEO.dividir.landing);

const faqs = [
  { question: es.pdfDividirLanding.faq1Q, answer: es.pdfDividirLanding.faq1A },
  { question: es.pdfDividirLanding.faq2Q, answer: es.pdfDividirLanding.faq2A },
  { question: es.pdfDividirLanding.faq3Q, answer: es.pdfDividirLanding.faq3A },
  { question: es.pdfDividirLanding.faq4Q, answer: es.pdfDividirLanding.faq4A },
];

export default function PdfDividirLandingPage() {
  return (
    <main className="flex-1">
      <ToolVisitTracker toolId="pdf" />
      <JsonLd data={pdfDividirSoftwareJsonLd()} />
      <JsonLd data={faqJsonLd(faqs)} />
      <PdfDividirLanding />
    </main>
  );
}
