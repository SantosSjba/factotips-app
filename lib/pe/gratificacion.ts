import {
  ASIGNACION_FAMILIAR_SOLES,
  GRATIFICACION_BONIF,
  GRATIFICACION_PAGO_DIA,
  INDICADORES_ANIO,
  RMV_SOLES,
  type GratificacionPeriodo,
  type GratificacionSeguro,
} from "./indicadores";
import { roundMoney } from "./igv";

export type GratificacionInput = {
  sueldoBruto: number;
  asignacionFamiliar: boolean;
  /** Otros conceptos computables (comisiones, etc.). */
  otrosComputables: number;
  periodo: GratificacionPeriodo;
  /** Meses calendario completos en el semestre (0–6). */
  meses: number;
  /** Días adicionales (0–29). */
  dias: number;
  seguro: GratificacionSeguro;
};

export type GratificacionResult = {
  anio: number;
  periodo: GratificacionPeriodo;
  rmv: number;
  sueldoBruto: number;
  asignacionFamiliar: number;
  otrosComputables: number;
  remuneracionComputable: number;
  meses: number;
  dias: number;
  factor: number;
  gratificacion: number;
  seguro: GratificacionSeguro;
  tasaBonificacion: number;
  bonificacion: number;
  total: number;
  pagoDia: number;
};

function clampMeses(n: number): number {
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.min(6, Math.floor(n));
}

function clampDias(n: number): number {
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.min(29, Math.floor(n));
}

/**
 * Gratificación Ley 27735 + bonificación extraordinaria (Essalud 9% / EPS 6.75%).
 * Proporcional: RC × (meses/6 + días/180).
 */
export function calcularGratificacion(
  input: GratificacionInput,
): GratificacionResult {
  const sueldo = roundMoney(Math.max(0, input.sueldoBruto));
  const asignacion = input.asignacionFamiliar
    ? ASIGNACION_FAMILIAR_SOLES
    : 0;
  const otros = roundMoney(Math.max(0, input.otrosComputables));
  const rc = roundMoney(sueldo + asignacion + otros);

  const meses = clampMeses(input.meses);
  const dias = clampDias(input.dias);
  const factor = meses / 6 + dias / 180;
  const gratificacion = roundMoney(rc * Math.min(1, factor));
  const tasaBonificacion = GRATIFICACION_BONIF[input.seguro];
  const bonificacion = roundMoney(gratificacion * tasaBonificacion);
  const total = roundMoney(gratificacion + bonificacion);

  return {
    anio: INDICADORES_ANIO,
    periodo: input.periodo,
    rmv: RMV_SOLES,
    sueldoBruto: sueldo,
    asignacionFamiliar: asignacion,
    otrosComputables: otros,
    remuneracionComputable: rc,
    meses,
    dias,
    factor: Math.min(1, factor),
    gratificacion,
    seguro: input.seguro,
    tasaBonificacion,
    bonificacion,
    total,
    pagoDia: GRATIFICACION_PAGO_DIA,
  };
}

export function formatPctBonif(rate: number): string {
  const pct = Math.round(rate * 10_000) / 100;
  return `${pct % 1 === 0 ? pct.toFixed(0) : pct.toFixed(2)}%`;
}

export {
  ASIGNACION_FAMILIAR_SOLES,
  GRATIFICACION_BONIF,
  RMV_SOLES,
};

export type { GratificacionPeriodo, GratificacionSeguro };
