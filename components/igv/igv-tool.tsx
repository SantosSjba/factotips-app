"use client";

import Link from "next/link";
import { useState } from "react";
import { IgvDonutChart, IgvStackedBar } from "@/components/igv/igv-chart";
import { IgvVoucherSim } from "@/components/igv/igv-voucher-sim";
import { Icon } from "@/components/ui/icon";
import { fieldControlClass } from "@/components/ui/select";
import { useI18n } from "@/lib/i18n/provider";
import {
  buildIgvSummary,
  calcularIgv,
  compararTasas,
  formatPen,
  formatRatePercent,
  formulaForMode,
  type IgvMode,
} from "@/lib/pe/igv";
import { IGV_PRESETS, type IgvTasaKey } from "@/lib/pe/indicadores";
import { TOOL_ROUTES } from "@/lib/seo/tools";
import { cn } from "@/lib/utils";

function parseAmount(raw: string): number | null {
  const normalized = raw.replace(",", ".").replace(/[^\d.]/g, "");
  if (!normalized) return null;
  const n = Number(normalized);
  if (!Number.isFinite(n) || n < 0) return null;
  return n;
}

export function IgvTool() {
  const { t, locale } = useI18n();
  const c = t.igv;
  const moneyLocale = locale === "en" ? "en-US" : "es-PE";

  const [mode, setMode] = useState<IgvMode>("agregar");
  const [rateKey, setRateKey] = useState<IgvTasaKey>("general");
  const [amount, setAmount] = useState("100");
  const [copied, setCopied] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);

  const parsed = parseAmount(amount);
  const result = parsed === null ? null : calcularIgv(parsed, mode, rateKey);
  const compare = parsed === null ? null : compararTasas(parsed, mode);
  const ratePct = result ? roundPct(result.rate) : rateKey === "general" ? 18 : 10;

  async function copySummary() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(buildIgvSummary(result, moneyLocale));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  const ruleItems = [
    { title: c.rule1Title, text: c.rule1Text, icon: "mdi:scale-balance" as const },
    { title: c.rule2Title, text: c.rule2Text, icon: "mdi:percent" as const },
    { title: c.rule3Title, text: c.rule3Text, icon: "mdi:storefront-outline" as const },
    { title: c.rule4Title, text: c.rule4Text, icon: "mdi:file-document-outline" as const },
  ];

  const voucherLabels = {
    sectionTitle: c.voucherTitle,
    sectionSubtitle: c.voucherSubtitle,
    kindLabel: c.voucherKind,
    boleta: c.voucherBoleta,
    factura: c.voucherFactura,
    emitter: c.voucherEmitter,
    emitterPlaceholder: c.voucherEmitterPh,
    ruc: c.voucherRuc,
    rucPlaceholder: c.voucherRucPh,
    client: c.voucherClient,
    clientBoletaPlaceholder: c.voucherClientBoletaPh,
    clientFacturaPlaceholder: c.voucherClientFacturaPh,
    clientDoc: c.voucherClientDoc,
    clientDocBoleta: c.voucherDni,
    clientDocFactura: c.voucherClientRuc,
    itemsTitle: c.voucherItemsTitle,
    item: c.voucherItem,
    itemPlaceholder: c.voucherItemPh,
    qty: c.voucherQty,
    unitPrice: c.voucherUnitPrice,
    unitPriceHintAdd: c.voucherUnitHintAdd,
    unitPriceHintExtract: c.voucherUnitHintExtract,
    lineSubtotal: c.voucherLineSubtotal,
    addItem: c.voucherAddItem,
    removeItem: c.voucherRemoveItem,
    series: c.voucherSeries,
    number: c.voucherNumber,
    date: c.voucherDate,
    currency: c.voucherCurrency,
    opGravada: c.voucherOpGravada,
    igv: c.voucherIgv,
    igvSplitHint: c.voucherIgvSplit,
    total: c.total,
    watermark: c.voucherWatermark,
    note: c.voucherNote,
    copy: c.copy,
    copied: c.copied,
    previewEmpty: c.voucherEmpty,
    configHint: c.voucherConfigHint,
    demoEmitter: c.voucherDemoEmitter,
    demoItem: c.voucherDemoItem,
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <Link
        href={TOOL_ROUTES.igv.landingPath}
        className="inline-flex items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-brand"
      >
        <Icon icon="mdi:arrow-left" className="h-4 w-4" />
        {c.back}
      </Link>

      <header className="mt-6 max-w-3xl">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {c.title}
        </h1>
        <p className="mt-3 text-base leading-relaxed text-muted sm:text-lg">
          {c.subtitle}
        </p>
      </header>

      <nav className="mt-6 flex flex-wrap gap-2" aria-label={c.jumpNavLabel}>
        {(
          [
            {
              href: "#igv-calcular",
              label: c.jumpCalc,
              icon: "mdi:calculator-variant" as const,
              primary: false,
            },
            {
              href: "#igv-simulador",
              label: c.jumpVoucher,
              icon: "mdi:receipt-text-outline" as const,
              primary: true,
            },
            {
              href: "#igv-resultado",
              label: c.jumpResult,
              icon: "mdi:cash-multiple" as const,
              primary: false,
            },
            {
              href: "#igv-grafico",
              label: c.jumpChart,
              icon: "mdi:chart-donut" as const,
              primary: false,
            },
            {
              href: "#igv-reglas",
              label: c.jumpRules,
              icon: "mdi:book-open-page-variant" as const,
              primary: false,
            },
          ] as const
        ).map((item) => (
          <a
            key={item.href}
            href={item.href}
            className={cn(
              "inline-flex h-10 items-center gap-1.5 rounded-xl border px-3.5 text-sm font-semibold transition-colors",
              item.primary
                ? "border-brand bg-brand text-white hover:bg-brand-dark"
                : "border-border bg-surface text-foreground hover:border-brand/40 hover:text-brand",
            )}
          >
            <Icon icon={item.icon} className="h-4 w-4" />
            {item.label}
          </a>
        ))}
      </nav>

      {/* Config + simulador juntos */}
      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(260px,0.85fr)_minmax(0,1.35fr)] lg:items-start">
        <div id="igv-calcular" className="scroll-mt-24 space-y-5">
          <fieldset>
            <legend className="text-sm font-semibold text-foreground">
              {c.modeLabel}
            </legend>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {(
                [
                  { id: "agregar" as const, label: c.modeAdd },
                  { id: "extraer" as const, label: c.modeExtract },
                ] as const
              ).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setMode(item.id)}
                  className={cn(
                    "rounded-xl border px-3 py-3 text-sm font-semibold transition-colors",
                    mode === item.id
                      ? "border-brand bg-brand text-white"
                      : "border-border bg-surface text-foreground hover:border-brand/40",
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-sm font-semibold text-foreground">
              {c.rateLabel}
            </legend>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {(
                [
                  { id: "general" as const, label: c.rate18 },
                  { id: "mype" as const, label: c.rate10 },
                ] as const
              ).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setRateKey(item.id)}
                  className={cn(
                    "rounded-xl border px-3 py-3 text-sm font-semibold transition-colors",
                    rateKey === item.id
                      ? "border-brand bg-brand-soft text-brand"
                      : "border-border bg-surface text-foreground hover:border-brand/40",
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
            {rateKey === "mype" ? (
              <p className="mt-2 text-xs leading-relaxed text-muted">{c.mypeNote}</p>
            ) : (
              <p className="mt-2 text-xs leading-relaxed text-muted">{c.generalNote}</p>
            )}
          </fieldset>

          <label className="block">
            <span className="text-sm font-semibold text-foreground">
              {mode === "agregar" ? c.amountBase : c.amountTotal}
            </span>
            <div className="relative mt-2">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm font-medium text-muted">
                S/
              </span>
              <input
                type="text"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={c.amountPlaceholder}
                className={cn(
                  fieldControlClass,
                  "h-12 pl-10 pr-4 text-base",
                )}
                autoComplete="off"
              />
            </div>
          </label>

          <div>
            <p className="text-xs font-semibold tracking-wide text-muted uppercase">
              {c.presetsLabel}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {IGV_PRESETS.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setAmount(String(n))}
                  className={cn(
                    "rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors",
                    amount === String(n)
                      ? "border-brand bg-brand-soft text-brand"
                      : "border-border bg-surface text-foreground hover:border-brand/40",
                  )}
                >
                  S/ {n.toLocaleString(moneyLocale)}
                </button>
              ))}
            </div>
          </div>

          {result ? (
            <div className="rounded-xl border border-dashed border-border bg-brand-soft/40 px-4 py-3">
              <p className="text-xs font-semibold tracking-wide text-muted uppercase">
                {c.formulaLabel}
              </p>
              <p className="mt-1 font-mono text-sm text-foreground">
                {formulaForMode(mode, ratePct)}
              </p>
              <p className="mt-1 text-xs text-muted">{c.formulaHint}</p>
            </div>
          ) : null}

          {parsed === null ? (
            <p className="text-sm text-danger">{c.invalidAmount}</p>
          ) : result ? (
            <div className="rounded-2xl border border-border bg-surface p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold tracking-wide text-muted uppercase">
                  {c.resultTitle} · {formatRatePercent(result.rate)}
                </p>
                <button
                  type="button"
                  onClick={copySummary}
                  className="inline-flex h-8 items-center gap-1 rounded-lg border border-border px-2.5 text-xs font-semibold text-foreground transition-colors hover:border-brand/40 hover:text-brand"
                >
                  <Icon
                    icon={copied ? "mdi:check" : "mdi:content-copy"}
                    className="h-3.5 w-3.5"
                  />
                  {copied ? c.copied : c.copy}
                </button>
              </div>
              <dl className="mt-3 space-y-2">
                <div className="flex justify-between gap-3 text-sm">
                  <dt className="text-muted">{c.base}</dt>
                  <dd className="font-semibold tabular-nums">
                    {formatPen(result.base, moneyLocale)}
                  </dd>
                </div>
                <div className="flex justify-between gap-3 text-sm">
                  <dt className="text-muted">{c.igvAmount}</dt>
                  <dd className="font-semibold tabular-nums text-accent">
                    {formatPen(result.igv, moneyLocale)}
                  </dd>
                </div>
                <div className="flex justify-between gap-3 border-t border-border pt-2 text-sm">
                  <dt className="font-semibold">{c.total}</dt>
                  <dd className="font-display text-lg font-semibold tabular-nums text-brand">
                    {formatPen(result.total, moneyLocale)}
                  </dd>
                </div>
              </dl>
            </div>
          ) : null}
        </div>

        <div id="igv-simulador" className="scroll-mt-24">
          <IgvVoucherSim
            mode={mode}
            rateKey={rateKey}
            locale={moneyLocale}
            labels={voucherLabels}
          />
        </div>
      </div>

      {/* Resultado ampliado + comparación */}
      <div id="igv-resultado" className="mt-8 scroll-mt-24 space-y-5">
        {result && compare ? (
          <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
            <h2 className="font-display text-lg font-semibold text-foreground">
              {c.compareTitle}
            </h2>
            <p className="mt-1 text-sm text-muted">{c.compareSubtitle}</p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[280px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-xs tracking-wide text-muted uppercase">
                    <th className="py-2 pr-3 font-semibold">{c.compareCol}</th>
                    <th className="py-2 pr-3 font-semibold">18%</th>
                    <th className="py-2 font-semibold">10%</th>
                  </tr>
                </thead>
                <tbody className="text-foreground">
                  <tr className="border-b border-border/70">
                    <td className="py-2.5 pr-3 text-muted">{c.base}</td>
                    <td className="py-2.5 pr-3 font-medium">
                      {formatPen(compare.general.base, moneyLocale)}
                    </td>
                    <td className="py-2.5 font-medium">
                      {formatPen(compare.mype.base, moneyLocale)}
                    </td>
                  </tr>
                  <tr className="border-b border-border/70">
                    <td className="py-2.5 pr-3 text-muted">{c.igvAmount}</td>
                    <td className="py-2.5 pr-3 font-medium text-accent">
                      {formatPen(compare.general.igv, moneyLocale)}
                    </td>
                    <td className="py-2.5 font-medium text-accent">
                      {formatPen(compare.mype.igv, moneyLocale)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-3 font-semibold">{c.total}</td>
                    <td className="py-2.5 pr-3 font-semibold text-brand">
                      {formatPen(compare.general.total, moneyLocale)}
                    </td>
                    <td className="py-2.5 font-semibold text-brand">
                      {formatPen(compare.mype.total, moneyLocale)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-muted">{c.compareNote}</p>
          </div>
        ) : null}
      </div>

      {/* Gráfico al final (antes de reglas) */}
      {result ? (
        <section
          id="igv-grafico"
          className="mt-8 scroll-mt-24 rounded-2xl border border-border bg-surface p-5 sm:p-6"
        >
          <h2 className="font-display text-lg font-semibold text-foreground">
            {c.chartTitle}
          </h2>
          <p className="mt-1 text-sm text-muted">{c.chartSubtitle}</p>
          <IgvStackedBar result={result} className="mt-5" />
          <div className="mt-6">
            <IgvDonutChart
              result={result}
              locale={moneyLocale}
              labels={{
                base: c.base,
                tax: c.igvAmount,
                igvNeto: c.splitIgv,
                ipm: c.splitIpm,
                ofTotal: c.ofTotal,
              }}
            />
          </div>
        </section>
      ) : null}

      <section
        id="igv-reglas"
        className="mt-10 scroll-mt-24 rounded-2xl border border-border bg-surface"
      >
        <button
          type="button"
          onClick={() => setRulesOpen((v) => !v)}
          className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left sm:px-6"
          aria-expanded={rulesOpen}
        >
          <span className="flex items-center gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-brand-soft text-brand">
              <Icon icon="mdi:book-open-page-variant" className="h-5 w-5" />
            </span>
            <span>
              <span className="block font-display text-lg font-semibold text-foreground">
                {c.rulesTitle}
              </span>
              <span className="block text-sm text-muted">{c.rulesSubtitle}</span>
            </span>
          </span>
          <Icon
            icon={rulesOpen ? "mdi:chevron-up" : "mdi:chevron-down"}
            className="h-5 w-5 shrink-0 text-muted"
          />
        </button>

        {rulesOpen ? (
          <div className="border-t border-border px-5 py-5 sm:px-6 sm:py-6">
            <ul className="grid gap-5 sm:grid-cols-2">
              {ruleItems.map((item) => (
                <li key={item.title}>
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-background text-brand">
                    <Icon icon={item.icon} className="h-4 w-4" />
                  </span>
                  <h3 className="mt-3 font-display text-base font-semibold text-foreground">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">
                    {item.text}
                  </p>
                </li>
              ))}
            </ul>

            <div className="mt-6 rounded-xl bg-background px-4 py-4">
              <h3 className="text-sm font-semibold text-foreground">
                {c.exemptTitle}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">
                {c.exemptText}
              </p>
            </div>

            <p className="mt-4 text-xs leading-relaxed text-muted">
              {c.rulesSource}{" "}
              <a
                href="https://www.sunat.gob.pe/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-brand underline-offset-2 hover:underline"
              >
                sunat.gob.pe
              </a>
            </p>
          </div>
        ) : null}
      </section>

      <p className="mt-6 text-xs leading-relaxed text-muted">{c.disclaimer}</p>
    </div>
  );
}

function roundPct(rate: number): number {
  return Math.round(rate * 10000) / 100;
}
