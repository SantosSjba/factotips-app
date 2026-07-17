/** Indicadores tributarios / laborales Perú — fuente única para calculadoras. */

export const INDICADORES_ANIO = 2026;

/** UIT 2026 — D.S. 301-2025-EF */
export const UIT_SOLES = 5500;
export const UIT_NORMA = "D.S. 301-2025-EF";

/** Fracciones UIT frecuentes (multas, rentas, trámites). */
export const UIT_QUICK = [0.5, 1, 2, 3, 5, 7, 10, 14, 15] as const;

/** RMV vigente (verificar MEF/MTPE al actualizar). */
export const RMV_SOLES = 1130;

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
