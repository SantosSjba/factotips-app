import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function Hero() {
  return (
    <section className="relative isolate min-h-[min(100svh,880px)] overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 -z-10 hero-atmosphere"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-background to-transparent"
        aria-hidden
      />

      <div className="mx-auto flex min-h-[min(100svh,880px)] max-w-6xl flex-col justify-center px-4 pb-20 pt-16 sm:px-6 sm:pb-28 sm:pt-20">
        <p className="animate-fade-up text-sm font-semibold tracking-[0.18em] text-brand uppercase">
          Factosys Perú
        </p>

        <h1 className="animate-fade-up animation-delay-1 mt-4 max-w-3xl font-display text-[clamp(2.75rem,8vw,5.5rem)] leading-[0.95] font-semibold tracking-tight text-foreground">
          FactoTips
        </h1>

        <p className="animate-fade-up animation-delay-2 mt-5 max-w-xl text-lg leading-relaxed text-muted sm:text-xl">
          Herramientas útiles para el día a día. Empieza comparando precios
          oficiales de medicamentos en el Perú.
        </p>

        <div className="animate-fade-up animation-delay-3 mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link
            href="/herramientas/precios"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-brand px-6 text-base font-semibold text-white transition-colors hover:bg-brand-dark"
          >
            Comparar precios
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
          <Link
            href="/#herramientas"
            className="inline-flex h-12 items-center justify-center rounded-xl border border-border bg-surface/70 px-6 text-base font-semibold text-foreground backdrop-blur-sm transition-colors hover:border-brand/40 hover:bg-surface"
          >
            Ver herramientas
          </Link>
        </div>
      </div>
    </section>
  );
}
