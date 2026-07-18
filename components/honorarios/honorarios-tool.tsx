"use client";

import Link from "next/link";
import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { useI18n } from "@/lib/i18n/provider";
import { formatPen } from "@/lib/pe/igv";
import {
  HONORARIOS_RETENCION_TASA,
  HONORARIOS_SUSPENSION,
  HONORARIOS_UMBRAL_RETENCION,
  UIT_SOLES,
  calcularHonorarios,
  formatPctHonorarios,
  type HonorariosMode,
  type HonorariosPerfil,
} from "@/lib/pe/honorarios";
import { TOOL_ROUTES } from "@/lib/seo/tools";
import { cn } from "@/lib/utils";

function parseAmount(raw: string): number | null {
  const normalized = raw.replace(",", ".").replace(/[^\d.]/g, "");
  if (!normalized) return null;
  const n = Number(normalized);
  if (!Number.isFinite(n) || n < 0) return null;
  return n;
}

const PRESETS = [500, 1000, 1500, 2000, 3500, 5000, 8000] as const;

export function HonorariosTool() {
  const { t, locale } = useI18n();
  const c = t.honorarios;
  const moneyLocale = locale === "en" ? "en-US" : "es-PE";

  const [mode, setMode] = useState<HonorariosMode>("bruto-a-neto");
  const [monto, setMonto] = useState("2500");
  const [conSuspension, setConSuspension] = useState(false);
  const [perfil, setPerfil] = useState<HonorariosPerfil>("profesional");
  const [proyectado, setProyectado] = useState("0");
  const [copied, setCopied] = useState(false);

  const montoN = parseAmount(monto);
  const proyectadoN = parseAmount(proyectado) ?? 0;

  const result =
    montoN === null
      ? null
      : calcularHonorarios({
          monto: montoN,
          mode,
          conSuspension,
          perfil,
          ingresosAnualesProyectados: proyectadoN,
        });

  async function copySummary() {
    if (!result) return;
    const lines = [
      c.copyTitle,
      `${c.bruto}: ${formatPen(result.bruto, moneyLocale)}`,
      `${c.retencion}: ${formatPen(result.retencion, moneyLocale)} (${formatPctHonorarios(result.tasaRetencion)})`,
      `${c.neto}: ${formatPen(result.neto, moneyLocale)}`,
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
        href={TOOL_ROUTES.honorarios.landingPath}
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
            {formatPctHonorarios(HONORARIOS_RETENCION_TASA)} {c.chipRetencion}
          </span>
          <span className="rounded-full border border-border bg-surface px-3 py-1.5 font-medium text-muted">
            {c.chipUmbral} {formatPen(HONORARIOS_UMBRAL_RETENCION, moneyLocale)}
          </span>
          <span className="rounded-full border border-border bg-surface px-3 py-1.5 font-medium text-muted">
            UIT {result?.anio ?? 2026}: {formatPen(UIT_SOLES, moneyLocale)}
          </span>
        </div>
      </header>

      <div className="mt-6 grid gap-4 lg:grid-cols-2 lg:items-stretch">
        <section className="flex flex-col rounded-2xl border border-border bg-surface p-4 sm:p-5 animate-fade-up animation-delay-1">
          <fieldset>
            <legend className="text-sm font-semibold text-foreground">
              {c.modeLabel}
            </legend>
            <div className="mt-1.5 grid grid-cols-2 gap-2">
              {(
                [
                  {
                    id: "bruto-a-neto" as const,
                    label: c.modeBrutoNeto,
                    hint: c.modeBrutoNetoHint,
                  },
                  {
                    id: "neto-a-bruto" as const,
                    label: c.modeNetoBruto,
                    hint: c.modeNetoBrutoHint,
                  },
                ] as const
              ).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setMode(item.id)}
                  className={cn(
                    "rounded-xl border px-2.5 py-2 text-left transition-colors",
                    mode === item.id
                      ? "border-brand bg-brand text-white"
                      : "border-border bg-background hover:border-brand/40",
                  )}
                >
                  <span className="block text-sm font-semibold">{item.label}</span>
                  <span
                    className={cn(
                      "mt-0.5 block text-[10px] leading-snug",
                      mode === item.id ? "text-white/80" : "text-muted",
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
              {mode === "bruto-a-neto" ? c.montoBruto : c.montoNeto}
            </span>
            <div className="relative mt-1.5">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center rounded-l-xl border-r border-border/80 bg-brand-soft/50 px-3 text-sm font-semibold text-brand">
                S/
              </span>
              <input
                type="text"
                inputMode="decimal"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
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
                onClick={() => setMonto(String(n))}
                className={cn(
                  "rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-colors",
                  monto === String(n)
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
            onClick={() => setConSuspension(!conSuspension)}
            className={cn(
              "mt-4 flex w-full items-start gap-2 rounded-xl border px-3 py-2.5 text-left transition-colors",
              conSuspension
                ? "border-brand/40 bg-brand-soft/50"
                : "border-border bg-background hover:border-brand/30",
            )}
          >
            <span
              className={cn(
                "mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-md border",
                conSuspension
                  ? "border-brand bg-brand text-white"
                  : "border-border bg-surface",
              )}
            >
              {conSuspension ? (
                <Icon icon="mdi:check" className="h-3 w-3" />
              ) : null}
            </span>
            <span>
              <span className="block text-sm font-semibold text-foreground">
                {c.suspensionLabel}
              </span>
              <span className="mt-0.5 block text-[11px] leading-snug text-muted">
                {c.suspensionHint}
              </span>
            </span>
          </button>

          <fieldset className="mt-4">
            <legend className="text-xs font-semibold text-muted">
              {c.perfilLabel}
            </legend>
            <div className="mt-1.5 grid grid-cols-2 gap-2">
              {(
                [
                  {
                    id: "profesional" as const,
                    label: c.perfilProfesional,
                  },
                  { id: "director" as const, label: c.perfilDirector },
                ] as const
              ).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setPerfil(item.id)}
                  className={cn(
                    "rounded-xl border px-3 py-2.5 text-sm font-semibold transition-colors",
                    perfil === item.id
                      ? "border-brand bg-brand-soft text-brand"
                      : "border-border bg-background hover:border-brand/40",
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </fieldset>

          <label className="mt-3 block">
            <span className="text-xs font-semibold text-muted">
              {c.proyectadoLabel}
            </span>
            <input
              type="text"
              inputMode="decimal"
              value={proyectado}
              onChange={(e) => setProyectado(e.target.value)}
              className="mt-1 h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-brand"
            />
            <span className="mt-1 block text-[10px] leading-snug text-muted">
              {c.proyectadoHint}
            </span>
          </label>
        </section>

        <section className="flex flex-col rounded-2xl border border-brand/20 bg-gradient-to-br from-brand-soft/70 via-surface to-accent-soft/30 p-4 sm:p-5 animate-fade-up animation-delay-2">
          {montoN === null ? (
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
                {formatPen(
                  mode === "bruto-a-neto" ? result.neto : result.bruto,
                  moneyLocale,
                )}
              </p>
              <p className="mt-1 text-sm text-muted">
                {mode === "bruto-a-neto" ? c.netoHint : c.brutoHint}
              </p>

              <dl className="mt-auto space-y-2 border-t border-border/70 pt-4 text-sm">
                <Row
                  label={c.bruto}
                  value={formatPen(result.bruto, moneyLocale)}
                />
                <Row
                  label={`${c.retencion} (${formatPctHonorarios(result.tasaRetencion)})`}
                  value={
                    result.aplicaRetencion
                      ? `− ${formatPen(result.retencion, moneyLocale)}`
                      : formatPen(0, moneyLocale)
                  }
                  accent={result.aplicaRetencion}
                />
                <div className="border-t border-border pt-2">
                  <Row
                    label={c.neto}
                    value={formatPen(result.neto, moneyLocale)}
                    bold
                  />
                </div>
              </dl>

              {!result.aplicaRetencion ? (
                <p className="mt-3 rounded-lg bg-brand-soft/50 px-2.5 py-2 text-xs text-brand">
                  {conSuspension
                    ? c.sinRetencionSuspension
                    : !result.superaUmbral
                      ? c.sinRetencionUmbral.replace(
                          "{umbral}",
                          formatPen(HONORARIOS_UMBRAL_RETENCION, moneyLocale),
                        )
                      : c.sinRetencion}
                </p>
              ) : null}
            </>
          ) : null}
        </section>
      </div>

      {result ? (
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <section className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
            <h2 className="font-display text-base font-semibold text-foreground">
              {c.suspensionTitle}
            </h2>
            <p className="mt-0.5 text-xs text-muted">{c.suspensionSubtitle}</p>

            <dl className="mt-3 space-y-1.5 text-sm">
              <Row
                label={c.topeAnual}
                value={formatPen(result.suspension.topeAnual, moneyLocale)}
              />
              <Row
                label={c.topeMensual}
                value={formatPen(result.suspension.topeMensual, moneyLocale)}
              />
              <Row
                label={c.proyectado}
                value={formatPen(result.suspension.proyectado, moneyLocale)}
              />
              <Row
                label={c.restante}
                value={formatPen(result.suspension.restanteAnual, moneyLocale)}
                bold
              />
            </dl>

            <div className="mt-3">
              <div className="flex items-center justify-between text-[11px] text-muted">
                <span>{c.usoTope}</span>
                <span className="tabular-nums font-semibold text-foreground">
                  {result.suspension.usoTopePct}%
                </span>
              </div>
              <div className="mt-1 h-2 overflow-hidden rounded-full bg-border/60">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    result.suspension.dentroTopeAnual
                      ? "bg-brand"
                      : "bg-accent",
                  )}
                  style={{
                    width: `${Math.min(100, result.suspension.usoTopePct)}%`,
                  }}
                />
              </div>
              <p
                className={cn(
                  "mt-2 text-xs",
                  result.suspension.dentroTopeAnual
                    ? "text-brand"
                    : "text-accent",
                )}
              >
                {result.suspension.dentroTopeAnual
                  ? c.dentroTope
                  : c.fueraTope}
              </p>
            </div>

            <p className="mt-3 text-[11px] leading-relaxed text-muted">
              {c.suspensionOrientacion}
            </p>
          </section>

          <section className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
            <h2 className="font-display text-base font-semibold text-foreground">
              {c.topesTitle}
            </h2>
            <p className="mt-0.5 text-xs text-muted">{c.topesSubtitle}</p>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border text-[10px] tracking-wide text-muted uppercase">
                    <th className="py-1.5 pr-2 font-semibold">{c.colPerfil}</th>
                    <th className="py-1.5 pr-2 font-semibold">{c.colAnual}</th>
                    <th className="py-1.5 font-semibold">{c.colMensual}</th>
                  </tr>
                </thead>
                <tbody>
                  {(
                    [
                      {
                        id: "profesional" as const,
                        label: c.perfilProfesional,
                      },
                      { id: "director" as const, label: c.perfilDirector },
                    ] as const
                  ).map((row) => {
                    const t = HONORARIOS_SUSPENSION[row.id];
                    return (
                      <tr
                        key={row.id}
                        className={cn(
                          "border-b border-border/60",
                          row.id === perfil && "bg-brand-soft/40",
                        )}
                      >
                        <td className="py-1.5 pr-2 font-medium">{row.label}</td>
                        <td className="py-1.5 pr-2 tabular-nums">
                          {formatPen(t.anual, moneyLocale)}
                        </td>
                        <td className="py-1.5 tabular-nums">
                          {formatPen(t.mensual, moneyLocale)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-muted">
              {c.topesHint}
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
  accent,
  bold,
}: {
  label: string;
  value: string;
  accent?: boolean;
  bold?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className={cn("text-muted", bold && "font-semibold text-foreground")}>
        {label}
      </dt>
      <dd
        className={cn(
          "shrink-0 tabular-nums",
          accent && "font-medium text-accent",
          bold && "font-display text-base font-semibold text-brand sm:text-lg",
          !accent && !bold && "font-medium text-foreground",
        )}
      >
        {value}
      </dd>
    </div>
  );
}
