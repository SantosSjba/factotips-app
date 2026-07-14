import type { Metadata } from "next";
import { Hero } from "@/components/marketing/hero";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { ToolsSection } from "@/components/marketing/tools-section";
import { JsonLd } from "@/lib/seo/metadata";
import {
  hubMetadata,
  organizationJsonLd,
  websiteJsonLd,
} from "@/lib/seo/tools";

export const metadata: Metadata = hubMetadata();

export default function Home() {
  return (
    <main className="flex-1">
      <JsonLd data={organizationJsonLd()} />
      <JsonLd data={websiteJsonLd()} />
      <Hero />
      <ToolsSection />
      <HowItWorks />
    </main>
  );
}
