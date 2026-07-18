import {
  HONORARIOS_RETENCION_TASA,
  HONORARIOS_SUSPENSION,
  HONORARIOS_UMBRAL_RETENCION,
  INDICADORES_ANIO,
  UIT_NORMA,
  UIT_SOLES,
  type HonorariosPerfil,
} from "./indicadores";
import { roundMoney } from "./igv";

export type HonorariosMode = "bruto-a-neto" | "neto-a-bruto";

export type HonorariosInput = {
  /** Monto del recibo (bruto) o neto deseado, según mode. */
  monto: number;
  mode: HonorariosMode;
  /**
   * Si true, asume que hay constancia de suspensión (Form. 1609):
   * no se calcula retención aunque el monto > umbral.
   */
  conSuspension: boolean;
  /** Perfil para topes de suspensión (informativo). */
  perfil: HonorariosPerfil;
  /** Ingresos anuales proyectados de 4ta (y 5ta si aplica), informativo. */
  ingresosAnualesProyectados: number;
};

export type HonorariosResult = {
  anio: number;
  uit: number;
  normaUit: string;
  mode: HonorariosMode;
  perfil: HonorariosPerfil;
  tasaRetencion: number;
  umbralRetencion: number;
  bruto: number;
  retencion: number;
  neto: number;
  /** Si el recibo supera el umbral S/ 1,500. */
  superaUmbral: boolean;
  /** Si se aplicó retención 8% en este cálculo. */
  aplicaRetencion: boolean;
  suspension: {
    topeAnual: number;
    topeMensual: number;
    proyectado: number;
    dentroTopeAnual: boolean;
    usoTopePct: number;
    restanteAnual: number;
  };
};

export function calcularHonorarios(input: HonorariosInput): HonorariosResult {
  const monto = roundMoney(Math.max(0, input.monto));
  const tasas = HONORARIOS_SUSPENSION[input.perfil];
  const proyectado = roundMoney(Math.max(0, input.ingresosAnualesProyectados));

  let bruto: number;
  let retencion: number;
  let neto: number;
  let aplicaRetencion: boolean;
  let superaUmbral: boolean;

  if (input.mode === "bruto-a-neto") {
    bruto = monto;
    superaUmbral = bruto > HONORARIOS_UMBRAL_RETENCION;
    aplicaRetencion =
      !input.conSuspension && superaUmbral && bruto > 0;
    retencion = aplicaRetencion
      ? roundMoney(bruto * HONORARIOS_RETENCION_TASA)
      : 0;
    neto = roundMoney(bruto - retencion);
  } else {
    neto = monto;
    if (input.conSuspension) {
      bruto = neto;
      retencion = 0;
      aplicaRetencion = false;
      superaUmbral = bruto > HONORARIOS_UMBRAL_RETENCION;
    } else {
      // Si el neto implica un bruto ≤ umbral, no hay retención.
      const brutoSinRetencion = neto;
      if (brutoSinRetencion <= HONORARIOS_UMBRAL_RETENCION) {
        bruto = brutoSinRetencion;
        retencion = 0;
        aplicaRetencion = false;
        superaUmbral = false;
      } else {
        bruto = roundMoney(neto / (1 - HONORARIOS_RETENCION_TASA));
        retencion = roundMoney(bruto - neto);
        aplicaRetencion = true;
        superaUmbral = true;
        // Si al redondear el bruto cae ≤ umbral, recalcular sin retención.
        if (bruto <= HONORARIOS_UMBRAL_RETENCION) {
          bruto = neto;
          retencion = 0;
          aplicaRetencion = false;
          superaUmbral = false;
        }
      }
    }
  }

  const restanteAnual = roundMoney(Math.max(0, tasas.anual - proyectado));
  const usoTopePct =
    tasas.anual > 0
      ? Math.min(100, Math.round((proyectado / tasas.anual) * 100))
      : 0;

  return {
    anio: INDICADORES_ANIO,
    uit: UIT_SOLES,
    normaUit: UIT_NORMA,
    mode: input.mode,
    perfil: input.perfil,
    tasaRetencion: HONORARIOS_RETENCION_TASA,
    umbralRetencion: HONORARIOS_UMBRAL_RETENCION,
    bruto,
    retencion,
    neto,
    superaUmbral,
    aplicaRetencion,
    suspension: {
      topeAnual: tasas.anual,
      topeMensual: tasas.mensual,
      proyectado,
      dentroTopeAnual: proyectado <= tasas.anual,
      usoTopePct,
      restanteAnual,
    },
  };
}

export function formatPctHonorarios(rate: number): string {
  return `${Math.round(rate * 100)}%`;
}

export {
  HONORARIOS_RETENCION_TASA,
  HONORARIOS_SUSPENSION,
  HONORARIOS_UMBRAL_RETENCION,
  UIT_SOLES,
};

export type { HonorariosPerfil };
