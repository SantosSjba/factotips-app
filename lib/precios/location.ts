import type { DepartamentoOption } from "@/lib/departamentos";
import type { UbigeoItem } from "@/lib/types/precios";

export const LOCATION_STORAGE_KEY = "ft_ubicacion_v1";
export const RATE_LIMIT_STORAGE_KEY = "ft_precios_next_at";

export type SavedLocation = {
  codigoDepartamento: string;
  codigoProvincia: string;
  codigoUbigeo: string;
  label?: string;
};

export function normalizePlace(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const DEPT_ALIASES: Record<string, string> = {
  LIMA: "LIMA",
  "LIMA METROPOLITANA": "LIMA",
  "PROVINCIA DE LIMA": "LIMA",
  CALLAO: "CALLAO",
  "REGION CALLAO": "CALLAO",
  "CONSTITUTIONAL PROVINCE OF CALLAO": "CALLAO",
  ANCASH: "ANCASH",
  "AN CASH": "ANCASH",
  HUANUCO: "HUANUCO",
  JUNIN: "JUNIN",
  CUSCO: "CUSCO",
  CUZCO: "CUSCO",
  "SAN MARTIN": "SAN MARTIN",
  "MADRE DE DIOS": "MADRE DE DIOS",
  "LA LIBERTAD": "LA LIBERTAD",
};

export function matchDepartamento(
  raw: string,
  departamentos: DepartamentoOption[],
): DepartamentoOption | null {
  const n = normalizePlace(raw);
  if (!n) return null;

  const aliased = DEPT_ALIASES[n] ?? n.replace(/^REGION\s+/, "");

  const exact = departamentos.find((d) => normalizePlace(d.nombre) === aliased);
  if (exact) return exact;

  const partial = departamentos.find((d) => {
    const name = normalizePlace(d.nombre);
    return aliased.includes(name) || name.includes(aliased);
  });
  return partial ?? null;
}

export function matchUbigeoItem(
  raw: string,
  items: UbigeoItem[],
): UbigeoItem | null {
  const n = normalizePlace(raw);
  if (!n || !items.length) return null;

  const exact = items.find((i) => normalizePlace(i.descripcion) === n);
  if (exact) return exact;

  const starts = items.find((i) =>
    normalizePlace(i.descripcion).startsWith(n),
  );
  if (starts) return starts;

  const includes = items.find((i) => {
    const d = normalizePlace(i.descripcion);
    return d.includes(n) || n.includes(d);
  });
  return includes ?? null;
}

export function loadSavedLocation(): SavedLocation | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LOCATION_STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as SavedLocation;
    if (!data?.codigoDepartamento) return null;
    return data;
  } catch {
    return null;
  }
}

export function saveLocation(location: SavedLocation): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(location));
  } catch {
    // ignore quota
  }
}

export function clearSavedLocation(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(LOCATION_STORAGE_KEY);
  } catch {
    // ignore
  }
}

/** Timestamp (ms) de cuándo se puede volver a consultar */
export function loadNextSearchAt(): number {
  if (typeof window === "undefined") return 0;
  const raw = sessionStorage.getItem(RATE_LIMIT_STORAGE_KEY);
  const n = raw ? Number(raw) : 0;
  return Number.isFinite(n) ? n : 0;
}

export function saveNextSearchAt(atMs: number): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(RATE_LIMIT_STORAGE_KEY, String(atMs));
  } catch {
    // ignore
  }
}

export function secondsUntil(atMs: number): number {
  return Math.max(0, Math.ceil((atMs - Date.now()) / 1000));
}

export type ReverseGeoResult = {
  displayName: string;
  departamento: string;
  provincia: string;
  distrito: string;
};

export type LatLng = { lat: number; lon: number };

/** Centro por defecto — Lima */
export const PERU_DEFAULT_CENTER: LatLng = {
  lat: -12.0464,
  lon: -77.0428,
};

export async function reverseGeocode(
  lat: number,
  lon: number,
): Promise<{ ok: true; data: ReverseGeoResult } | { ok: false; message: string }> {
  const res = await fetch("/api/geo/reverse", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ lat, lon }),
  });
  const json = (await res.json()) as {
    success: boolean;
    message?: string;
    data?: ReverseGeoResult;
  };
  if (!json.success || !json.data) {
    return {
      ok: false,
      message: json.message ?? "No se pudo obtener tu ubicación.",
    };
  }
  return { ok: true, data: json.data };
}

export async function forwardGeocode(
  query: string,
  opts?: { preciseOnly?: boolean },
): Promise<
  | { ok: true; data: LatLng & { displayName: string } }
  | { ok: false; message: string; code?: string }
> {
  const res = await fetch("/api/geo/search", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      query,
      preciseOnly: opts?.preciseOnly ?? true,
    }),
  });
  const json = (await res.json()) as {
    success: boolean;
    message?: string;
    code?: string;
    data?: LatLng & { displayName: string };
  };
  if (!json.success || !json.data) {
    return {
      ok: false,
      message: json.message ?? "No disponible",
      code: json.code,
    };
  }
  return { ok: true, data: json.data };
}

export function getBrowserPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Tu navegador no soporta geolocalización."));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 15_000,
      maximumAge: 30_000,
    });
  });
}
