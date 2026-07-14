/**
 * Configuración DIGEMID — cliente HTTP completo en Fase 1.
 */

export const DIGEMID_DEFAULTS = {
  baseUrl: "https://ms-opm.minsa.gob.pe/msopmcovid",
  origin: "https://opm-digemid.minsa.gob.pe",
  timeoutMs: 20_000,
} as const;

export function getDigemidConfig() {
  return {
    baseUrl: process.env.DIGEMID_BASE_URL ?? DIGEMID_DEFAULTS.baseUrl,
    origin: process.env.DIGEMID_ORIGIN ?? DIGEMID_DEFAULTS.origin,
    timeoutMs: DIGEMID_DEFAULTS.timeoutMs,
  };
}
