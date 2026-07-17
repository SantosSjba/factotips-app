"use client";

import { useId, useState, type HTMLAttributes } from "react";
import { Icon } from "@/components/ui/icon";
import {
  calcularIgv,
  formatPen,
  formatRatePercent,
  roundMoney,
  type IgvMode,
} from "@/lib/pe/igv";
import type { IgvTasaKey } from "@/lib/pe/indicadores";
import { cn } from "@/lib/utils";

export type VoucherKind = "boleta" | "factura";

export type IgvVoucherLabels = {
  sectionTitle: string;
  sectionSubtitle: string;
  kindLabel: string;
  boleta: string;
  factura: string;
  emitter: string;
  emitterPlaceholder: string;
  ruc: string;
  rucPlaceholder: string;
  client: string;
  clientBoletaPlaceholder: string;
  clientFacturaPlaceholder: string;
  clientDoc: string;
  clientDocBoleta: string;
  clientDocFactura: string;
  itemsTitle: string;
  item: string;
  itemPlaceholder: string;
  qty: string;
  unitPrice: string;
  unitPriceHintAdd: string;
  unitPriceHintExtract: string;
  lineSubtotal: string;
  addItem: string;
  removeItem: string;
  series: string;
  number: string;
  date: string;
  currency: string;
  opGravada: string;
  igv: string;
  igvSplitHint: string;
  total: string;
  watermark: string;
  note: string;
  copy: string;
  copied: string;
  previewEmpty: string;
  configHint: string;
};

type LineItem = {
  id: string;
  description: string;
  qty: string;
  unitPrice: string;
};

type Props = {
  mode: IgvMode;
  rateKey: IgvTasaKey;
  locale: string;
  labels: IgvVoucherLabels;
};

function todayIsoLocal(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatDisplayDate(iso: string, locale: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(y, m - 1, d));
}

function parseMoney(raw: string): number | null {
  const normalized = raw.replace(",", ".").replace(/[^\d.]/g, "");
  if (!normalized) return null;
  const n = Number(normalized);
  if (!Number.isFinite(n) || n < 0) return null;
  return n;
}

function newLine(partial?: Partial<LineItem>): LineItem {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    description: partial?.description ?? "",
    qty: partial?.qty ?? "1",
    unitPrice: partial?.unitPrice ?? "",
  };
}

type ComputedLine = {
  id: string;
  description: string;
  qty: number;
  unit: number;
  /** Importe de línea según el modo (base o con IGV). */
  amount: number;
};

function computeLines(
  items: LineItem[],
): { lines: ComputedLine[]; sum: number } | null {
  const lines: ComputedLine[] = [];
  let sum = 0;
  for (const item of items) {
    const qty = parseMoney(item.qty);
    const unit = parseMoney(item.unitPrice);
    if (qty === null || unit === null || qty <= 0) return null;
    const amount = roundMoney(qty * unit);
    lines.push({
      id: item.id,
      description: item.description.trim() || "—",
      qty,
      unit,
      amount,
    });
    sum = roundMoney(sum + amount);
  }
  if (lines.length === 0) return null;
  return { lines, sum };
}

