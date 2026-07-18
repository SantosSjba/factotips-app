/** Indicadores tributarios / laborales Perú — fuente única para calculadoras. */

export const INDICADORES_ANIO = 2026;

/** UIT 2026 — D.S. 301-2025-EF */
export const UIT_SOLES = 5500;
export const UIT_NORMA = "D.S. 301-2025-EF";

/** Fracciones UIT frecuentes (multas, rentas, trámites). */
export const UIT_QUICK = [0.5, 1, 2, 3, 5, 7, 10, 14, 15] as const;

/** RMV vigente (verificar MEF/MTPE al actualizar). */
export const RMV_SOLES = 1130;

/** Asignación familiar = 10% RMV (hijo menor / estudiante hasta 24). */
export const ASIGNACION_FAMILIAR_SOLES = Math.round(RMV_SOLES * 0.1);

/**
 * En la práctica al consumidor el “IGV 18%” = IGV 16% + IPM 2%.
 * SUNAT/normativa: IGV (Impuesto General a las Ventas) + IPM (Impuesto de Promoción Municipal).
 */
export const IGV_NETO_TASA = 0.16;
export const IPM_TASA = 0.02;

/** Tasa combinada general (IGV + IPM). */
export const IGV_TASA_GENERAL = IGV_NETO_TASA + IPM_TASA;

/**
 * Tasa referencial 10% usada en algunos regímenes MYPE / casos especiales.
 * No sustituye calificación SUNAT: solo calculadora orientativa.
 */
export const IGV_TASA_MYPE = 0.1;

export const IGV_TASAS = {
  general: IGV_TASA_GENERAL,
  mype: IGV_TASA_MYPE,
} as const;

export type IgvTasaKey = keyof typeof IGV_TASAS;

/** Montos rápidos para presets en la UI. */
export const IGV_PRESETS = [50, 100, 200, 500, 1000, 5000] as const;

/** Deducción fija renta 5ta / 4ta (Art. 46 LIR) — 7 UIT. */
export const RENTA_DEDUCCION_UIT = 7;

/** Deducción adicional opcional por gastos (Ley 30734) — hasta 3 UIT. */
export const RENTA_GASTOS_MAX_UIT = 3;

/**
 * Retención a cuenta IR 4ta en recibo por honorarios (Art. 74 LIR) — 8%.
 * El pagador retiene si el monto del RHE supera el umbral.
 */
export const HONORARIOS_RETENCION_TASA = 0.08;

/**
 * Umbral por recibo: por debajo o igual, en la práctica no hay retención del 8%
 * (referencia operativa habitual Art. 74 / usos SUNAT).
 */
export const HONORARIOS_UMBRAL_RETENCION = 1500;

/**
 * Topes suspensión de retenciones / pagos a cuenta 4ta — SUNAT 2026
 * (Formulario virtual 1609). Orientativo; confirma en SUNAT.
 */
export const HONORARIOS_SUSPENSION = {
  /** Ejercicio de profesión, arte u oficio (inciso a). */
  profesional: { anual: 48_125, mensual: 4_010 },
  /** Director, síndico, mandatario y similares (inciso b). */
  director: { anual: 38_500, mensual: 3_208 },
} as const;

export type HonorariosPerfil = keyof typeof HONORARIOS_SUSPENSION;

/** Depósitos CTS — plazo habitual día 15 (adelantar si no laborable). */
export const CTS_DEPOSITO_DIA = 15;

export type CtsPeriodo = "mayo" | "noviembre";

export type CtsPeriodoInfo = {
  id: CtsPeriodo;
  /** Meses del semestre (1–6). */
  mesesMax: number;
  /** Día límite de depósito (mes del id). */
  depositoDia: number;
};

/**
 * Semestres CTS (D. Leg. 650 / D.S. 001-97-TR).
 * Mayo: nov–abr · Noviembre: may–oct.
 */
export const CTS_PERIODOS: Record<CtsPeriodo, CtsPeriodoInfo> = {
  mayo: { id: "mayo", mesesMax: 6, depositoDia: CTS_DEPOSITO_DIA },
  noviembre: { id: "noviembre", mesesMax: 6, depositoDia: CTS_DEPOSITO_DIA },
};

/**
 * Tramos progresivos sobre renta neta (Art. 53 LIR), en UIT.
 * Cada tramo paga su tasa marginal.
 */
export const QUINTA_TRAMOS_UIT = [
  { hastaUit: 5, tasa: 0.08 },
  { hastaUit: 20, tasa: 0.14 },
  { hastaUit: 35, tasa: 0.17 },
  { hastaUit: 45, tasa: 0.2 },
  { hastaUit: Infinity, tasa: 0.3 },
] as const;

/** ONP — aporte obligatorio del trabajador. */
export const ONP_TASA = 0.13;

/** AFP — aporte al fondo (obligatorio). */
export const AFP_FONDO_TASA = 0.1;

/** AFP — prima de seguro (SBS; igual en todas las AFP). */
export const AFP_SEGURO_TASA = 0.0137;

/**
 * Remuneración máxima asegurable AFP (SBS, mes de devengue AFP_COMISIONES_PERIODO).
 * Sobre el exceso no se calculan aportes AFP ni prima de seguro.
 */
export const AFP_TOPE_ASEGURABLE = 12_672.65;

/** Essalud lo paga el empleador (9%) — no descuenta al trabajador. */
export const ESSALUD_TASA_EMPLEADOR = 0.09;

/** Mes de referencia SBS para comisiones / tope AFP. */
export const AFP_COMISIONES_PERIODO = "2026-07";

export type AfpComisionTipo = "flujo" | "saldo";

export type AfpComisionPreset = {
  id: string;
  nombre: string;
  /** Comisión sobre flujo (% remuneración bruta mensual). */
  comisionFlujo: number;
  /**
   * Comisión anual sobre saldo (% del fondo).
   * Desde feb-2023 el esquema “mixto” solo cobra esto (0% sobre el sueldo).
   */
  comisionSaldoAnual: number;
};

/**
 * Comisiones AFP — fuente SBS (empleadores / comisiones SPP).
 * Verificar en https://www.sbs.gob.pe al actualizar el periodo.
 */
export const AFP_COMISIONES: AfpComisionPreset[] = [
  {
    id: "habitat",
    nombre: "Habitat",
    comisionFlujo: 0.0147,
    comisionSaldoAnual: 0.0125,
  },
  {
    id: "integra",
    nombre: "Integra",
    comisionFlujo: 0.0155,
    comisionSaldoAnual: 0.0078,
  },
  {
    id: "prima",
    nombre: "Prima",
    comisionFlujo: 0.016,
    comisionSaldoAnual: 0.0125,
  },
  {
    id: "profuturo",
    nombre: "Profuturo",
    comisionFlujo: 0.0169,
    comisionSaldoAnual: 0.0068,
  },
];

/** Comisión mensual que sí se descuenta de la boleta. */
export function afpComisionMensualBoleta(
  afp: AfpComisionPreset,
  tipo: AfpComisionTipo,
): number {
  return tipo === "flujo" ? afp.comisionFlujo : 0;
}