import type { Metadata } from "next";
import { PreciosLanding } from "@/components/marketing/precios-landing";
import { JsonLd } from "@/lib/seo/metadata";
import {
  faqJsonLd,
  preciosSoftwareJsonLd,
  toolLandingMetadata,
} from "@/lib/seo/tools";
import { es } from "@/lib/i18n/dictionaries/es";

export const metadata: Metadata = toolLandingMetadata("precios");

const faqs = [
  { question: es.preciosLanding.faq1Q, answer: es.preciosLanding.faq1A },
  { question: es.preciosLanding.faq2Q, answer: es.preciosLanding.faq2A },
  { question: es.preciosLanding.faq3Q, answer: es.preciosLanding.faq3A },
  { question: es.preciosLanding.faq4Q, answer: es.preciosLanding.faq4A },
];

export default function PreciosLandingPage() {
  return (
    <main className="flex-1">
      <JsonLd data={preciosSoftwareJsonLd()} />
      <JsonLd data={faqJsonLd(faqs)} />
      <PreciosLanding />
    </main>
  );
}
