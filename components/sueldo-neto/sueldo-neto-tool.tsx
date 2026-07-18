"use client";

import Link from "next/link";
import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { useI18n } from "@/lib/i18n/provider";
import { formatPen } from "@/lib/pe/igv";
import {
  AFP_COMISIONES,
  AFP_COMISIONES_PERIODO,
  ASIGNACION_FAMILIAR_SOLES,
  AFP_TOPE_ASEGURABLE,
  RENTA_GASTOS_MAX_UIT,
  RMV_SOLES,
  UIT_SOLES,
  calcularSueldoNeto,
  defaultAfpComision,
  formatPct,
  formatPctAfp,
  type AfpComisionTipo,
  type PensionSystem,
} from "@/lib/pe/sueldo-neto";
import { TOOL_ROUTES } from "@/lib/seo/tools";
import { cn } from "@/lib/utils";

function parseAmount(raw: string): number | null {
  const normalized = raw.replace(",", ".").replace(/[^\d.]/g, "");
  if (!normalized) return null;
  const n = Number(normalized);
  if (!Number.isFinite(n) || n < 0) return null;
  return n;
}

const PRESETS = [1130, 1500, 2000, 2500, 3500, 5000, 8000] as const;

export function SueldoNetoTool() {
  const { t, locale } = useI18n();
  const c = t.sueldoNeto;
  const moneyLocale = locale === "en" ? "en-US" : "es-PE";

  const [bruto, setBruto] = useState("2500");
  const [sistema, setSistema] = useState<PensionSystem>("afp");
  const [afpId, setAfpId] = useState("habitat");
  const [afpTipo, setAfpTipo] = useState<AfpComisionTipo>("flujo");
  const [asignacion, setAsignacion] = useState(false);
  const [gratificaciones, setGratificaciones] = useState(true);
  const [otros, setOtros] = useState("0");
  const [gastos, setGastos] = useState("0");
  const [copied, setCopied] = useState(false);

  const brutoN = parseAmount(bruto);
  const otrosN = parseAmount(otros) ?? 0;
  const gastosN = parseAmount(gastos) ?? 0;
  const afpPreset =
    AFP_COMISIONES.find((a) => a.id === afpId) ?? AFP_COMISIONES[0]!;
  const comision =
    sistema === "afp"
      ? afpTipo === "flujo"
        ? afpPreset.comisionFlujo
        : 0
      : defaultAfpComision();

  const result =
    brutoN === null
      ? null
      : calcularSueldoNeto({
          brutoMensual: brutoN,
          sistema,
          afpComisionFlujo: comision,
          afpComisionTipo: afpTipo,
          asignacionFamiliar: asignacion,
          incluirGratificaciones: gratificaciones,
          otrosIngresosAnuales: otrosN,
          gastosDeducibles: gastosN,
        });

  async function copySummary() {
    if (!result) return;
    const lines = [
      c.copyTitle,
      `${c.bruto}: ${formatPen(result.remuneracionMensual, moneyLocale)}`,
      `${c.pension}: ${formatPen(result.pension.total, moneyLocale)} (${formatPct(result.pension.tasaEfectiva)})`,
      `${c.quintaMensual}: ${formatPen(result.quinta.retencionMensualEstimada, moneyLocale)}`,
      `${c.neto}: ${formatPen(result.netoMensual, moneyLocale)}`,
      `${c.quintaAnual}: ${formatPen(result.quinta.impuestoAnual, moneyLocale)}`,
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
        href={TOOL_ROUTES["sueldo-neto"].landingPath}
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
            UIT {result?.anio ?? 2026}: {formatPen(UIT_SOLES, moneyLocale)}
          </span>
          <span className="rounded-full border border-border bg-surface px-3 py-1.5 font-medium text-muted">
            RMV: {formatPen(RMV_SOLES, moneyLocale)}
          </span>
          <span className="rounded-full border border-border bg-surface px-3 py-1.5 font-medium text-muted">
            7 UIT = {formatPen(7 * UIT_SOLES, moneyLocale)}
          </span>
        </div>
      </header>

      {/* Fila principal: inputs + neto */}
      <div className="mt-6 grid gap-4 lg:grid-cols-2 lg:items-stretch">
        <section className="flex flex-col rounded-2xl border border-border bg-surface p-4 sm:p-5 animate-fade-up animation-delay-1">
          <label className="block">
            <span className="text-sm font-semibold text-foreground">
              {c.brutoLabel}
            </span>
            <div className="relative mt-1.5">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center rounded-l-xl border-r border-border/80 bg-brand-soft/50 px-3 text-sm font-semibold text-brand">
                S/
              </span>
              <input
                type="text"
                inputMode="decimal"
                value={bruto}
                onChange={(e) => setBruto(e.target.value)}
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
                onClick={() => setBruto(String(n))}
                className={cn(
                  "rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-colors",
                  bruto === String(n)
                    ? "border-brand bg-brand-soft text-brand"
                    : "border-border hover:border-brand/40",
                )}
              >
                {formatPen(n, moneyLocale)}
              </button>
            ))}
          </div>

          <fieldset className="mt-4">
            <legend className="text-sm font-semibold text-foreground">
              {c.sistemaLabel}
            </legend>
            <div className="mt-1.5 grid grid-cols-2 gap-2">
              {(
                [
                  { id: "afp" as const, label: c.sistemaAfp },
                  { id: "onp" as const, label: c.sistemaOnp },
                ] as const
              ).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSistema(item.id)}
                  className={cn(
                    "rounded-xl border px-3 py-2.5 text-sm font-semibold transition-colors",
                    sistema === item.id
                      ? "border-brand bg-brand text-white"
                      : "border-border bg-background hover:border-brand/40",
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </fieldset>

          {sistema === "afp" ? (
            <div className="mt-3 space-y-2.5">
              <fieldset>
                <legend className="text-xs font-semibold text-muted">
                  {c.afpTipoLabel}
                </legend>
                <div className="mt-1 grid grid-cols-2 gap-2">
                  {(
                    [
                      {
                        id: "flujo" as const,
                        label: c.afpTipoFlujo,
                        hint: c.afpTipoFlujoHint,
                      },
                      {
                        id: "saldo" as const,
                        label: c.afpTipoSaldo,
                        hint: c.afpTipoSaldoHint,
                      },
                    ] as const
                  ).map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setAfpTipo(item.id)}
                      className={cn(
                        "rounded-xl border px-2.5 py-2 text-left transition-colors",
                        afpTipo === item.id
                          ? "border-brand bg-brand-soft/60"
                          : "border-border bg-background hover:border-brand/40",
                      )}
                    >
                      <span className="block text-sm font-semibold text-foreground">
                        {item.label}
                      </span>
                      <span className="mt-0.5 block text-[10px] leading-snug text-muted">
                        {item.hint}
                      </span>
                    </button>
                  ))}
                </div>
              </fieldset>

              <label className="block">
                <span className="text-xs font-semibold text-muted">
                  {c.afpLabel}
                </span>
                <select
                  value={afpId}
                  onChange={(e) => setAfpId(e.target.value)}
                  className="mt-1 h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-brand"
                >
                  {AFP_COMISIONES.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.nombre} · {c.afpOptFlujo}{" "}
                      {formatPctAfp(a.comisionFlujo)} · {c.afpOptSaldo}{" "}
                      {formatPctAfp(a.comisionSaldoAnual)}
                    </option>
                  ))}
                </select>
              </label>

              {afpTipo === "saldo" ? (
                <p className="rounded-lg bg-brand-soft/40 px-2.5 py-1.5 text-[11px] leading-relaxed text-muted">
                  {c.afpSaldoNote
                    .replace("{afp}", afpPreset.nombre)
                    .replace(
                      "{saldo}",
                      formatPctAfp(afpPreset.comisionSaldoAnual),
                    )}
                </p>
              ) : (
                <p className="text-[11px] text-muted">
                  {c.afpHint.replace("{periodo}", AFP_COMISIONES_PERIODO)}
                </p>
              )}
            </div>
          ) : (
            <p className="mt-2 text-xs text-muted">{c.onpHint}</p>
          )}

          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <Toggle
              checked={asignacion}
              onChange={setAsignacion}
              label={c.asignacionLabel}
              hint={c.asignacionHint.replace(
                "{monto}",
                formatPen(ASIGNACION_FAMILIAR_SOLES, moneyLocale),
              )}
              compact
            />
            <Toggle
              checked={gratificaciones}
              onChange={setGratificaciones}
              label={c.gratiLabel}
              hint={c.gratiHint}
              compact
            />
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <label className="block">
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
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-muted">
                {c.gastosLabel}
              </span>
              <input
                type="text"
                inputMode="decimal"
                value={gastos}
                onChange={(e) => setGastos(e.target.value)}
                className="mt-1 h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-brand"
              />
              <span className="mt-1 block text-[10px] leading-snug text-muted">
                {c.gastosHint.replace(
                  "{max}",
                  formatPen(RENTA_GASTOS_MAX_UIT * UIT_SOLES, moneyLocale),
                )}
              </span>
            </label>
          </div>
        </section>

        <section className="flex flex-col rounded-2xl border border-brand/20 bg-gradient-to-br from-brand-soft/70 via-surface to-accent-soft/30 p-4 sm:p-5 animate-fade-up animation-delay-2">
          {brutoN === null ? (
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
                {formatPen(result.netoMensual, moneyLocale)}
              </p>
              <p className="mt-1 text-sm text-muted">{c.netoHint}</p>

              <dl className="mt-auto space-y-2 border-t border-border/70 pt-4 text-sm">
                <Row
                  label={c.remuneracion}
                  value={formatPen(result.remuneracionMensual, moneyLocale)}
                />
                <Row
                  label={`${c.pension} (${formatPct(result.pension.tasaEfectiva)})`}
                  value={`− ${formatPen(result.pension.total, moneyLocale)}`}
                  accent
                />
                <Row
                  label={c.quintaMensual}
                  value={`− ${formatPen(result.quinta.retencionMensualEstimada, moneyLocale)}`}
                  accent
                />
                <div className="border-t border-border pt-2">
                  <Row
                    label={c.neto}
                    value={formatPen(result.netoMensual, moneyLocale)}
                    bold
                  />
                </div>
              </dl>
            </>
          ) : null}
        </section>
      </div>

      {/* Detalle: 2 columnas equilibradas */}
      {result ? (
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <section className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
            <h2 className="font-display text-base font-semibold text-foreground">
              {c.pensionDetailTitle}
            </h2>
            <dl className="mt-3 space-y-1.5 text-sm">
              <Row
                label={c.baseAporte}
                value={formatPen(result.baseAporte, moneyLocale)}
              />
              {result.pension.sistema === "afp" ? (
                <>
                  <Row
                    label={c.afpFondo}
                    value={formatPen(result.pension.fondo, moneyLocale)}
                  />
                  <Row
                    label={c.afpSeguro}
                    value={formatPen(result.pension.seguro, moneyLocale)}
                  />
                  <Row
                    label={c.afpComision}
                    value={formatPen(result.pension.comision, moneyLocale)}
                  />
                </>
              ) : (
                <Row
                  label={c.onpAporte}
                  value={formatPen(result.pension.fondo, moneyLocale)}
                />
              )}
            </dl>
            <p className="mt-2 text-[11px] text-muted">
              {c.topeHint
                .replace("{tope}", formatPen(AFP_TOPE_ASEGURABLE, moneyLocale))
                .replace("{periodo}", AFP_COMISIONES_PERIODO)}
            </p>

            {sistema === "afp" ? (
              <div className="mt-3 overflow-x-auto">
                <p className="mb-1.5 text-xs font-semibold text-foreground">
                  {c.afpTablaTitle.replace("{periodo}", AFP_COMISIONES_PERIODO)}
                </p>
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-border text-[10px] tracking-wide text-muted uppercase">
                      <th className="py-1.5 pr-2 font-semibold">AFP</th>
                      <th className="py-1.5 pr-2 font-semibold">
                        {c.afpColFlujo}
                      </th>
                      <th className="py-1.5 font-semibold">{c.afpColSaldo}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {AFP_COMISIONES.map((a) => (
                      <tr
                        key={a.id}
                        className={cn(
                          "border-b border-border/60",
                          a.id === afpId && "bg-brand-soft/40",
                        )}
                      >
                        <td className="py-1.5 pr-2 font-medium">{a.nombre}</td>
                        <td className="py-1.5 pr-2 tabular-nums">
                          {formatPctAfp(a.comisionFlujo)}
                        </td>
                        <td className="py-1.5 tabular-nums">
                          {formatPctAfp(a.comisionSaldoAnual)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="mt-1.5 text-[10px] leading-snug text-muted">
                  {c.afpTablaHint}
                </p>
              </div>
            ) : null}
          </section>

          <section className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
            <h2 className="font-display text-base font-semibold text-foreground">
              {c.quintaTitle}
            </h2>
            <p className="mt-0.5 text-xs text-muted">{c.quintaSubtitle}</p>
            <dl className="mt-3 space-y-1.5 text-sm">
              <div>
                <Row
                  label={c.rentaBruta}
                  value={formatPen(result.quinta.rentaBrutaAnual, moneyLocale)}
                />
                <p className="mt-0.5 text-[10px] text-muted">
                  {c.rentaBrutaHint
                    .replace("{pagos}", String(result.quinta.pagosProyectados))
                    .replace(
                      "{bonif}",
                      result.quinta.bonificacionExtraordinaria > 0
                        ? formatPen(
                            result.quinta.bonificacionExtraordinaria,
                            moneyLocale,
                          )
                        : "—",
                    )}
                </p>
              </div>
              <Row
                label={c.deduccion7}
                value={`− ${formatPen(result.quinta.deduccion7Uit, moneyLocale)}`}
              />
              {result.quinta.gastosDeducibles > 0 ? (
                <Row
                  label={c.gastosAplicados}
                  value={`− ${formatPen(result.quinta.gastosDeducibles, moneyLocale)}`}
                />
              ) : null}
              <Row
                label={c.rentaNeta}
                value={formatPen(result.quinta.rentaNeta, moneyLocale)}
                bold
              />
              <Row
                label={c.quintaAnual}
                value={formatPen(result.quinta.impuestoAnual, moneyLocale)}
                accent
              />
            </dl>

            {result.quinta.tramos.length > 0 ? (
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-border text-[10px] tracking-wide text-muted uppercase">
                      <th className="py-1.5 pr-2 font-semibold">{c.tramoBase}</th>
                      <th className="py-1.5 pr-2 font-semibold">{c.tramoTasa}</th>
                      <th className="py-1.5 text-right font-semibold">
                        {c.tramoImpuesto}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.quinta.tramos.map((tramo) => (
                      <tr
                        key={`${tramo.desde}-${tramo.tasa}`}
                        className="border-b border-border/60"
                      >
                        <td className="py-1.5 pr-2 tabular-nums">
                          {formatPen(tramo.base, moneyLocale)}
                        </td>
                        <td className="py-1.5 pr-2">{formatPct(tramo.tasa)}</td>
                        <td className="py-1.5 text-right tabular-nums font-medium">
                          {formatPen(tramo.impuesto, moneyLocale)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="mt-3 rounded-lg bg-brand-soft/50 px-2.5 py-2 text-xs text-brand">
                {c.sinQuinta}
              </p>
            )}
          </section>

          <section className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
            <h2 className="font-display text-base font-semibold text-foreground">
              {c.empleadorTitle}
            </h2>
            <p className="mt-0.5 text-xs text-muted">{c.empleadorHint}</p>
            <dl className="mt-3 space-y-1.5 text-sm">
              <Row
                label={c.essalud}
                value={formatPen(result.essaludEmpleador, moneyLocale)}
              />
              <Row
                label={c.costoEmpleador}
                value={formatPen(result.costoEmpleadorMensual, moneyLocale)}
                bold
              />
            </dl>
          </section>

          <section className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
            <h2 className="font-display text-base font-semibold text-foreground">
              {c.rulesTitle}
            </h2>
            <ul className="mt-3 space-y-2">
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

function Toggle({
  checked,
  onChange,
  label,
  hint,
  compact,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  hint: string;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={cn(
        "flex w-full items-start gap-2 rounded-xl border text-left transition-colors",
        compact ? "px-2.5 py-2" : "gap-3 px-3 py-3",
        checked
          ? "border-brand/40 bg-brand-soft/50"
          : "border-border bg-background hover:border-brand/30",
      )}
    >
      <span
        className={cn(
          "mt-0.5 inline-flex shrink-0 items-center justify-center rounded-md border",
          compact ? "h-4 w-4" : "h-5 w-5",
          checked
            ? "border-brand bg-brand text-white"
            : "border-border bg-surface",
        )}
      >
        {checked ? (
          <Icon icon="mdi:check" className={compact ? "h-3 w-3" : "h-3.5 w-3.5"} />
        ) : null}
      </span>
      <span className="min-w-0">
        <span className="block text-xs font-semibold text-foreground sm:text-sm">
          {label}
        </span>
        <span
          className={cn(
            "mt-0.5 block text-muted",
            compact ? "line-clamp-2 text-[10px] leading-snug" : "text-xs",
          )}
        >
          {hint}
        </span>
      </span>
    </button>
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
