"use client";

import { downloadBlob } from "@/lib/pdf/split";
import type { PdfSourceFile, PdfWorkspacePage } from "@/lib/pdf/workspace";
import { sanitizeDownloadName } from "@/lib/pdf/workspace";

export type DivideMode = "split" | "extract";

export type DividePlanPage = {
  file: number;
  page: number;
  rotation: 0 | 90 | 180 | 270;
};

export type DividePlanPayload = {
  pages: DividePlanPage[];
  cuts: number[];
  every: number | null;
  per_page: boolean;
  base_name: string;
};

export function buildDividePlan(opts: {
  sources: PdfSourceFile[];
  pages: PdfWorkspacePage[];
  cuts: number[];
  every: number | null;
  perPage: boolean;
  baseName: string;
}): { files: File[]; plan: DividePlanPayload } {
  const sourceIndex = new Map(opts.sources.map((s, i) => [s.id, i]));
  const planPages: DividePlanPage[] = [];

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
    files: opts.sources.map((s) => s.file),
    plan: {
      pages: planPages,
      cuts: opts.cuts,
      every: opts.every,
      per_page: opts.perPage,
      base_name: base || "documento",
    },
  };
}

export async function requestDivide(opts: {
  mode: DivideMode;
  files: File[];
  plan: DividePlanPayload;
  downloadName: string;
}): Promise<void> {
  const form = new FormData();
  form.append("mode", opts.mode);
  form.append("plan", JSON.stringify(opts.plan));
  for (const file of opts.files) {
    form.append("files", file, file.name);
  }

  const res = await fetch("/api/pdf/divide", {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    let message = "DIVIDE_FAILED";
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
  const filename =
    match?.[1] ||
    (blob.type.includes("zip")
      ? `${opts.downloadName}.zip`
      : sanitizeDownloadName(opts.downloadName));

  downloadBlob(blob, filename);
}
