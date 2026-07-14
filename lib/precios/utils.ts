import type { PrecioRow } from "@/lib/types/precios";

export function toUnitPrice(value: unknown): number | null {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

export function formatSol(value: unknown): string {
  const n = Number(value);
  if (!Number.isFinite(n)) return "—";
  return `S/ ${n.toFixed(2)}`;
}

export function computePriceStats(rows: PrecioRow[]) {
  const nums = rows
    .map((r) => toUnitPrice(r.precio2))
    .filter((n): n is number => n !== null);

  if (!nums.length) {
    return { min: 0, max: 0, avg: 0, count: 0 };
  }

  const min = Math.min(...nums);
  const max = Math.max(...nums);
  const avg = nums.reduce((a, b) => a + b, 0) / nums.length;
  return { min, max, avg, count: rows.length };
}

export function isBestUnitPrice(row: PrecioRow, min: number): boolean {
  const p = toUnitPrice(row.precio2);
  if (p === null || min <= 0) return false;
  return Math.abs(p - min) < 0.01;
}

export function sortByUnitPrice(
  rows: PrecioRow[],
  order: "asc" | "desc",
): PrecioRow[] {
  const dir = order === "asc" ? 1 : -1;
  return [...rows].sort((a, b) => {
    const pa = toUnitPrice(a.precio2) ?? Infinity;
    const pb = toUnitPrice(b.precio2) ?? Infinity;
    return dir * (pa - pb);
  });
}

export function filterPriceRows(
  rows: PrecioRow[],
  opts: { query: string; tipo: string },
): PrecioRow[] {
  let list = rows.filter(Boolean);
  const q = opts.query.trim().toLowerCase();
  if (q) {
    list = list.filter((r) =>
      `${r.nombreComercial ?? ""} ${r.nombreLaboratorio ?? ""}`
        .toLowerCase()
        .includes(q),
    );
  }
  if (opts.tipo) {
    list = list.filter((r) => (r.setcodigo ?? "") === opts.tipo);
  }
  return list;
}

export async function exportPreciosXlsx(
  rows: PrecioRow[],
  productLabel: string,
) {
  const XLSX = await import("xlsx");
  const cols = [
    "Tipo",
    "Farmacia",
    "Producto",
    "Concentración",
    "Laboratorio",
    "Departamento",
    "Provincia",
    "Distrito",
    "P. Pack (S/)",
    "P. Unitario (S/)",
  ];
  const data = rows.map((r) => [
    r.setcodigo ?? "",
    r.nombreComercial ?? "",
    r.nombreProducto ?? r.nombreSustancia ?? "",
    r.concent ?? "",
    r.nombreLaboratorio ?? "",
    r.departamento ?? "",
    r.provincia ?? "",
    r.distrito ?? "",
    r.precio1 != null ? Number(r.precio1) : "",
    r.precio2 != null ? Number(r.precio2) : "",
  ]);
  const ws = XLSX.utils.aoa_to_sheet([cols, ...data]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Precios");
  const nombre = productLabel.replace(/\s+/g, "_").slice(0, 40) || "precios";
  XLSX.writeFile(
    wb,
    `precios_${nombre}_${new Date().toISOString().slice(0, 10)}.xlsx`,
  );
}

const SHOWN_DETAIL_KEYS = new Set([
  "nombreComercial",
  "setcodigo",
  "direccion",
  "departamento",
  "provincia",
  "distrito",
  "telefono",
  "horarioAtencion",
  "precio1",
  "precio2",
  "nombreProducto",
  "nombreSustancia",
  "concent",
  "nombreFormaFarmaceutica",
  "nombreLaboratorio",
  "numeroRS",
  "registroSanitario",
]);

export function extraDetailFields(
  detalle: Record<string, unknown> | null,
): Record<string, string> {
  if (!detalle) return {};
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(detalle)) {
    if (SHOWN_DETAIL_KEYS.has(key)) continue;
    if (value == null || value === "") continue;
    if (typeof value === "object" && !Array.isArray(value)) continue;
    out[key] = Array.isArray(value) ? value.join(", ") : String(value);
  }
  return out;
}

export function formatFieldLabel(key: string): string {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (s) => s.toUpperCase())
    .replace(/_/g, " ")
    .trim();
}
