"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { useI18n } from "@/lib/i18n/provider";
import { FACTOSYS_URL, SITE_BRAND } from "@/lib/seo/site";

export function SiteFooter() {
  const { t } = useI18n();
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
              {t.footer.tagline}
            </p>
            <p className="mt-4 text-sm text-[#a8c4be]">
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
            <a
              href={FACTOSYS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-block text-sm font-medium text-[#8fb0a9] underline-offset-2 hover:text-white hover:underline"
            >
              {t.footer.visitSite}
            </a>
          </div>
          <div className="text-sm leading-relaxed text-[#a8c4be] sm:max-w-md sm:text-right">
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
            <p className="mt-2">{t.footer.noSell}</p>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-[#8fb0a9] sm:flex-row sm:items-center sm:justify-between">
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
          <Link href="/#herramientas" className="hover:text-white">
            {t.footer.viewTools}
          </Link>
        </div>
      </div>
    </footer>
  );
}
