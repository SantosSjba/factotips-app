import {
  ASIGNACION_FAMILIAR_SOLES,
  CTS_PERIODOS,
  INDICADORES_ANIO,
  RMV_SOLES,
  type CtsPeriodo,
} from "./indicadores";
import { roundMoney } from "./igv";

export type CtsInput = {
  /** Sueldo bruto mensual (remuneración básica). */
  sueldoBruto: number;
  /** Incluir asignación familiar (10% RMV). */
  asignacionFamiliar: boolean;
  /**
   * Última gratificación percibida (sin bonificación extraordinaria 9%).
   * Mayo → grati diciembre · Noviembre → grati julio.
   */
  ultimaGratificacion: number;
  /** Otros conceptos computables (comisiones fijas, etc.). */
  otrosComputables: number;
  periodo: CtsPeriodo;
  /** Meses completos trabajados en el semestre (0–6). */
  meses: number;
  /** Días adicionales (0–29). */
  dias: number;
};

export type CtsResult = {
  anio: number;
  periodo: CtsPeriodo;
  rmv: number;
  sueldoBruto: number;
  asignacionFamiliar: number;
  sextaGratificacion: number;
  otrosComputables: number;
  remuneracionComputable: number;
  meses: number;
  dias: number;
  ctsPorMeses: number;
  ctsPorDias: number;
  ctsTotal: number;
  depositoDia: number;
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
 * CTS semestral (sector privado, jornada ≥ 4 h/día).
 * RC = sueldo + AF + 1/6 grati + otros.
 * CTS = (RC/12)×meses + (RC/360)×días.
 */
export function calcularCts(input: CtsInput): CtsResult {
  const sueldo = roundMoney(Math.max(0, input.sueldoBruto));
  const asignacion = input.asignacionFamiliar
    ? ASIGNACION_FAMILIAR_SOLES
    : 0;
  const grati = roundMoney(Math.max(0, input.ultimaGratificacion));
  const sexta = roundMoney(grati / 6);
  const otros = roundMoney(Math.max(0, input.otrosComputables));
  const rc = roundMoney(sueldo + asignacion + sexta + otros);

  const meses = clampMeses(input.meses);
  const dias = clampDias(input.dias);
  const ctsPorMeses = roundMoney((rc / 12) * meses);
  const ctsPorDias = roundMoney((rc / 360) * dias);
  const ctsTotal = roundMoney(ctsPorMeses + ctsPorDias);
  const info = CTS_PERIODOS[input.periodo];

  return {
    anio: INDICADORES_ANIO,
    periodo: input.periodo,
    rmv: RMV_SOLES,
    sueldoBruto: sueldo,
    asignacionFamiliar: asignacion,
    sextaGratificacion: sexta,
    otrosComputables: otros,
    remuneracionComputable: rc,
    meses,
    dias,
    ctsPorMeses,
    ctsPorDias,
    ctsTotal,
    depositoDia: info.depositoDia,
  };
}

/** Si no ingresan grati, asume grati ≈ sueldo + AF (sin bonif. 9%). */
export function gratiSugerida(
  sueldoBruto: number,
  asignacionFamiliar: boolean,
): number {
  const af = asignacionFamiliar ? ASIGNACION_FAMILIAR_SOLES : 0;
  return roundMoney(Math.max(0, sueldoBruto) + af);
}

export {
  ASIGNACION_FAMILIAR_SOLES,
  CTS_PERIODOS,
  RMV_SOLES,
};

export type { CtsPeriodo };
