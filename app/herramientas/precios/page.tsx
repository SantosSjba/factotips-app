import type { Metadata } from "next";
import { PreciosTool } from "@/components/precios/precios-tool";

export const metadata: Metadata = {
  title: "Comparador de precios de medicamentos",
  description:
    "Compara precios unitarios de medicamentos publicados por DIGEMID / MINSA en el Perú. Encuentra la opción más económica por región.",
};

export default function PreciosPage() {
  return (
    <main className="flex-1">
      <PreciosTool />
    </main>
  );
}
