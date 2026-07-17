import type { Metadata } from "next";
import { QrLanding } from "@/components/marketing/qr-landing";
import { es } from "@/lib/i18n/dictionaries/es";
import { JsonLd } from "@/lib/seo/metadata";
import {
  faqJsonLd,
  qrSoftwareJsonLd,
  toolLandingMetadata,
} from "@/lib/seo/tools";

export const metadata: Metadata = toolLandingMetadata("qr");

const faqs = [
  { question: es.qrLanding.faq1Q, answer: es.qrLanding.faq1A },
  { question: es.qrLanding.faq2Q, answer: es.qrLanding.faq2A },
  { question: es.qrLanding.faq3Q, answer: es.qrLanding.faq3A },
  { question: es.qrLanding.faq4Q, answer: es.qrLanding.faq4A },
];

export default function QrLandingPage() {
  return (
    <main className="flex-1">
      <JsonLd data={qrSoftwareJsonLd()} />
      <JsonLd data={faqJsonLd(faqs)} />
      <QrLanding />
    </main>
  );
}
