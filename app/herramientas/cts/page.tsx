import type { Metadata } from "next";
import { ToolVisitTracker } from "@/components/analytics/tool-visit-tracker";
import { CtsLanding } from "@/components/marketing/cts-landing";
import { es } from "@/lib/i18n/dictionaries/es";
import { JsonLd } from "@/lib/seo/metadata";
import {
  ctsSoftwareJsonLd,
  faqJsonLd,
  toolLandingMetadata,
} from "@/lib/seo/tools";

export const metadata: Metadata = toolLandingMetadata("cts");

const faqs = [
  { question: es.ctsLanding.faq1Q, answer: es.ctsLanding.faq1A },
  { question: es.ctsLanding.faq2Q, answer: es.ctsLanding.faq2A },
  { question: es.ctsLanding.faq3Q, answer: es.ctsLanding.faq3A },
  { question: es.ctsLanding.faq4Q, answer: es.ctsLanding.faq4A },
];

export default function CtsLandingPage() {
  return (
    <main className="flex-1">
      <ToolVisitTracker toolId="cts" />
      <JsonLd data={ctsSoftwareJsonLd()} />
      <JsonLd data={faqJsonLd(faqs)} />
      <CtsLanding />
    </main>
  );
}
