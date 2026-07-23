import type { Metadata } from "next";
import { ToolVisitTracker } from "@/components/analytics/tool-visit-tracker";
import { PdfLanding } from "@/components/marketing/pdf-landing";
import { es } from "@/lib/i18n/dictionaries/es";
import { JsonLd } from "@/lib/seo/metadata";
import {
  faqJsonLd,
  pdfSoftwareJsonLd,
  toolLandingMetadata,
} from "@/lib/seo/tools";

export const metadata: Metadata = toolLandingMetadata("pdf");

const faqs = [
  { question: es.pdfLanding.faq1Q, answer: es.pdfLanding.faq1A },
  { question: es.pdfLanding.faq2Q, answer: es.pdfLanding.faq2A },
  { question: es.pdfLanding.faq3Q, answer: es.pdfLanding.faq3A },
  { question: es.pdfLanding.faq4Q, answer: es.pdfLanding.faq4A },
];

export default function PdfLandingPage() {
  return (
    <main className="flex-1">
      <ToolVisitTracker toolId="pdf" />
      <JsonLd data={pdfSoftwareJsonLd()} />
      <JsonLd data={faqJsonLd(faqs)} />
      <PdfLanding />
    </main>
  );
}
