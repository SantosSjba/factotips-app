"use client";

import Link from "next/link";
import { useState } from "react";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { Icon } from "@/components/ui/icon";
import { useI18n } from "@/lib/i18n/provider";
import { FACTOSYS_URL } from "@/lib/seo/site";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  const nav = [
    { href: "/", label: t.nav.home },
    { href: "/#herramientas", label: t.nav.tools },
  ] as const;

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-baseline gap-1.5">
          <Link
            href="/"
            className="group"
            onClick={() => setOpen(false)}
          >
            <span className="font-display text-xl font-semibold tracking-tight text-brand transition-colors group-hover:text-brand-dark">
              FactoTips
            </span>
          </Link>
          <a
            href={FACTOSYS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden text-[11px] font-medium tracking-wide text-muted transition-colors hover:text-brand sm:inline"
          >
            {t.nav.byFactosys}
          </a>
        </div>

        <nav className="hidden items-center gap-6 md:flex" aria-label="Principal">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-foreground/80 transition-colors hover:text-brand"
            >
              {item.label}
            </Link>
          ))}
          <LanguageSwitcher />
          <Link
            href="/herramientas/precios"
            className="inline-flex h-10 items-center rounded-lg bg-brand px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
          >
            {t.nav.comparePrices}
          </Link>
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          <LanguageSwitcher />
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-foreground"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? t.nav.closeMenu : t.nav.openMenu}
            onClick={() => setOpen((v) => !v)}
          >
            <Icon
              icon={open ? "mdi:close" : "mdi:menu"}
              className="h-5 w-5"
            />
          </button>
        </div>
      </div>

      <div
        id="mobile-nav"
        className={cn(
          "border-t border-border bg-surface md:hidden",
          open ? "block" : "hidden",
        )}
      >
        <nav
          className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3"
          aria-label="Móvil"
        >
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-3 text-sm font-medium text-foreground hover:bg-brand-soft"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <a
            href={FACTOSYS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg px-3 py-3 text-sm font-medium text-foreground hover:bg-brand-soft"
            onClick={() => setOpen(false)}
          >
            Factosys Perú
          </a>
          <Link
            href="/herramientas/precios"
            className="mt-1 rounded-lg bg-brand px-3 py-3 text-center text-sm font-semibold text-white hover:bg-brand-dark"
            onClick={() => setOpen(false)}
          >
            {t.nav.comparePrices}
          </Link>
        </nav>
      </div>
    </header>
  );
}
