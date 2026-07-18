import type { Metadata } from "next";
import { ToolVisitTracker } from "@/components/analytics/tool-visit-tracker";
import { SueldoNetoLanding } from "@/components/marketing/sueldo-neto-landing";
import { es } from "@/lib/i18n/dictionaries/es";
import { JsonLd } from "@/lib/seo/metadata";
import {
  faqJsonLd,
  sueldoNetoSoftwareJsonLd,
  toolLandingMetadata,
} from "@/lib/seo/tools";

export const metadata: Metadata = toolLandingMetadata("sueldo-neto");

const faqs = [
  {
    question: es.sueldoNetoLanding.faq1Q,
    answer: es.sueldoNetoLanding.faq1A,
  },
  {
    question: es.sueldoNetoLanding.faq2Q,
    answer: es.sueldoNetoLanding.faq2A,
  },
  {
    question: es.sueldoNetoLanding.faq3Q,
    answer: es.sueldoNetoLanding.faq3A,
  },
  {
    question: es.sueldoNetoLanding.faq4Q,
    answer: es.sueldoNetoLanding.faq4A,
  },
];

export default function SueldoNetoLandingPage() {
  return (
    <main className="flex-1">
      <ToolVisitTracker toolId="sueldo-neto" />
      <JsonLd data={sueldoNetoSoftwareJsonLd()} />
      <JsonLd data={faqJsonLd(faqs)} />
      <SueldoNetoLanding />
    </main>
  );
}
