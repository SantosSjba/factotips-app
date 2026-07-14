import { MapPinned, Search, Scale } from "lucide-react";

const STEPS = [
  {
    icon: Search,
    title: "Busca el medicamento",
    text: "Escribe el nombre o principio activo y elige la presentación exacta.",
  },
  {
    icon: MapPinned,
    title: "Filtra por región",
    text: "Acota la consulta a departamento, provincia o distrito.",
  },
  {
    icon: Scale,
    title: "Compara el precio unitario",
    text: "Ordenamos por precio unitario para destacar la opción más económica.",
  },
] as const;

export function HowItWorks() {
  return (
    <section className="border-t border-border/80">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="max-w-2xl">
          <h2 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Cómo funciona
          </h2>
          <p className="mt-3 text-base leading-relaxed text-muted sm:text-lg">
            Tres pasos para comparar con datos oficiales del observatorio OPM
            DIGEMID.
          </p>
        </div>

        <ol className="mt-10 grid gap-8 sm:grid-cols-3 sm:gap-6">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            return (
              <li key={step.title} className="relative">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-brand">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <span className="text-xs font-semibold tracking-[0.14em] text-muted uppercase">
                    Paso {index + 1}
                  </span>
                </div>
                <h3 className="mt-4 font-display text-xl font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {step.text}
                </p>
              </li>
            );
          })}
        </ol>

        <p className="mt-12 max-w-3xl text-sm leading-relaxed text-muted">
          Fuente oficial:{" "}
          <a
            href="https://opm-digemid.minsa.gob.pe/#/consulta-producto"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-brand underline-offset-2 hover:underline"
          >
            Observatorio de Precios de Medicamentos — DIGEMID / MINSA
          </a>
          . FactoTips muestra la información publicada; no modifica precios ni
          comercializa productos.
        </p>
      </div>
    </section>
  );
}
