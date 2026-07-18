import type { Metadata } from "next";
import { ToolVisitTracker } from "@/components/analytics/tool-visit-tracker";
import { HonorariosLanding } from "@/components/marketing/honorarios-landing";
import { es } from "@/lib/i18n/dictionaries/es";
import { JsonLd } from "@/lib/seo/metadata";
import {
  faqJsonLd,
  honorariosSoftwareJsonLd,
  toolLandingMetadata,
} from "@/lib/seo/tools";

export const metadata: Metadata = toolLandingMetadata("honorarios");

const faqs = [
  {
    question: es.honorariosLanding.faq1Q,
    answer: es.honorariosLanding.faq1A,
  },
  {
    question: es.honorariosLanding.faq2Q,
    answer: es.honorariosLanding.faq2A,
  },
  {
    question: es.honorariosLanding.faq3Q,
    answer: es.honorariosLanding.faq3A,
  },
  {
    question: es.honorariosLanding.faq4Q,
    answer: es.honorariosLanding.faq4A,
  },
];

export default function HonorariosLandingPage() {
  return (
    <main className="flex-1">
      <ToolVisitTracker toolId="honorarios" />
      <JsonLd data={honorariosSoftwareJsonLd()} />
      <JsonLd data={faqJsonLd(faqs)} />
      <HonorariosLanding />
    </main>
  );
}
