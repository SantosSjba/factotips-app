import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Comparador de precios de medicamentos",
  description:
    "Compara precios unitarios de medicamentos publicados por DIGEMID / MINSA en el Perú.",
};

/**
 * Stub de la herramienta — UI completa en Fase 3.
 */
export default function PreciosPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-12 sm:px-6 sm:py-16">
      <Link
        href="/#herramientas"
        className="inline-flex w-fit items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-brand"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Volver a herramientas
      </Link>

      <h1 className="mt-6 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        Comparador de precios de medicamentos
      </h1>
      <p className="mt-3 text-base leading-relaxed text-muted">
        La interfaz de consulta llega en la siguiente fase. El backend DIGEMID
        ya está listo.
      </p>
      <p className="mt-6 rounded-xl border border-border bg-surface px-4 py-3 text-sm text-muted">
        Fuente:{" "}
        <a
          href="https://opm-digemid.minsa.gob.pe/#/consulta-producto"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-brand underline-offset-2 hover:underline"
        >
          DIGEMID / MINSA
        </a>
        . FactoTips no vende medicamentos.
      </p>
    </main>
  );
}
