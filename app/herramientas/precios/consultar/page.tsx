import type { Metadata } from "next";
import { PreciosTool } from "@/components/precios/precios-tool";
import { toolAppMetadata } from "@/lib/seo/tools";

export const metadata: Metadata = toolAppMetadata("precios");

export default function PreciosConsultarPage() {
  return (
    <main className="flex-1">
      <PreciosTool />
    </main>
  );
}
