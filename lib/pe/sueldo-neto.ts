import {
  AFP_COMISIONES,
  AFP_COMISIONES_PERIODO,
  AFP_FONDO_TASA,
  AFP_SEGURO_TASA,
  AFP_TOPE_ASEGURABLE,
  ASIGNACION_FAMILIAR_SOLES,
  ESSALUD_TASA_EMPLEADOR,
  INDICADORES_ANIO,
  ONP_TASA,
  QUINTA_TRAMOS_UIT,
  RENTA_DEDUCCION_UIT,
  RENTA_GASTOS_MAX_UIT,
  RMV_SOLES,
  UIT_NORMA,
  UIT_SOLES,
  afpComisionMensualBoleta,
  type AfpComisionTipo,
} from "./indicadores";
import { roundMoney } from "./igv";

export type PensionSystem = "afp" | "onp";

export type SueldoNetoInput = {
  brutoMensual: number;
  sistema: PensionSystem;
  /** Comisión AFP sobre flujo (si sistema = afp y tipo = flujo). */
  afpComisionFlujo: number;
  /**
   * Esquema de comisión AFP.
   * `saldo`: no descuenta comisión de la boleta (solo fondo + seguro).
   */
  afpComisionTipo?: AfpComisionTipo;
  /** Incluye asignación familiar (10% RMV). */
  asignacionFamiliar: boolean;
  /**
   * Proyectar año con 14 pagos (12 sueldos + 2 gratificaciones).
   * Si true, también suma la bonificación extraordinaria 9% sobre gratificaciones (Ley 29351).
   * Si false, solo 12 sueldos.
   */
  incluirGratificaciones: boolean;
  /** Otros ingresos anuales gravados (bonos, etc.). */
  otrosIngresosAnuales: number;
  /**
   * Gastos deducibles adicionales (Ley 30734), en soles, tope 3 UIT.
   * Orientativo: en la práctica se declara ante SUNAT.
   */
  gastosDeducibles: number;
};

export type QuintaTramoAplicado = {
  desde: number;
  hasta: number;
  base: number;
  tasa: number;
  impuesto: number;
};

export type SueldoNetoResult = {
  anio: number;
  uit: number;
  normaUit: string;
  rmv: number;
  brutoMensual: number;
  asignacionFamiliar: number;
  remuneracionMensual: number;
  baseAporte: number;
  pension: {
    sistema: PensionSystem;
    fondo: number;
    seguro: number;
    comision: number;
    total: number;
    tasaEfectiva: number;
  };
  quinta: {
    rentaBrutaAnual: number;
    deduccion7Uit: number;
    gastosDeducibles: number;
    rentaNeta: number;
    impuestoAnual: number;
    retencionMensualEstimada: number;
    tramos: QuintaTramoAplicado[];
    /** 12 o 14 sueldos proyectados. */
    pagosProyectados: number;
    /** Bonificación extraordinaria 9% s/ gratificaciones (si aplica). */
    bonificacionExtraordinaria: number;
  };
  descuentosMensuales: number;
  netoMensual: number;
  /** Costo estimado del empleador (Essalud 9%), informativo. */
  essaludEmpleador: number;
  costoEmpleadorMensual: number;
};

function clampGastos(gastos: number): number {
  const max = RENTA_GASTOS_MAX_UIT * UIT_SOLES;
  return roundMoney(Math.min(Math.max(0, gastos), max));
}

/** Impuesto progresivo sobre renta neta (después de 7 UIT y gastos). */
export function impuestoQuintaSobreRentaNeta(rentaNeta: number): {
  impuesto: number;
  tramos: QuintaTramoAplicado[];
} {
  let restante = Math.max(0, roundMoney(rentaNeta));
  let cursor = 0;
  const tramos: QuintaTramoAplicado[] = [];
  let impuesto = 0;

  for (const tramo of QUINTA_TRAMOS_UIT) {
    const limiteSoles =
      tramo.hastaUit === Infinity
        ? Infinity
        : roundMoney(tramo.hastaUit * UIT_SOLES);
    const ancho =
      limiteSoles === Infinity ? restante : Math.max(0, limiteSoles - cursor);
    const base = roundMoney(Math.min(restante, ancho));
    if (base > 0) {
      const parte = roundMoney(base * tramo.tasa);
      tramos.push({
        desde: cursor,
        hasta: cursor + base,
        base,
        tasa: tramo.tasa,
        impuesto: parte,
      });
      impuesto = roundMoney(impuesto + parte);
      restante = roundMoney(restante - base);
    }
    cursor = limiteSoles === Infinity ? cursor + base : limiteSoles;
    if (restante <= 0) break;
  }

  return { impuesto, tramos };
}

