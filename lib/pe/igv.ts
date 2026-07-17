import {
  IGV_NETO_TASA,
  IGV_TASAS,
  IPM_TASA,
  type IgvTasaKey,
} from "./indicadores";

export type IgvMode = "agregar" | "extraer";

export type IgvTaxSplit = {
  /** Parte IGV 16% (solo tasa general). */
  igvNeto: number;
  /** Parte IPM 2% (solo tasa general). */
  ipm: number;
};

export type IgvBreakdown = {
  base: number;
  /** Impuesto total (18% o 10%). */
  igv: number;
  total: number;
  rate: number;
  rateKey: IgvTasaKey;
  mode: IgvMode;
  /** Desglose IGV 16% + IPM 2% cuando aplica tasa general. */
  split: IgvTaxSplit | null;
};

/** Redondeo monetario a 2 decimales (half-up). */
export function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function resolveIgvRate(key: IgvTasaKey): number {
  return IGV_TASAS[key];
}

function buildSplit(base: number, rateKey: IgvTasaKey): IgvTaxSplit | null {
  if (rateKey !== "general") return null;
  const igvNeto = roundMoney(base * IGV_NETO_TASA);
  const ipm = roundMoney(base * IPM_TASA);
  return { igvNeto, ipm };
}

/** Precio sin IGV → base + IGV + total. */
export function agregarIgv(baseInput: number, rateKey: IgvTasaKey): IgvBreakdown {
  const rate = resolveIgvRate(rateKey);
  const base = roundMoney(baseInput);
  const igv = roundMoney(base * rate);
  const total = roundMoney(base + igv);
  return {
    base,
    igv,
    total,
    rate,
    rateKey,
    mode: "agregar",
    split: buildSplit(base, rateKey),
  };
}

/** Precio con IGV → base imponible + IGV. */
export function extraerIgv(totalInput: number, rateKey: IgvTasaKey): IgvBreakdown {
  const rate = resolveIgvRate(rateKey);
  const total = roundMoney(totalInput);
  const base = roundMoney(total / (1 + rate));
  const igv = roundMoney(total - base);
  return {
    base,
    igv,
    total,
    rate,
    rateKey,
    mode: "extraer",
    split: buildSplit(base, rateKey),
  };
}

export function calcularIgv(
  amount: number,
  mode: IgvMode,
  rateKey: IgvTasaKey,
): IgvBreakdown {
  return mode === "agregar"
    ? agregarIgv(amount, rateKey)
    : extraerIgv(amount, rateKey);
}

/** Compara el mismo monto en ambas tasas (misma base de entrada según modo). */
export function compararTasas(
  amount: number,
  mode: IgvMode,
): { general: IgvBreakdown; mype: IgvBreakdown } {
  return {
    general: calcularIgv(amount, mode, "general"),
    mype: calcularIgv(amount, mode, "mype"),
  };
}

export function formatPen(value: number, locale = "es-PE"): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "PEN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatRatePercent(rate: number): string {
  return `${roundMoney(rate * 100)}%`;
}

export function shareOfTotal(part: number, total: number): number {
  if (total <= 0) return 0;
  return roundMoney((part / total) * 100);
}

export function buildIgvSummary(result: IgvBreakdown, locale = "es-PE"): string {
  const pct = formatRatePercent(result.rate);
  const lines = [
    result.mode === "agregar" ? "IGV agregado" : "IGV extraído",
    `Tasa: ${pct}`,
    `Base: ${formatPen(result.base, locale)}`,
    `IGV (+IPM si 18%): ${formatPen(result.igv, locale)}`,
  ];
  if (result.split) {
    lines.push(
      `  · IGV 16%: ${formatPen(result.split.igvNeto, locale)}`,
      `  · IPM 2%: ${formatPen(result.split.ipm, locale)}`,
    );
  }
  lines.push(`Total: ${formatPen(result.total, locale)}`);
  return lines.join("\n");
}

/** Fórmula legible según modo. */
export function formulaForMode(mode: IgvMode, ratePercent: number): string {
  if (mode === "agregar") {
    return `Total = Base × (1 + ${ratePercent}%)`;
  }
  return `Base = Total ÷ (1 + ${ratePercent}%)`;
}
