/**
 * Temporary home stub — landing completa en Fase 2.
 */
export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-24">
      <p className="text-sm font-medium tracking-wide text-brand uppercase">
        Factosys Perú
      </p>
      <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
        FactoTips
      </h1>
      <p className="mt-4 max-w-md text-center text-muted">
        Hub de herramientas de utilidad. La landing y el comparador de precios
        llegan en las siguientes fases.
      </p>
      <p className="mt-8 text-xs text-muted">
        Fase 0 lista ·{" "}
        <a className="text-brand underline-offset-2 hover:underline" href="/api/health">
          /api/health
        </a>
      </p>
    </main>
  );
}
