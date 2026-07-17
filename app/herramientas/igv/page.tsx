import type { Metadata } from "next";
import { IgvLanding } from "@/components/marketing/igv-landing";
import { es } from "@/lib/i18n/dictionaries/es";
import { JsonLd } from "@/lib/seo/metadata";
import {
  faqJsonLd,
  igvSoftwareJsonLd,
  toolLandingMetadata,
} from "@/lib/seo/tools";

export const metadata: Metadata = toolLandingMetadata("igv");

const faqs = [
  { question: es.igvLanding.faq1Q, answer: es.igvLanding.faq1A },
  { question: es.igvLanding.faq2Q, answer: es.igvLanding.faq2A },
  { question: es.igvLanding.faq3Q, answer: es.igvLanding.faq3A },
  { question: es.igvLanding.faq4Q, answer: es.igvLanding.faq4A },
];

export default function IgvLandingPage() {
  return (
    <main className="flex-1">
      <JsonLd data={igvSoftwareJsonLd()} />
      <JsonLd data={faqJsonLd(faqs)} />
      <IgvLanding />
    </main>
  );
}
