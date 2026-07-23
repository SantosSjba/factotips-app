"use client";

import Link from "next/link";
import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { fieldControlClass } from "@/components/ui/select";
import { useI18n } from "@/lib/i18n/provider";
import { formatPen } from "@/lib/pe/igv";
import {
  ASIGNACION_FAMILIAR_SOLES,
  RMV_SOLES,
  calcularCts,
  gratiSugerida,
  type CtsPeriodo,
} from "@/lib/pe/cts";
import { TOOL_ROUTES } from "@/lib/seo/tools";
import { cn } from "@/lib/utils";

function parseAmount(raw: string): number | null {
  const normalized = raw.replace(",", ".").replace(/[^\d.]/g, "");
  if (!normalized) return null;
  const n = Number(normalized);
  if (!Number.isFinite(n) || n < 0) return null;
  return n;
}

function parseIntClamped(raw: string, max: number): number {
  const n = Number.parseInt(raw.replace(/[^\d]/g, ""), 10);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.min(max, n);
}

const PRESETS = [1130, 1500, 2000, 2500, 3500, 5000] as const;

export function CtsTool() {
  const { t, locale } = useI18n();
  const c = t.cts;
  const moneyLocale = locale === "en" ? "en-US" : "es-PE";

  const [periodo, setPeriodo] = useState<CtsPeriodo>("mayo");
  const [sueldo, setSueldo] = useState("2500");
  const [asignacion, setAsignacion] = useState(false);
  const [grati, setGrati] = useState("2500");
  const [otros, setOtros] = useState("0");
  const [meses, setMeses] = useState("6");
  const [dias, setDias] = useState("0");
  const [copied, setCopied] = useState(false);

  const sueldoN = parseAmount(sueldo);
  const gratiN = parseAmount(grati) ?? 0;
  const otrosN = parseAmount(otros) ?? 0;
  const mesesN = parseIntClamped(meses, 6);
  const diasN = parseIntClamped(dias, 29);

  const result =
    sueldoN === null
      ? null
      : calcularCts({
          sueldoBruto: sueldoN,
          asignacionFamiliar: asignacion,
          ultimaGratificacion: gratiN,
          otrosComputables: otrosN,
          periodo,
          meses: mesesN,
          dias: diasN,
        });

  function applyGratiSugerida() {
    if (sueldoN === null) return;
    setGrati(String(gratiSugerida(sueldoN, asignacion)));
  }

  async function copySummary() {
    if (!result) return;
    const lines = [
      c.copyTitle,
      `${c.periodo}: ${periodo === "mayo" ? c.periodoMayo : c.periodoNov}`,
      `${c.rc}: ${formatPen(result.remuneracionComputable, moneyLocale)}`,
      `${c.ctsTotal}: ${formatPen(result.ctsTotal, moneyLocale)}`,
      c.disclaimerShort,
    ];
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <Link
        href={TOOL_ROUTES.cts.landingPath}
        className="inline-flex items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-brand"
      >
        <Icon icon="mdi:arrow-left" className="h-4 w-4" />
        {c.back}
      </Link>

      <header className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 max-w-2xl animate-fade-up">
          <p className="text-sm font-semibold tracking-[0.16em] text-brand uppercase">
            {c.eyebrow}
          </p>
          <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-[2rem]">
            {c.title}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted sm:text-base">
            {c.subtitle}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs animate-fade-up animation-delay-1">
          <span className="rounded-full border border-brand/25 bg-brand-soft px-3 py-1.5 font-semibold text-brand">
            RMV: {formatPen(RMV_SOLES, moneyLocale)}
          </span>
          <span className="rounded-full border border-border bg-surface px-3 py-1.5 font-medium text-muted">
            AF: {formatPen(ASIGNACION_FAMILIAR_SOLES, moneyLocale)}
          </span>
          <span className="rounded-full border border-border bg-surface px-3 py-1.5 font-medium text-muted">
            {c.chipDeposito}
          </span>
        </div>
      </header>

      <div className="mt-6 grid gap-4 lg:grid-cols-2 lg:items-stretch">
        <section className="flex flex-col rounded-2xl border border-border bg-surface p-4 sm:p-5 animate-fade-up animation-delay-1">
          <fieldset>
            <legend className="text-sm font-semibold text-foreground">
              {c.periodoLabel}
            </legend>
            <div className="mt-1.5 grid grid-cols-2 gap-2">
              {(
                [
                  {
                    id: "mayo" as const,
                    label: c.periodoMayo,
                    hint: c.periodoMayoHint,
                  },
                  {
                    id: "noviembre" as const,
                    label: c.periodoNov,
                    hint: c.periodoNovHint,
                  },
                ] as const
              ).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setPeriodo(item.id)}
                  className={cn(
                    "rounded-xl border px-2.5 py-2 text-left transition-colors",
                    periodo === item.id
                      ? "border-brand bg-brand text-white"
                      : "border-border bg-background hover:border-brand/40",
                  )}
                >
                  <span className="block text-sm font-semibold">{item.label}</span>
                  <span
                    className={cn(
                      "mt-0.5 block text-[10px] leading-snug",
                      periodo === item.id ? "text-white/80" : "text-muted",
                    )}
                  >
                    {item.hint}
                  </span>
                </button>
              ))}
            </div>
          </fieldset>

          <label className="mt-4 block">
            <span className="text-sm font-semibold text-foreground">
              {c.sueldoLabel}
            </span>
            <div className="relative mt-1.5">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center rounded-l-xl border-r border-border/80 bg-brand-soft/50 px-3 text-sm font-semibold text-brand">
                S/
              </span>
              <input
                type="text"
                inputMode="decimal"
                value={sueldo}
                onChange={(e) => setSueldo(e.target.value)}
                className={cn(
                  fieldControlClass,
                  "h-12 pl-14 pr-4 text-lg font-semibold tabular-nums focus:ring-4 focus:ring-brand/15",
                )}
                autoComplete="off"
              />
            </div>
          </label>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {PRESETS.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setSueldo(String(n))}
                className={cn(
                  "rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-colors",
                  sueldo === String(n)
                    ? "border-brand bg-brand-soft text-brand"
                    : "border-border hover:border-brand/40",
                )}
              >
                {formatPen(n, moneyLocale)}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setAsignacion(!asignacion)}
            className={cn(
              "mt-3 flex w-full items-start gap-2 rounded-xl border px-3 py-2.5 text-left transition-colors",
              asignacion
                ? "border-brand/40 bg-brand-soft/50"
                : "border-border bg-background hover:border-brand/30",
            )}
          >
            <span
              className={cn(
                "mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-md border",
                asignacion
                  ? "border-brand bg-brand text-white"
                  : "border-border bg-surface",
              )}
            >
              {asignacion ? <Icon icon="mdi:check" className="h-3 w-3" /> : null}
            </span>
            <span>
              <span className="block text-sm font-semibold text-foreground">
                {c.asignacionLabel}
              </span>
              <span className="mt-0.5 block text-[11px] leading-snug text-muted">
                {c.asignacionHint.replace(
                  "{monto}",
                  formatPen(ASIGNACION_FAMILIAR_SOLES, moneyLocale),
                )}
              </span>
            </span>
          </button>

          <label className="mt-3 block">
            <span className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-muted">
                {periodo === "mayo" ? c.gratiDicLabel : c.gratiJulLabel}
              </span>
              <button
                type="button"
                onClick={applyGratiSugerida}
                className="text-[11px] font-semibold text-brand hover:underline"
              >
                {c.gratiUsarSueldo}
              </button>
            </span>
            <input
              type="text"
              inputMode="decimal"
              value={grati}
              onChange={(e) => setGrati(e.target.value)}
              className={cn(fieldControlClass, "mt-1")}
            />
            <span className="mt-1 block text-[10px] leading-snug text-muted">
              {c.gratiHint}
            </span>
          </label>

          <label className="mt-3 block">
            <span className="text-xs font-semibold text-muted">
              {c.otrosLabel}
            </span>
            <input
              type="text"
              inputMode="decimal"
              value={otros}
              onChange={(e) => setOtros(e.target.value)}
              className={cn(fieldControlClass, "mt-1")}
            />
            <span className="mt-1 block text-[10px] leading-snug text-muted">
              {c.otrosHint}
            </span>
          </label>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <label className="block">
              <span className="text-xs font-semibold text-muted">
                {c.mesesLabel}
              </span>
              <input
                type="text"
                inputMode="numeric"
                value={meses}
                onChange={(e) => setMeses(e.target.value)}
                className={cn(fieldControlClass, "mt-1")}
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-muted">
                {c.diasLabel}
              </span>
              <input
                type="text"
                inputMode="numeric"
                value={dias}
                onChange={(e) => setDias(e.target.value)}
                className={cn(fieldControlClass, "mt-1")}
              />
            </label>
          </div>
          <p className="mt-1 text-[10px] text-muted">{c.tiempoHint}</p>
        </section>

        <section className="flex flex-col rounded-2xl border border-brand/20 bg-gradient-to-br from-brand-soft/70 via-surface to-accent-soft/30 p-4 sm:p-5 animate-fade-up animation-delay-2">
          {sueldoN === null ? (
            <p className="text-sm text-danger">{c.invalid}</p>
          ) : result ? (
            <>
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-brand">{c.resultTitle}</p>
                <button
                  type="button"
                  onClick={copySummary}
                  className={cn(
                    "inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-semibold",
                    copied
                      ? "bg-success text-white"
                      : "border border-border bg-surface hover:border-brand/40",
                  )}
                >
                  <Icon
                    icon={copied ? "mdi:check" : "mdi:content-copy"}
                    className="h-3.5 w-3.5"
                  />
                  {copied ? c.copied : c.copy}
                </button>
              </div>

              <p className="mt-3 font-display text-4xl font-semibold tracking-tight text-foreground">
                {formatPen(result.ctsTotal, moneyLocale)}
              </p>
              <p className="mt-1 text-sm text-muted">
                {c.ctsHint
                  .replace(
                    "{periodo}",
                    periodo === "mayo" ? c.periodoMayo : c.periodoNov,
                  )
                  .replace("{dia}", String(result.depositoDia))}
              </p>

              <dl className="mt-auto space-y-2 border-t border-border/70 pt-4 text-sm">
                <Row
                  label={c.rc}
                  value={formatPen(result.remuneracionComputable, moneyLocale)}
                />
                <Row
                  label={c.ctsMeses}
                  value={formatPen(result.ctsPorMeses, moneyLocale)}
                />
                <Row
                  label={c.ctsDias}
                  value={formatPen(result.ctsPorDias, moneyLocale)}
                />
                <div className="border-t border-border pt-2">
                  <Row
                    label={c.ctsTotal}
                    value={formatPen(result.ctsTotal, moneyLocale)}
                    bold
                  />
                </div>
              </dl>
            </>
          ) : null}
        </section>
      </div>

      {result ? (
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <section className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
            <h2 className="font-display text-base font-semibold text-foreground">
              {c.rcTitle}
            </h2>
            <p className="mt-0.5 text-xs text-muted">{c.rcSubtitle}</p>
            <dl className="mt-3 space-y-1.5 text-sm">
              <Row
                label={c.sueldo}
                value={formatPen(result.sueldoBruto, moneyLocale)}
              />
              <Row
                label={c.asignacion}
                value={formatPen(result.asignacionFamiliar, moneyLocale)}
              />
              <Row
                label={c.sexta}
                value={formatPen(result.sextaGratificacion, moneyLocale)}
              />
              {result.otrosComputables > 0 ? (
                <Row
                  label={c.otros}
                  value={formatPen(result.otrosComputables, moneyLocale)}
                />
              ) : null}
              <div className="border-t border-border pt-2">
                <Row
                  label={c.rc}
                  value={formatPen(result.remuneracionComputable, moneyLocale)}
                  bold
                />
              </div>
            </dl>
          </section>

          <section className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
            <h2 className="font-display text-base font-semibold text-foreground">
              {c.formulaTitle}
            </h2>
            <ul className="mt-3 space-y-2 text-xs leading-relaxed text-muted">
              <li className="flex gap-2">
                <Icon
                  icon="mdi:calculator-variant"
                  className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand"
                />
                {c.formulaMeses}
              </li>
              <li className="flex gap-2">
                <Icon
                  icon="mdi:calendar"
                  className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand"
                />
                {c.formulaDias}
              </li>
              <li className="flex gap-2">
                <Icon
                  icon="mdi:plus-circle-outline"
                  className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand"
                />
                {c.formulaTotal}
              </li>
            </ul>
            <p className="mt-3 rounded-lg bg-brand-soft/40 px-2.5 py-2 text-[11px] leading-relaxed text-muted">
              {c.retiroNote}
            </p>
          </section>

          <section className="rounded-2xl border border-border bg-surface p-4 sm:p-5 md:col-span-2">
            <h2 className="font-display text-base font-semibold text-foreground">
              {c.rulesTitle}
            </h2>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {[c.rule1, c.rule2, c.rule3, c.rule4].map((text) => (
                <li
                  key={text}
                  className="flex gap-2 text-xs leading-relaxed text-muted"
                >
                  <Icon
                    icon="mdi:check-circle-outline"
                    className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand"
                  />
                  {text}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[11px] leading-relaxed text-muted">
              {c.disclaimer}
            </p>
          </section>
        </div>
      ) : null}
    </div>
  );
}

function Row({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className={cn("text-muted", bold && "font-semibold text-foreground")}>
        {label}
      </dt>
      <dd
        className={cn(
          "shrink-0 tabular-nums font-medium text-foreground",
          bold && "font-display text-base font-semibold text-brand sm:text-lg",
        )}
      >
        {value}
      </dd>
    </div>
  );
}
