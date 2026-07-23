"use client";

import JSZip from "jszip";
import { assemblePdfFromPages, type AssemblePage } from "@/lib/pdf/assemble";
import { sanitizeDownloadName } from "@/lib/pdf/workspace";

/** Cortes: índices 0-based = cortar DESPUÉS de esa posición en la lista. */
export function cutsFromEveryN(pageCount: number, every: number): Set<number> {
  const cuts = new Set<number>();
  if (every < 1 || pageCount < 2) return cuts;
  for (let i = every; i < pageCount; i += every) {
    cuts.add(i - 1);
  }
  return cuts;
}

/** Segmentos [start, end) a partir de cortes “después de índice i”. */
export function segmentsFromCuts(
  pageCount: number,
  cuts: Set<number>,
): Array<{ start: number; end: number }> {
  if (pageCount === 0) return [];
  const ordered = [...cuts]
    .filter((c) => c >= 0 && c < pageCount - 1)
    .sort((a, b) => a - b);
  const segments: Array<{ start: number; end: number }> = [];
  let start = 0;
  for (const cut of ordered) {
    const end = cut + 1;
    if (end > start) {
      segments.push({ start, end });
      start = end;
    }
  }
  if (start < pageCount) {
    segments.push({ start, end: pageCount });
  }
  return segments;
}

export function toggleCut(cuts: Set<number>, afterIndex: number): Set<number> {
  const next = new Set(cuts);
  if (next.has(afterIndex)) next.delete(afterIndex);
  else next.add(afterIndex);
  return next;
}

export async function buildSplitZipFromPages(opts: {
  pages: AssemblePage[];
  cuts: Set<number>;
  baseName: string;
}): Promise<Blob> {
  const segments = segmentsFromCuts(opts.pages.length, opts.cuts);
  if (segments.length < 2) {
    throw new Error("NEED_CUTS");
  }

  const zip = new JSZip();
  const base = sanitizeDownloadName(opts.baseName).replace(/\.pdf$/i, "");

  for (let i = 0; i < segments.length; i++) {
    const { start, end } = segments[i];
    const bytes = await assemblePdfFromPages(opts.pages.slice(start, end));
    zip.file(
      `${base}-parte-${String(i + 1).padStart(2, "0")}.pdf`,
      bytes,
    );
  }

  return zip.generateAsync({ type: "blob" });
}

export async function buildExtractPdf(opts: {
  pages: AssemblePage[];
}): Promise<Uint8Array> {
  if (opts.pages.length === 0) {
    throw new Error("NEED_SELECTION");
  }
  return assemblePdfFromPages(opts.pages);
}

/** Cada página seleccionada → un PDF en un ZIP. */
export async function buildExtractZipPerPage(opts: {
  pages: AssemblePage[];
  baseName: string;
}): Promise<Blob> {
  if (opts.pages.length === 0) {
    throw new Error("NEED_SELECTION");
  }
  const zip = new JSZip();
  const base = sanitizeDownloadName(opts.baseName).replace(/\.pdf$/i, "");
  for (let i = 0; i < opts.pages.length; i++) {
    const bytes = await assemblePdfFromPages([opts.pages[i]]);
    zip.file(
      `${base}-pagina-${String(i + 1).padStart(2, "0")}.pdf`,
      bytes,
    );
  }
  return zip.generateAsync({ type: "blob" });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
