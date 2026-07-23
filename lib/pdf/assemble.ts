"use client";

import { degrees, PDFDocument } from "pdf-lib";

export type AssemblePage = {
  sourceBytes: ArrayBuffer;
  pageIndex: number;
  rotation: 0 | 90 | 180 | 270;
};

/** Arma un PDF a partir de páginas (posiblemente de varios orígenes) con rotación. */
export async function assemblePdfFromPages(
  pages: AssemblePage[],
): Promise<Uint8Array> {
  const out = await PDFDocument.create();
  const cache = new Map<ArrayBuffer, PDFDocument>();

  for (const page of pages) {
    let src = cache.get(page.sourceBytes);
    if (!src) {
      src = await PDFDocument.load(page.sourceBytes, {
        ignoreEncryption: true,
      });
      cache.set(page.sourceBytes, src);
    }

    const [copied] = await out.copyPages(src, [page.pageIndex]);
    if (page.rotation) {
      const current = copied.getRotation().angle;
      copied.setRotation(degrees((current + page.rotation) % 360));
    }
    out.addPage(copied);
  }

  return out.save();
}

export function downloadPdfBytes(bytes: Uint8Array, filename: string) {
  const blob = new Blob([Uint8Array.from(bytes)], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
