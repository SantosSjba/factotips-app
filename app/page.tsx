import { Hero } from "@/components/marketing/hero";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { ToolsSection } from "@/components/marketing/tools-section";

export default function Home() {
  return (
    <main className="flex-1">
      <Hero />
      <ToolsSection />
      <HowItWorks />
    </main>
  );
}
