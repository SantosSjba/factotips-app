import Link from "next/link";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-border bg-[#0a2e2a] text-[#d7e8e4]">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="font-display text-2xl font-semibold text-white">
              FactoTips
            </p>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-[#a8c4be]">
              Hub de herramientas de utilidad de Factosys Perú.
            </p>
          </div>
          <div className="text-sm leading-relaxed text-[#a8c4be] sm:max-w-md sm:text-right">
            <p>
              Los precios de medicamentos provienen del observatorio oficial{" "}
              <a
                href="https://opm-digemid.minsa.gob.pe/#/consulta-producto"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-white underline-offset-2 hover:underline"
              >
                DIGEMID / MINSA
              </a>
              .
            </p>
            <p className="mt-2">
              FactoTips no vende medicamentos ni intermedia operaciones
              comerciales.
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-[#8fb0a9] sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} Factosys Perú. Todos los derechos reservados.</p>
          <Link href="/#herramientas" className="hover:text-white">
            Ver herramientas
          </Link>
        </div>
      </div>
    </footer>
  );
}
