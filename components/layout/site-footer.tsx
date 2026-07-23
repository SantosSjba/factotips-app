"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { HUB_TOOLS } from "@/lib/hub-tools";
import { useI18n } from "@/lib/i18n/provider";
import { FACTOSYS_URL, SITE_BRAND } from "@/lib/seo/site";

export function SiteFooter() {
  const { t } = useI18n();
  const year = new Date().getFullYear();

  const tools = HUB_TOOLS.map((tool) => ({
    href: tool.landingPath,
    label: t.landing[tool.shortKey],
  }));

  return (
    <footer className="mt-auto border-t border-border bg-[#0a2e2a] text-[#d7e8e4]">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
        <div className="grid gap-10 md:grid-cols-12 md:gap-8 lg:gap-12">
          <div className="md:col-span-4">
            <p className="font-display text-2xl font-semibold text-white">
              FactoTips
            </p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-[#a8c4be]">
              {t.footer.tagline}
            </p>
            <p className="mt-5 text-sm text-[#a8c4be]">
              {t.footer.byOwner}{" "}
              <a
                href={FACTOSYS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-semibold text-white underline-offset-2 hover:underline"
              >
                {SITE_BRAND}
                <Icon icon="mdi:open-in-new" className="h-3.5 w-3.5" />
              </a>
            </p>
            <Link
              href="/#herramientas"
              className="mt-4 inline-flex h-10 items-center rounded-xl bg-white/10 px-4 text-sm font-semibold text-white transition-colors hover:bg-white/15"
            >
              {t.footer.viewTools}
            </Link>
          </div>

          <div className="md:col-span-4 md:justify-self-center md:pl-4">
            <p className="text-xs font-semibold tracking-[0.14em] text-[#8fb0a9] uppercase">
              {t.footer.toolsTitle}
            </p>
            <ul className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2 md:grid-cols-1">
              {tools.map((tool) => (
                <li key={tool.href}>
                  <Link
                    href={tool.href}
                    className="inline-flex text-sm font-medium text-[#d7e8e4] transition-colors hover:text-white"
                  >
                    {tool.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-4 md:text-right">
            <p className="text-xs font-semibold tracking-[0.14em] text-[#8fb0a9] uppercase">
              {t.footer.notesTitle}
            </p>
            <div className="mt-4 space-y-2.5 text-sm leading-relaxed text-[#a8c4be] md:ml-auto md:max-w-sm">
              <p>{t.footer.orientative}</p>
              <p>
                {t.footer.pricesSource}{" "}
                <a
                  href="https://opm-digemid.minsa.gob.pe/#/consulta-producto"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-white underline-offset-2 hover:underline"
                >
                  {t.footer.digemid}
                </a>
                .
              </p>
              <p>{t.footer.noSell}</p>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-[#8fb0a9] sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year}{" "}
            <a
              href={FACTOSYS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white"
            >
              {SITE_BRAND}
            </a>
            . {t.footer.rights}
          </p>
          <a
            href={FACTOSYS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white sm:text-right"
          >
            {t.footer.visitSite}
          </a>
        </div>
      </div>
    </footer>
  );
}
