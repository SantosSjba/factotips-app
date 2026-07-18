"use client";

import Link from "next/link";
import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { useI18n } from "@/lib/i18n/provider";
import { formatPen } from "@/lib/pe/igv";
import {
  ASIGNACION_FAMILIAR_SOLES,
  GRATIFICACION_BONIF,
  RMV_SOLES,
  calcularGratificacion,
  formatPctBonif,
  type GratificacionPeriodo,
  type GratificacionSeguro,
} from "@/lib/pe/gratificacion";
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

export function GratificacionTool() {
  const { t, locale } = useI18n();
  const c = t.gratificacion;
  const moneyLocale = locale === "en" ? "en-US" : "es-PE";

  const [periodo, setPeriodo] = useState<GratificacionPeriodo>("julio");
  const [sueldo, setSueldo] = useState("2500");
  const [asignacion, setAsignacion] = useState(false);
  const [otros, setOtros] = useState("0");
  const [meses, setMeses] = useState("6");
  const [dias, setDias] = useState("0");
  const [seguro, setSeguro] = useState<GratificacionSeguro>("essalud");
  const [copied, setCopied] = useState(false);

  const sueldoN = parseAmount(sueldo);
  const otrosN = parseAmount(otros) ?? 0;
  const mesesN = parseIntClamped(meses, 6);
  const diasN = parseIntClamped(dias, 29);

  const result =
    sueldoN === null
      ? null
      : calcularGratificacion({
          sueldoBruto: sueldoN,
          asignacionFamiliar: asignacion,
          otrosComputables: otrosN,
          periodo,
          meses: mesesN,
          dias: diasN,
          seguro,
        });

  async function copySummary() {
    if (!result) return;
    const lines = [
      c.copyTitle,
      `${c.periodo}: ${periodo === "julio" ? c.periodoJulio : c.periodoDic}`,
      `${c.gratificacion}: ${formatPen(result.gratificacion, moneyLocale)}`,
      `${c.bonificacion}: ${formatPen(result.bonificacion, moneyLocale)}`,
      `${c.total}: ${formatPen(result.total, moneyLocale)}`,
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
        href={TOOL_ROUTES.gratificacion.landingPath}
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
            Essalud {formatPctBonif(GRATIFICACION_BONIF.essalud)}
          </span>
          <span className="rounded-full border border-border bg-surface px-3 py-1.5 font-medium text-muted">
            EPS {formatPctBonif(GRATIFICACION_BONIF.eps)}
          </span>
          <span className="rounded-full border border-border bg-surface px-3 py-1.5 font-medium text-muted">
            RMV: {formatPen(RMV_SOLES, moneyLocale)}
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
                    id: "julio" as const,
                    label: c.periodoJulio,
                    hint: c.periodoJulioHint,
                  },
                  {
                    id: "diciembre" as const,
                    label: c.periodoDic,
                    hint: c.periodoDicHint,
                  },
                ] as const
              ).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setPeriodo(item.id);
                    setMeses(item.id === "diciembre" ? "5" : "6");
                  }}
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
                className="h-12 w-full rounded-xl border border-border bg-background pl-14 pr-4 text-lg font-semibold tabular-nums outline-none focus:border-brand focus:ring-4 focus:ring-brand/15"
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
            <span className="text-xs font-semibold text-muted">
              {c.otrosLabel}
            </span>
            <input
              type="text"
              inputMode="decimal"
              value={otros}
              onChange={(e) => setOtros(e.target.value)}
              className="mt-1 h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-brand"
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
                className="mt-1 h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-brand"
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
                className="mt-1 h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-brand"
              />
            </label>
          </div>
          <p className="mt-1 text-[10px] text-muted">{c.tiempoHint}</p>

          <fieldset className="mt-4">
            <legend className="text-xs font-semibold text-muted">
              {c.seguroLabel}
            </legend>
            <div className="mt-1.5 grid grid-cols-2 gap-2">
              {(
                [
                  {
                    id: "essalud" as const,
                    label: c.seguroEssalud,
                    hint: formatPctBonif(GRATIFICACION_BONIF.essalud),
                  },
                  {
                    id: "eps" as const,
                    label: c.seguroEps,
                    hint: formatPctBonif(GRATIFICACION_BONIF.eps),
                  },
                ] as const
              ).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSeguro(item.id)}
                  className={cn(
                    "rounded-xl border px-3 py-2.5 text-left transition-colors",
                    seguro === item.id
                      ? "border-brand bg-brand-soft text-brand"
                      : "border-border bg-background hover:border-brand/40",
                  )}
                >
                  <span className="block text-sm font-semibold">{item.label}</span>
                  <span className="mt-0.5 block text-[11px] text-muted">
                    {item.hint}
                  </span>
                </button>
              ))}
            </div>
          </fieldset>
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
                {formatPen(result.total, moneyLocale)}
              </p>
              <p className="mt-1 text-sm text-muted">
                {c.totalHint
                  .replace(
                    "{periodo}",
                    periodo === "julio" ? c.periodoJulio : c.periodoDic,
                  )
                  .replace("{dia}", String(result.pagoDia))}
              </p>

              <dl className="mt-auto space-y-2 border-t border-border/70 pt-4 text-sm">
                <Row
                  label={c.rc}
                  value={formatPen(result.remuneracionComputable, moneyLocale)}
                />
                <Row
                  label={c.gratificacion}
                  value={formatPen(result.gratificacion, moneyLocale)}
                />
                <Row
                  label={`${c.bonificacion} (${formatPctBonif(result.tasaBonificacion)})`}
                  value={formatPen(result.bonificacion, moneyLocale)}
                />
                <div className="border-t border-border pt-2">
                  <Row
                    label={c.total}
                    value={formatPen(result.total, moneyLocale)}
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
                {c.formulaGrati}
              </li>
              <li className="flex gap-2">
                <Icon
                  icon="mdi:percent"
                  className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand"
                />
                {c.formulaBonif}
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
              {c.inafectaNote}
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
