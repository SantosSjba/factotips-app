import type { Metadata } from "next";
import { UitLanding } from "@/components/marketing/uit-landing";
import { es } from "@/lib/i18n/dictionaries/es";
import { JsonLd } from "@/lib/seo/metadata";
import {
  faqJsonLd,
  toolLandingMetadata,
  uitSoftwareJsonLd,
} from "@/lib/seo/tools";

export const metadata: Metadata = toolLandingMetadata("uit");

const faqs = [
  { question: es.uitLanding.faq1Q, answer: es.uitLanding.faq1A },
  { question: es.uitLanding.faq2Q, answer: es.uitLanding.faq2A },
  { question: es.uitLanding.faq3Q, answer: es.uitLanding.faq3A },
  { question: es.uitLanding.faq4Q, answer: es.uitLanding.faq4A },
];

export default function UitLandingPage() {
  return (
    <main className="flex-1">
      <JsonLd data={uitSoftwareJsonLd()} />
      <JsonLd data={faqJsonLd(faqs)} />
      <UitLanding />
    </main>
  );
}