export function IgvVoucherSim({ mode, rateKey, locale, labels }: Props) {
  const formId = useId();
  const [kind, setKind] = useState<VoucherKind>("boleta");
  const [emitter, setEmitter] = useState("Mi Negocio Demo S.A.C.");
  const [ruc, setRuc] = useState("20123456789");
  const [client, setClient] = useState("");
  const [clientDoc, setClientDoc] = useState("");
  const [items, setItems] = useState<LineItem[]>([
    newLine({
      description: "Producto / servicio de ejemplo",
      qty: "1",
      unitPrice: "100",
    }),
  ]);
  const [series, setSeries] = useState(kind === "boleta" ? "B001" : "F001");
  const [number, setNumber] = useState("00001234");
  const [date, setDate] = useState(todayIsoLocal());
  const [copied, setCopied] = useState(false);

  const computed = computeLines(items);
  const result = computed
    ? calcularIgv(computed.sum, mode, rateKey)
    : null;

  function switchKind(next: VoucherKind) {
    setKind(next);
    setSeries((prev) => {
      if (next === "boleta" && prev.startsWith("F")) return "B001";
      if (next === "factura" && prev.startsWith("B")) return "F001";
      return prev;
    });
  }

  function updateItem(id: string, patch: Partial<LineItem>) {
    setItems((prev) =>
      prev.map((row) => (row.id === id ? { ...row, ...patch } : row)),
    );
  }

  function addItem() {
    setItems((prev) => [
      ...prev,
      newLine({ description: "", qty: "1", unitPrice: "" }),
    ]);
  }

  function removeItem(id: string) {
    setItems((prev) => (prev.length <= 1 ? prev : prev.filter((r) => r.id !== id)));
  }

  async function copyVoucher() {
    if (!result || !computed) return;
    const itemLines = computed.lines.map(
      (line, i) =>
        `${i + 1}. ${line.description} × ${line.qty} @ ${formatPen(line.unit, locale)} = ${formatPen(line.amount, locale)}`,
    );
    const lines = [
      `=== ${labels.watermark} ===`,
      `${kind === "boleta" ? labels.boleta : labels.factura} ${series}-${number}`,
      `${labels.date}: ${formatDisplayDate(date, locale)}`,
      `${labels.emitter}: ${emitter}`,
      `RUC: ${ruc}`,
      `${labels.client}: ${client || "—"}`,
      `${labels.clientDoc}: ${clientDoc || "—"}`,
      "",
      ...itemLines,
      "",
      `${labels.opGravada}: ${formatPen(result.base, locale)}`,
      `${labels.igv} (${formatRatePercent(result.rate)}): ${formatPen(result.igv, locale)}`,
      result.split
        ? `  IGV 16%: ${formatPen(result.split.igvNeto, locale)} | IPM 2%: ${formatPen(result.split.ipm, locale)}`
        : null,
      `${labels.total}: ${formatPen(result.total, locale)}`,
      "",
      labels.note,
    ].filter(Boolean);
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  const rateLabel = rateKey === "general" ? "18%" : "10%";

  return (
    <section className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="font-display text-lg font-semibold text-foreground">
            {labels.sectionTitle}
          </h2>
          <p className="mt-1 text-sm text-muted">{labels.sectionSubtitle}</p>
          <p className="mt-2 text-xs leading-relaxed text-muted">
            {labels.configHint
              .replace("{rate}", rateLabel)
              .replace(
                "{mode}",
                mode === "agregar"
                  ? labels.unitPriceHintAdd
                  : labels.unitPriceHintExtract,
              )}
          </p>
        </div>
        <button
          type="button"
          disabled={!result}
          onClick={copyVoucher}
          className="inline-flex h-9 shrink-0 items-center gap-1.5 self-start rounded-lg border border-border px-3 text-sm font-semibold text-foreground transition-colors hover:border-brand/40 hover:text-brand disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Icon
            icon={copied ? "mdi:check" : "mdi:content-copy"}
            className="h-4 w-4"
          />
          {copied ? labels.copied : labels.copy}
        </button>
      </div>

      <fieldset className="mt-5">
        <legend className="text-sm font-semibold text-foreground">
          {labels.kindLabel}
        </legend>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:max-w-xs">
          {(
            [
              { id: "boleta" as const, label: labels.boleta },
              { id: "factura" as const, label: labels.factura },
            ] as const
          ).map((itemOpt) => (
            <button
              key={itemOpt.id}
              type="button"
              onClick={() => switchKind(itemOpt.id)}
              className={cn(
                "rounded-xl border px-3 py-2.5 text-sm font-semibold transition-colors",
                kind === itemOpt.id
                  ? "border-brand bg-brand text-white"
                  : "border-border bg-background text-foreground hover:border-brand/40",
              )}
            >
              {itemOpt.label}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <Field
          id={`${formId}-emitter`}
          label={labels.emitter}
          value={emitter}
          onChange={setEmitter}
          placeholder={labels.emitterPlaceholder}
        />
        <Field
          id={`${formId}-ruc`}
          label={labels.ruc}
          value={ruc}
          onChange={setRuc}
          placeholder={labels.rucPlaceholder}
          inputMode="numeric"
        />
        <Field
          id={`${formId}-client`}
          label={labels.client}
          value={client}
          onChange={setClient}
          placeholder={
            kind === "boleta"
              ? labels.clientBoletaPlaceholder
              : labels.clientFacturaPlaceholder
          }
        />
        <Field
          id={`${formId}-client-doc`}
          label={
            kind === "boleta" ? labels.clientDocBoleta : labels.clientDocFactura
          }
          value={clientDoc}
          onChange={setClientDoc}
          placeholder={labels.clientDoc}
        />
        <div className="grid grid-cols-2 gap-3 sm:col-span-2 sm:max-w-md">
          <Field
            id={`${formId}-series`}
            label={labels.series}
            value={series}
            onChange={setSeries}
          />
          <Field
            id={`${formId}-number`}
            label={labels.number}
            value={number}
            onChange={setNumber}
            inputMode="numeric"
          />
        </div>
        <label className="block sm:max-w-xs">
          <span className="text-xs font-semibold text-muted">{labels.date}</span>
          <input
            id={`${formId}-date`}
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-brand"
          />
        </label>
      </div>

      {/* Líneas de productos */}
      <div className="mt-6">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-foreground">
            {labels.itemsTitle}
          </h3>
          <button
            type="button"
            onClick={addItem}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-brand/30 bg-brand-soft px-3 text-sm font-semibold text-brand transition-colors hover:border-brand"
          >
            <Icon icon="mdi:plus" className="h-4 w-4" />
            {labels.addItem}
          </button>
        </div>
        <p className="mt-1 text-xs text-muted">
          {mode === "agregar"
            ? labels.unitPriceHintAdd
            : labels.unitPriceHintExtract}{" "}
          · {rateLabel}
        </p>

        <ul className="mt-3 space-y-3">
          {items.map((row, index) => {
            const qtyN = parseMoney(row.qty);
            const unitN = parseMoney(row.unitPrice);
            const sub =
              qtyN !== null && unitN !== null && qtyN > 0
                ? roundMoney(qtyN * unitN)
                : null;

            return (
              <li
                key={row.id}
                className="rounded-xl border border-border bg-background p-3 sm:p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-semibold tracking-wide text-muted uppercase">
                    #{index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeItem(row.id)}
                    disabled={items.length <= 1}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-danger/10 hover:text-danger disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label={labels.removeItem}
                  >
                    <Icon icon="mdi:trash-can-outline" className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-2 grid gap-2 sm:grid-cols-[minmax(0,1.4fr)_5.5rem_7.5rem_auto]">
                  <Field
                    id={`${formId}-desc-${row.id}`}
                    label={labels.item}
                    value={row.description}
                    onChange={(v) => updateItem(row.id, { description: v })}
                    placeholder={labels.itemPlaceholder}
                  />
                  <Field
                    id={`${formId}-qty-${row.id}`}
                    label={labels.qty}
                    value={row.qty}
                    onChange={(v) => updateItem(row.id, { qty: v })}
                    inputMode="decimal"
                  />
                  <Field
                    id={`${formId}-price-${row.id}`}
                    label={labels.unitPrice}
                    value={row.unitPrice}
                    onChange={(v) => updateItem(row.id, { unitPrice: v })}
                    inputMode="decimal"
                    prefix="S/"
                  />
                  <div className="flex flex-col justify-end pb-0.5 sm:items-end">
                    <span className="text-xs font-semibold text-muted">
                      {labels.lineSubtotal}
                    </span>
                    <span className="mt-1 text-sm font-semibold tabular-nums text-foreground">
                      {sub !== null ? formatPen(sub, locale) : "—"}
                    </span>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Vista previa */}
      <div className="relative mt-6 overflow-hidden rounded-xl border border-border bg-[#faf9f6] text-[#1a1a1a] shadow-[0_1px_0_rgba(15,31,28,0.04)]">
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
          aria-hidden
        >
          <span className="rotate-[-18deg] select-none font-display text-4xl font-semibold tracking-[0.2em] text-brand/10 uppercase sm:text-5xl">
            {labels.watermark}
          </span>
        </div>

        <div className="relative z-10 p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-black/10 pb-4">
            <div>
              <p className="font-display text-lg font-semibold leading-tight">
                {emitter || "—"}
              </p>
              <p className="mt-1 text-xs text-black/60">
                RUC {ruc || "—"} · {labels.currency} PEN
              </p>
            </div>
            <div className="text-right">
              <p className="text-[11px] font-semibold tracking-[0.14em] text-brand uppercase">
                {kind === "boleta" ? labels.boleta : labels.factura}
              </p>
              <p className="mt-1 font-mono text-sm font-semibold">
                {series}-{number}
              </p>
              <p className="mt-0.5 text-xs text-black/60">
                {labels.date}: {formatDisplayDate(date, locale)}
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-1 text-xs sm:grid-cols-2">
            <p>
              <span className="text-black/55">{labels.client}: </span>
              <span className="font-medium">{client || "—"}</span>
            </p>
            <p>
              <span className="text-black/55">
                {kind === "boleta"
                  ? labels.clientDocBoleta
                  : labels.clientDocFactura}
                :{" "}
              </span>
              <span className="font-medium">{clientDoc || "—"}</span>
            </p>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-black/10 text-[10px] tracking-wide text-black/50 uppercase">
                  <th className="py-2 pr-2 font-semibold">{labels.item}</th>
                  <th className="py-2 pr-2 font-semibold text-right">
                    {labels.qty}
                  </th>
                  <th className="py-2 pr-2 font-semibold text-right">
                    {labels.unitPrice}
                  </th>
                  <th className="py-2 font-semibold text-right">
                    {labels.lineSubtotal}
                  </th>
                </tr>
              </thead>
              <tbody>
                {computed ? (
                  computed.lines.map((line) => (
                    <tr key={line.id} className="border-b border-black/5">
                      <td className="py-2.5 pr-2">{line.description}</td>
                      <td className="py-2.5 pr-2 text-right tabular-nums">
                        {line.qty}
                      </td>
                      <td className="py-2.5 pr-2 text-right tabular-nums">
                        {formatPen(line.unit, locale)}
                      </td>
                      <td className="py-2.5 text-right tabular-nums">
                        {formatPen(line.amount, locale)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-3 text-black/45">
                      {labels.previewEmpty}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <dl className="mt-4 ml-auto w-full max-w-xs space-y-1.5 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-black/55">{labels.opGravada}</dt>
              <dd className="tabular-nums font-medium">
                {result ? formatPen(result.base, locale) : "—"}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-black/55">
                {labels.igv}{" "}
                {result ? `(${formatRatePercent(result.rate)})` : ""}
              </dt>
              <dd className="tabular-nums font-medium">
                {result ? formatPen(result.igv, locale) : "—"}
              </dd>
            </div>
            {result?.split ? (
              <p className="text-[10px] leading-relaxed text-black/45">
                {labels.igvSplitHint}: IGV{" "}
                {formatPen(result.split.igvNeto, locale)} + IPM{" "}
                {formatPen(result.split.ipm, locale)}
              </p>
            ) : null}
            <div className="flex justify-between gap-4 border-t border-black/10 pt-2">
              <dt className="font-semibold">{labels.total}</dt>
              <dd className="font-display text-lg font-semibold tabular-nums text-brand">
                {result ? formatPen(result.total, locale) : "—"}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <p className="mt-3 text-xs leading-relaxed text-muted">{labels.note}</p>
    </section>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  placeholder,
  inputMode,
  className,
  prefix,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  inputMode?: HTMLAttributes<HTMLInputElement>["inputMode"];
  className?: string;
  prefix?: string;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="text-xs font-semibold text-muted">{label}</span>
      <div className="relative mt-1">
        {prefix ? (
          <span className="pointer-events-none absolute inset-y-0 left-2.5 flex items-center text-xs text-muted">
            {prefix}
          </span>
        ) : null}
        <input
          id={id}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          inputMode={inputMode}
          className={cn(
            "h-10 w-full rounded-lg border border-border bg-background text-sm text-foreground outline-none focus:border-brand",
            prefix ? "pl-8 pr-3" : "px-3",
          )}
          autoComplete="off"
        />
      </div>
    </label>
  );
}
