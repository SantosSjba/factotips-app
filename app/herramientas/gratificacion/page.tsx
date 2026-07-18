import type { Metadata } from "next";
import { ToolVisitTracker } from "@/components/analytics/tool-visit-tracker";
import { GratificacionLanding } from "@/components/marketing/gratificacion-landing";
import { es } from "@/lib/i18n/dictionaries/es";
import { JsonLd } from "@/lib/seo/metadata";
import {
  faqJsonLd,
  gratificacionSoftwareJsonLd,
  toolLandingMetadata,
} from "@/lib/seo/tools";

export const metadata: Metadata = toolLandingMetadata("gratificacion");

const faqs = [
  {
    question: es.gratificacionLanding.faq1Q,
    answer: es.gratificacionLanding.faq1A,
  },
  {
    question: es.gratificacionLanding.faq2Q,
    answer: es.gratificacionLanding.faq2A,
  },
  {
    question: es.gratificacionLanding.faq3Q,
    answer: es.gratificacionLanding.faq3A,
  },
  {
    question: es.gratificacionLanding.faq4Q,
    answer: es.gratificacionLanding.faq4A,
  },
];

export default function GratificacionLandingPage() {
  return (
    <main className="flex-1">
      <ToolVisitTracker toolId="gratificacion" />
      <JsonLd data={gratificacionSoftwareJsonLd()} />
      <JsonLd data={faqJsonLd(faqs)} />
      <GratificacionLanding />
    </main>
  );
}
