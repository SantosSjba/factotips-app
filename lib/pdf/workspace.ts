export type Rotation = 0 | 90 | 180 | 270;

export type PdfSourceFile = {
  id: string;
  file: File;
  name: string;
  bytes: ArrayBuffer;
  pageCount: number;
  coverThumb: string | null;
  color: string;
};

export type ThumbStatus = "pending" | "ready" | "error";

export type PdfWorkspacePage = {
  id: string;
  sourceId: string;
  sourceName: string;
  pageIndex: number;
  rotation: Rotation;
  thumbUrl: string | null;
  thumbStatus: ThumbStatus;
  color: string;
};

const FILE_COLORS = [
  "#e11d48",
  "#ea580c",
  "#ca8a04",
  "#16a34a",
  "#0d9488",
  "#2563eb",
  "#7c3aed",
  "#db2777",
] as const;

export function colorForIndex(index: number): string {
  return FILE_COLORS[index % FILE_COLORS.length];
}

export function nextRotation(current: Rotation, delta: 90 | -90): Rotation {
  const value = (current + delta + 360) % 360;
  return value as Rotation;
}

export function pagesFromSource(
  source: PdfSourceFile,
  thumbs: { pageIndex: number; thumbUrl: string | null }[],
): PdfWorkspacePage[] {
  const byIndex = new Map(thumbs.map((t) => [t.pageIndex, t.thumbUrl]));
  const count = Math.max(source.pageCount, thumbs.length);
  const pages: PdfWorkspacePage[] = [];
  for (let i = 0; i < count; i++) {
    const thumbUrl = byIndex.get(i) ?? null;
    pages.push({
      id: `${source.id}-p${i}`,
      sourceId: source.id,
      sourceName: source.name,
      pageIndex: i,
      rotation: 0,
      thumbUrl,
      thumbStatus: thumbUrl ? "ready" : "pending",
      color: source.color,
    });
  }
  return pages;
}

export function reorderByIds<T extends { id: string }>(
  items: T[],
  fromId: string,
  toId: string,
): T[] {
  const from = items.findIndex((i) => i.id === fromId);
  const to = items.findIndex((i) => i.id === toId);
  if (from < 0 || to < 0 || from === to) return items;
  const next = [...items];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}

export function insertAtId<T extends { id: string }>(
  items: T[],
  newItems: T[],
  beforeId: string | null,
): T[] {
  if (!beforeId) return [...items, ...newItems];
  const idx = items.findIndex((i) => i.id === beforeId);
  if (idx < 0) return [...items, ...newItems];
  const next = [...items];
  next.splice(idx, 0, ...newItems);
  return next;
}

/** Mueve ítems seleccionados al inicio o al final, preservando su orden relativo. */
export function moveSelectedToEdge<T extends { id: string }>(
  items: T[],
  selectedIds: Set<string>,
  edge: "start" | "end",
): T[] {
  if (selectedIds.size === 0) return items;
  const picked = items.filter((i) => selectedIds.has(i.id));
  const rest = items.filter((i) => !selectedIds.has(i.id));
  return edge === "start" ? [...picked, ...rest] : [...rest, ...picked];
}

export function reverseItems<T>(items: T[]): T[] {
  return [...items].reverse();
}

export function duplicateSelectedPages(
  pages: PdfWorkspacePage[],
  selectedIds: Set<string>,
): PdfWorkspacePage[] {
  if (selectedIds.size === 0) return pages;
  const next: PdfWorkspacePage[] = [];
  for (const page of pages) {
    next.push(page);
    if (selectedIds.has(page.id)) {
      next.push({
        ...page,
        id: `${page.id}-dup-${crypto.randomUUID().slice(0, 8)}`,
        // misma miniatura; no hace falta regenerar
      });
    }
  }
  return next;
}

/** Nombre seguro para descarga (.pdf). */
export function sanitizeDownloadName(raw: string): string {
  const trimmed = raw.trim().replace(/[<>:"/\\|?*\u0000-\u001f]/g, "");
  const base = trimmed.replace(/\.pdf$/i, "") || "factotips-merged";
  const safe = base.slice(0, 120).replace(/\s+/g, " ").trim() || "factotips-merged";
  return `${safe}.pdf`;
}
