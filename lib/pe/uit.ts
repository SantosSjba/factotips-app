import {
  INDICADORES_ANIO,
  UIT_NORMA,
  UIT_QUICK,
  UIT_SOLES,
} from "./indicadores";
import { roundMoney } from "./igv";

export type UitMode = "uit-a-soles" | "soles-a-uit";

export type UitConversion = {
  mode: UitMode;
  uit: number;
  soles: number;
  uitValue: number;
  year: number;
  norma: string;
};

/** UIT con hasta 4 decimales (fracciones comunes). */
export function roundUit(value: number): number {
  return Math.round((value + Number.EPSILON) * 10000) / 10000;
}

export function uitToSoles(uitInput: number): number {
  return roundMoney(uitInput * UIT_SOLES);
}

export function solesToUit(solesInput: number): number {
  return roundUit(solesInput / UIT_SOLES);
}

export function convertUit(amount: number, mode: UitMode): UitConversion {
  if (mode === "uit-a-soles") {
    const uit = roundUit(amount);
    return {
      mode,
      uit,
      soles: uitToSoles(uit),
      uitValue: UIT_SOLES,
      year: INDICADORES_ANIO,
      norma: UIT_NORMA,
    };
  }
  const soles = roundMoney(amount);
  return {
    mode,
    soles,
    uit: solesToUit(soles),
    uitValue: UIT_SOLES,
    year: INDICADORES_ANIO,
    norma: UIT_NORMA,
  };
}

export function formatUit(value: number, locale = "es-PE"): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 4,
  }).format(value);
}

export function buildUitSummary(
  result: UitConversion,
  locale = "es-PE",
): string {
  const solesFmt = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "PEN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(result.soles);
  return [
    `UIT ${result.year}: S/ ${result.uitValue.toLocaleString(locale)} (${result.norma})`,
    `${formatUit(result.uit, locale)} UIT = ${solesFmt}`,
  ].join("\n");
}

export function quickUitTable(): { uit: number; soles: number }[] {
  return UIT_QUICK.map((uit) => ({
    uit,
    soles: uitToSoles(uit),
  }));
}

export { UIT_SOLES, UIT_NORMA, UIT_QUICK, INDICADORES_ANIO };