export function calcularSueldoNeto(input: SueldoNetoInput): SueldoNetoResult {
  const bruto = roundMoney(Math.max(0, input.brutoMensual));
  const asignacion = input.asignacionFamiliar
    ? ASIGNACION_FAMILIAR_SOLES
    : 0;
  const remuneracionMensual = roundMoney(bruto + asignacion);

  const baseAporte = roundMoney(
    input.sistema === "afp"
      ? Math.min(remuneracionMensual, AFP_TOPE_ASEGURABLE)
      : remuneracionMensual,
  );

  let fondo = 0;
  let seguro = 0;
  let comision = 0;
  if (input.sistema === "onp") {
    fondo = roundMoney(baseAporte * ONP_TASA);
  } else {
    const tipo: AfpComisionTipo = input.afpComisionTipo ?? "flujo";
    const com =
      tipo === "saldo" ? 0 : Math.max(0, input.afpComisionFlujo);
    fondo = roundMoney(baseAporte * AFP_FONDO_TASA);
    seguro = roundMoney(baseAporte * AFP_SEGURO_TASA);
    comision = roundMoney(baseAporte * com);
  }
  const pensionTotal = roundMoney(fondo + seguro + comision);
  const tasaEfectiva =
    baseAporte > 0 ? pensionTotal / baseAporte : input.sistema === "onp" ? ONP_TASA : 0;

  const meses = input.incluirGratificaciones ? 14 : 12;
  const bonificacionExtraordinaria = input.incluirGratificaciones
    ? roundMoney(remuneracionMensual * 2 * ESSALUD_TASA_EMPLEADOR)
    : 0;
  const rentaBrutaAnual = roundMoney(
    remuneracionMensual * meses +
      bonificacionExtraordinaria +
      Math.max(0, input.otrosIngresosAnuales),
  );
  const deduccion7Uit = roundMoney(RENTA_DEDUCCION_UIT * UIT_SOLES);
  const gastosDeducibles = clampGastos(input.gastosDeducibles);
  const rentaNeta = roundMoney(
    Math.max(0, rentaBrutaAnual - deduccion7Uit - gastosDeducibles),
  );
  const { impuesto: impuestoAnual, tramos } =
    impuestoQuintaSobreRentaNeta(rentaNeta);
  const retencionMensualEstimada = roundMoney(impuestoAnual / 12);

  const descuentosMensuales = roundMoney(
    pensionTotal + retencionMensualEstimada,
  );
  const netoMensual = roundMoney(
    Math.max(0, remuneracionMensual - descuentosMensuales),
  );

  const essaludEmpleador = roundMoney(
    remuneracionMensual * ESSALUD_TASA_EMPLEADOR,
  );
  const costoEmpleadorMensual = roundMoney(
    remuneracionMensual + essaludEmpleador,
  );

  return {
    anio: INDICADORES_ANIO,
    uit: UIT_SOLES,
    normaUit: UIT_NORMA,
    rmv: RMV_SOLES,
    brutoMensual: bruto,
    asignacionFamiliar: asignacion,
    remuneracionMensual,
    baseAporte,
    pension: {
      sistema: input.sistema,
      fondo,
      seguro,
      comision,
      total: pensionTotal,
      tasaEfectiva,
    },
    quinta: {
      rentaBrutaAnual,
      deduccion7Uit,
      gastosDeducibles,
      rentaNeta,
      impuestoAnual,
      retencionMensualEstimada,
      tramos,
      pagosProyectados: meses,
      bonificacionExtraordinaria,
    },
    descuentosMensuales,
    netoMensual,
    essaludEmpleador,
    costoEmpleadorMensual,
  };
}

export function formatPct(rate: number): string {
  return `${roundMoney(rate * 100)}%`;
}

/** Tasas AFP SBS (ej. 1.47%). */
export function formatPctAfp(rate: number): string {
  return `${(Math.round(rate * 10_000) / 100).toFixed(2)}%`;
}

export function defaultAfpComision(): number {
  return (
    AFP_COMISIONES.find((a) => a.id === "habitat")?.comisionFlujo ?? 0.0147
  );
}

export {
  AFP_COMISIONES,
  AFP_COMISIONES_PERIODO,
  ASIGNACION_FAMILIAR_SOLES,
  AFP_TOPE_ASEGURABLE,
  RENTA_GASTOS_MAX_UIT,
  UIT_SOLES,
  RMV_SOLES,
  afpComisionMensualBoleta,
};

export type { AfpComisionTipo };
