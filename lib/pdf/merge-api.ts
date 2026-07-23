"use client";

import { downloadBlob } from "@/lib/pdf/split";
import type { PdfSourceFile, PdfWorkspacePage } from "@/lib/pdf/workspace";
import { sanitizeDownloadName } from "@/lib/pdf/workspace";

export type MergePlanPage = {
  file: number;
  page: number;
  rotation: 0 | 90 | 180 | 270;
};

export type MergePlanPayload = {
  pages: MergePlanPage[];
  base_name: string;
};

export function buildMergePlan(opts: {
  sources: PdfSourceFile[];
  pages: PdfWorkspacePage[];
  baseName: string;
}): { files: File[]; plan: MergePlanPayload } {
  const orderedIds: string[] = [];
  for (const page of opts.pages) {
    if (!orderedIds.includes(page.sourceId)) orderedIds.push(page.sourceId);
  }
  const orderedSources = orderedIds
    .map((id) => opts.sources.find((s) => s.id === id))
    .filter((s): s is PdfSourceFile => Boolean(s));

  const sourceIndex = new Map(orderedSources.map((s, i) => [s.id, i]));
  const planPages: MergePlanPage[] = [];

  for (const page of opts.pages) {
    const file = sourceIndex.get(page.sourceId);
    if (file === undefined) {
      throw new Error("SOURCE_MISSING");
    }
    planPages.push({
      file,
      page: page.pageIndex,
      rotation: page.rotation,
    });
  }

  const base = sanitizeDownloadName(opts.baseName).replace(/\.pdf$/i, "");

  return {
    files: orderedSources.map((s) => s.file),
    plan: {
      pages: planPages,
      base_name: base || "documento-unido",
    },
  };
}

export async function requestMerge(opts: {
  files: File[];
  plan: MergePlanPayload;
  downloadName: string;
}): Promise<void> {
  const form = new FormData();
  form.append("plan", JSON.stringify(opts.plan));
  for (const file of opts.files) {
    form.append("files", file, file.name);
  }

  const res = await fetch("/api/pdf/merge", {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    let message = "MERGE_FAILED";
    try {
      const data = (await res.json()) as { message?: string };
      if (data.message) message = data.message;
    } catch {
      /* ignore */
    }
    const err = new Error(message) as Error & { status?: number };
    err.status = res.status;
    throw err;
  }

  const blob = await res.blob();
  const disposition = res.headers.get("Content-Disposition") || "";
  const match = /filename="?([^";]+)"?/i.exec(disposition);
  const filename = match?.[1] || sanitizeDownloadName(opts.downloadName);

  downloadBlob(blob, filename);
}
