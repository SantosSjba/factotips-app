"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { LanguageSwitcher } from "@/components/i18n/language-switcher";
import { Icon } from "@/components/ui/icon";
import { useI18n } from "@/lib/i18n/provider";
import { FACTOSYS_URL } from "@/lib/seo/site";
import { TOOL_ROUTES } from "@/lib/seo/tools";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [toolsOpenMobile, setToolsOpenMobile] = useState(false);
  const [toolsOpenDesktop, setToolsOpenDesktop] = useState(false);
  const toolsMenuRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const tools = [
    { href: TOOL_ROUTES.precios.landingPath, label: t.footer.linkPrecios },
    { href: TOOL_ROUTES.igv.landingPath, label: t.footer.linkIgv },
    { href: TOOL_ROUTES.uit.landingPath, label: t.footer.linkUit },
    { href: TOOL_ROUTES.qr.landingPath, label: t.footer.linkQr },
    {
      href: TOOL_ROUTES["sueldo-neto"].landingPath,
      label: t.footer.linkSueldoNeto,
    },
  ] as const;

  function clearCloseTimer() {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }

  function openTools() {
    clearCloseTimer();
    setToolsOpenDesktop(true);
  }

  function scheduleCloseTools() {
    clearCloseTimer();
    closeTimer.current = setTimeout(() => setToolsOpenDesktop(false), 120);
  }

  useEffect(() => {
    if (!toolsOpenDesktop) return;

    function onPointerDown(e: MouseEvent) {
      if (!toolsMenuRef.current?.contains(e.target as Node)) {
        setToolsOpenDesktop(false);
      }
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setToolsOpenDesktop(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [toolsOpenDesktop]);

  useEffect(() => {
    return () => clearCloseTimer();
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-baseline gap-1.5">
          <Link href="/" className="group" onClick={() => setOpen(false)}>
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

        <nav className="hidden items-center gap-1 md:flex" aria-label="Principal">
          <Link
            href="/"
            className="rounded-lg px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-brand-soft/60 hover:text-brand"
          >
            {t.nav.home}
          </Link>

          <div
            ref={toolsMenuRef}
            className="relative"
            onMouseEnter={openTools}
            onMouseLeave={scheduleCloseTools}
          >
            <button
              type="button"
              className={cn(
                "inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                toolsOpenDesktop
                  ? "bg-brand-soft text-brand"
                  : "text-foreground/80 hover:bg-brand-soft/60 hover:text-brand",
              )}
              aria-expanded={toolsOpenDesktop}
              aria-haspopup="menu"
              onClick={() => setToolsOpenDesktop((v) => !v)}
            >
              {t.nav.tools}
              <Icon
                icon="mdi:chevron-down"
                className={cn(
                  "h-4 w-4 transition-transform duration-200",
                  toolsOpenDesktop && "rotate-180",
                )}
              />
            </button>

            {toolsOpenDesktop ? (
              <div
                className="absolute left-0 top-full z-50 min-w-[12.5rem] pt-1"
                role="menu"
              >
                <ul className="rounded-xl border border-border bg-surface py-1.5 shadow-lg shadow-foreground/10 ring-1 ring-black/5">
                  {tools.map((tool) => (
                    <li key={tool.href}>
                      <Link
                        href={tool.href}
                        role="menuitem"
                        className="block px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-brand-soft hover:text-brand"
                        onClick={() => setToolsOpenDesktop(false)}
                      >
                        {tool.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>

          <div className="ml-3 flex items-center gap-3">
            <LanguageSwitcher />
            <Link
              href={TOOL_ROUTES.igv.appPath}
              className="inline-flex h-10 items-center rounded-lg bg-brand px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
            >
              {t.nav.ctaTool}
            </Link>
          </div>
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
            <Icon icon={open ? "mdi:close" : "mdi:menu"} className="h-5 w-5" />
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
          <Link
            href="/"
            className="rounded-lg px-3 py-3 text-sm font-medium text-foreground hover:bg-brand-soft"
            onClick={() => setOpen(false)}
          >
            {t.nav.home}
          </Link>

          <button
            type="button"
            className="flex w-full items-center justify-between rounded-lg px-3 py-3 text-left text-sm font-medium text-foreground hover:bg-brand-soft"
            aria-expanded={toolsOpenMobile}
            onClick={() => setToolsOpenMobile((v) => !v)}
          >
            {t.nav.tools}
            <Icon
              icon={toolsOpenMobile ? "mdi:chevron-up" : "mdi:chevron-down"}
              className="h-4 w-4 text-muted"
            />
          </button>

          {toolsOpenMobile ? (
            <ul className="mb-1 ml-2 space-y-0.5 border-l border-border pl-2">
              {tools.map((tool) => (
                <li key={tool.href}>
                  <Link
                    href={tool.href}
                    className="block rounded-lg px-3 py-2.5 text-sm text-foreground hover:bg-brand-soft"
                    onClick={() => {
                      setOpen(false);
                      setToolsOpenMobile(false);
                    }}
                  >
                    {tool.label}
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}

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
            href={TOOL_ROUTES.igv.appPath}
            className="mt-1 rounded-lg bg-brand px-3 py-3 text-center text-sm font-semibold text-white hover:bg-brand-dark"
            onClick={() => setOpen(false)}
          >
            {t.nav.ctaTool}
          </Link>
        </nav>
      </div>
    </header>
  );
}
