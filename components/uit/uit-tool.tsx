"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { fieldControlClass } from "@/components/ui/select";
import { useI18n } from "@/lib/i18n/provider";
import { formatPen } from "@/lib/pe/igv";
import {
  buildUitSummary,
  convertUit,
  formatUit,
  quickUitTable,
  solesToUit,
  type UitMode,
  uitToSoles,
  UIT_NORMA,
  UIT_SOLES,
  INDICADORES_ANIO,
} from "@/lib/pe/uit";
import { TOOL_ROUTES } from "@/lib/seo/tools";
import { cn } from "@/lib/utils";

function parseAmount(raw: string): number | null {
  const normalized = raw.replace(",", ".").replace(/[^\d.]/g, "");
  if (!normalized) return null;
  const n = Number(normalized);
  if (!Number.isFinite(n) || n < 0) return null;
  return n;
}

const EXAMPLE_CHIPS = [0.5, 1, 2, 7, 10] as const;

export function UitTool() {
  const { t, locale } = useI18n();
  const c = t.uit;
  const moneyLocale = locale === "en" ? "en-US" : "es-PE";

  const [mode, setMode] = useState<UitMode>("uit-a-soles");
  const [amount, setAmount] = useState("1");
  const [copied, setCopied] = useState(false);
  const [pulse, setPulse] = useState(0);
  const [swapSpin, setSwapSpin] = useState(false);

  const parsed = parseAmount(amount);
  const result = parsed === null ? null : convertUit(parsed, mode);
  const table = quickUitTable();

  useEffect(() => {
    if (result) setPulse((n) => n + 1);
  }, [result?.uit, result?.soles, mode]);

  async function copySummary() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(buildUitSummary(result, moneyLocale));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  function applyQuick(uit: number) {
    setMode("uit-a-soles");
    setAmount(String(uit));
  }

  function swapMode() {
    setSwapSpin(true);
    window.setTimeout(() => setSwapSpin(false), 400);

    const current = parseAmount(amount);
    if (current !== null) {
      if (mode === "uit-a-soles") {
        setAmount(String(uitToSoles(current)));
        setMode("soles-a-uit");
      } else {
        setAmount(String(solesToUit(current)));
        setMode("uit-a-soles");
      }
      return;
    }
    setMode((m) => (m === "uit-a-soles" ? "soles-a-uit" : "uit-a-soles"));
  }

  const friendlyLine =
    result &&
    c.equalsLine
      .replace("{uit}", formatUit(result.uit, moneyLocale))
      .replace("{soles}", formatPen(result.soles, moneyLocale));

  const barPct =
    result && result.uit > 0
      ? Math.min(100, Math.round((Math.min(result.uit, 15) / 15) * 100))
      : 0;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <Link
        href={TOOL_ROUTES.uit.landingPath}
        className="inline-flex items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-brand"
      >
        <Icon icon="mdi:arrow-left" className="h-4 w-4" />
        {c.back}
      </Link>

      <header className="mt-6 animate-fade-up">
        <p className="text-sm font-semibold tracking-[0.16em] text-brand uppercase">
          {c.friendlyEyebrow}
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {c.title}
        </h1>
        <p className="mt-3 text-base leading-relaxed text-muted sm:text-lg">
          {c.friendlySubtitle}
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand-soft px-4 py-2 text-sm shadow-sm shadow-brand/5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-40" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-brand" />
            </span>
            <span className="font-semibold text-brand">{c.uitBadge}</span>
            <span className="font-display text-base font-semibold text-foreground">
              {formatPen(UIT_SOLES, moneyLocale)}
            </span>
          </div>
          <span className="text-xs text-muted">
            {INDICADORES_ANIO} · {UIT_NORMA}
          </span>
        </div>
      </header>

      <div className="mt-8 space-y-6">
        {/* Conversor principal */}
        <section className="animate-fade-up animation-delay-1 rounded-2xl border border-border bg-surface p-5 shadow-sm shadow-foreground/5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-foreground">{c.modeLabel}</p>
            <button
              type="button"
              onClick={swapMode}
              className="inline-flex h-10 items-center gap-2 rounded-full border border-border bg-background px-3.5 text-sm font-semibold text-brand transition-all hover:border-brand/40 hover:bg-brand-soft active:scale-95"
            >
              <Icon
                icon="mdi:swap-vertical"
                className={cn(
                  "h-4 w-4 transition-transform duration-300",
                  swapSpin && "rotate-180",
                )}
              />
              {c.swap}
            </button>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            {(
              [
                {
                  id: "uit-a-soles" as const,
                  label: c.modeUitToSoles,
                  hint: c.modeHintUit,
                },
                {
                  id: "soles-a-uit" as const,
                  label: c.modeSolesToUit,
                  hint: c.modeHintSoles,
                },
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setMode(item.id)}
                className={cn(
                  "rounded-xl border px-3 py-3 text-left transition-all duration-200",
                  mode === item.id
                    ? "border-brand bg-brand text-white shadow-md shadow-brand/25 scale-[1.01]"
                    : "border-border bg-background text-foreground hover:border-brand/40 hover:bg-brand-soft/50",
                )}
              >
                <span className="block text-sm font-semibold">{item.label}</span>
                <span
                  className={cn(
                    "mt-0.5 block text-xs",
                    mode === item.id ? "text-white/80" : "text-muted",
                  )}
                >
                  {item.hint}
                </span>
              </button>
            ))}
          </div>

          <div className="mt-5">
            <p className="mb-2 text-xs font-semibold tracking-wide text-muted uppercase">
              {c.tryThese}
            </p>
            <div className="flex flex-wrap gap-2">
              {EXAMPLE_CHIPS.map((uit) => (
                <button
                  key={uit}
                  type="button"
                  onClick={() => applyQuick(uit)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-sm font-medium transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm",
                    mode === "uit-a-soles" && amount === String(uit)
                      ? "border-brand bg-brand-soft text-brand"
                      : "border-border bg-background text-foreground hover:border-brand/40",
                  )}
                >
                  {formatUit(uit, moneyLocale)} UIT
                </button>
              ))}
            </div>
          </div>

          <label className="mt-5 block">
            <span className="mb-2 block text-sm font-semibold text-foreground">
              {mode === "uit-a-soles" ? c.amountUit : c.amountSoles}
            </span>
            <div className="relative">
              <span
                className={cn(
                  "pointer-events-none absolute inset-y-0 left-0 flex items-center border-r border-border/80 bg-brand-soft/50 px-3 text-sm font-semibold text-brand",
                  "rounded-l-2xl",
                )}
              >
                {mode === "uit-a-soles" ? "UIT" : "S/"}
              </span>
              <input
                type="text"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={c.amountPlaceholder}
                className={cn(
                  fieldControlClass,
                  "h-14 rounded-2xl pr-4 text-xl font-semibold tabular-nums focus:ring-4 focus:ring-brand/15",
                  mode === "uit-a-soles" ? "pl-[4.25rem]" : "pl-14",
                )}
                autoComplete="off"
              />
            </div>
          </label>

          {parsed === null ? (
            <p className="mt-3 text-sm text-danger">{c.invalidAmount}</p>
          ) : result ? (
            <div
              key={pulse}
              className="mt-5 animate-fade-up rounded-2xl border border-brand/20 bg-gradient-to-br from-brand-soft/80 via-background to-accent-soft/40 p-5"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-brand">{c.friendlyResult}</p>
                <button
                  type="button"
                  onClick={copySummary}
                  className={cn(
                    "inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-sm font-semibold transition-all",
                    copied
                      ? "bg-success text-white"
                      : "border border-border bg-surface text-foreground hover:border-brand/40 hover:text-brand",
                  )}
                >
                  <Icon
                    icon={copied ? "mdi:check" : "mdi:content-copy"}
                    className="h-4 w-4"
                  />
                  {copied ? c.copied : c.copy}
                </button>
              </div>

              <p className="mt-4 font-display text-2xl font-semibold leading-snug tracking-tight text-foreground sm:text-3xl">
                {friendlyLine}
              </p>

              <div className="mt-5 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
                <div className="flex-1 rounded-xl bg-surface/90 px-4 py-3 text-center shadow-sm">
                  <p className="text-[11px] font-semibold tracking-wide text-muted uppercase">
                    {c.resultUit}
                  </p>
                  <p className="mt-1 font-display text-xl font-semibold tabular-nums text-foreground">
                    {formatUit(result.uit, moneyLocale)}
                    <span className="ml-1.5 text-sm font-medium text-muted">
                      UIT
                    </span>
                  </p>
                </div>
                <div className="flex justify-center">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand text-white shadow-md shadow-brand/30">
                    <Icon icon="mdi:approximately-equal" className="h-5 w-5" />
                  </span>
                </div>
                <div className="flex-1 rounded-xl bg-surface/90 px-4 py-3 text-center shadow-sm">
                  <p className="text-[11px] font-semibold tracking-wide text-muted uppercase">
                    {c.resultSoles}
                  </p>
                  <p className="mt-1 font-display text-xl font-semibold tabular-nums text-brand">
                    {formatPen(result.soles, moneyLocale)}
                  </p>
                </div>
              </div>

              <div className="mt-5">
                <div className="mb-1.5 flex justify-between text-xs text-muted">
                  <span>{c.scaleLabel}</span>
                  <span>
                    {formatUit(Math.min(result.uit, 15), moneyLocale)} / 15 UIT
                  </span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-border/70">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-brand to-accent transition-[width] duration-500 ease-out"
                    style={{ width: `${barPct}%` }}
                  />
                </div>
              </div>

              <p className="mt-4 text-xs leading-relaxed text-muted">
                {c.formulaHint
                  .replace("{uit}", formatPen(UIT_SOLES, moneyLocale))
                  .replace("{year}", String(INDICADORES_ANIO))}
              </p>
            </div>
          ) : null}
        </section>

        {/* Tabla como chips + filas amigables */}
        <section className="animate-fade-up animation-delay-2 rounded-2xl border border-border bg-surface p-5 sm:p-6">
          <h2 className="font-display text-lg font-semibold text-foreground">
            {c.tableTitle}
          </h2>
          <p className="mt-1 text-sm text-muted">{c.tableSubtitleFriendly}</p>

          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {table.map((row) => {
              const active =
                mode === "uit-a-soles" && amount === String(row.uit);
              return (
                <li key={row.uit}>
                  <button
                    type="button"
                    onClick={() => applyQuick(row.uit)}
                    className={cn(
                      "group flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:shadow-brand/10",
                      active
                        ? "border-brand bg-brand-soft"
                        : "border-border bg-background hover:border-brand/35",
                    )}
                  >
                    <span>
                      <span className="block font-display text-lg font-semibold text-foreground">
                        {formatUit(row.uit, moneyLocale)}{" "}
                        <span className="text-sm font-medium text-muted">
                          UIT
                        </span>
                      </span>
                      <span className="mt-0.5 block text-sm tabular-nums text-brand">
                        {formatPen(row.soles, moneyLocale)}
                      </span>
                    </span>
                    <span
                      className={cn(
                        "inline-flex h-8 items-center rounded-full px-2.5 text-xs font-semibold transition-colors",
                        active
                          ? "bg-brand text-white"
                          : "bg-brand-soft text-brand group-hover:bg-brand group-hover:text-white",
                      )}
                    >
                      {c.useRow}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="animate-fade-up animation-delay-3 rounded-2xl border border-border bg-surface p-5 sm:p-6">
          <h2 className="font-display text-lg font-semibold text-foreground">
            {c.usesTitle}
          </h2>
          <p className="mt-1 text-sm text-muted">{c.usesIntro}</p>
          <ul className="mt-4 grid gap-3 sm:grid-cols-3">
            {(
              [
                { icon: "mdi:gavel" as const, text: c.use1 },
                { icon: "mdi:chart-timeline-variant" as const, text: c.use2 },
                { icon: "mdi:file-document-outline" as const, text: c.use3 },
              ] as const
            ).map((item) => (
              <li
                key={item.text}
                className="rounded-xl bg-background px-4 py-3 transition-colors hover:bg-brand-soft/40"
              >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-brand-soft text-brand">
                  <Icon icon={item.icon} className="h-4 w-4" />
                </span>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {item.text}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <p className="text-xs leading-relaxed text-muted">{c.disclaimer}</p>
      </div>
    </div>
  );
}
