"use client";

export type PdfPreviewInfo = {
  pageCount: number;
  thumbUrl: string | null;
};

export type PdfPageThumb = {
  pageIndex: number;
  thumbUrl: string | null;
  error?: boolean;
};

/** Cola global: pdf.js no tolera bien varios documentos renderizando a la vez. */
let thumbQueue: Promise<unknown> = Promise.resolve();

function enqueueThumbWork<T>(job: () => Promise<T>): Promise<T> {
  const run = thumbQueue.then(job, job);
  thumbQueue = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

let workerReady = false;

async function ensurePdfjs() {
  const pdfjs = await import("pdfjs-dist");
  if (!workerReady) {
    // Worker local (más fiable que CDN / unpkg).
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
      "pdfjs-dist/build/pdf.worker.min.mjs",
      import.meta.url,
    ).toString();
    workerReady = true;
  }
  return pdfjs;
}

/** Copia: pdf.js puede transferir/detach el buffer original. */
function copyPdfBytes(bytes: ArrayBuffer): Uint8Array {
  return new Uint8Array(bytes.slice(0));
}

async function renderPageThumb(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- pdfjs page
  page: any,
  scale: number,
): Promise<string | null> {
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  const width = Math.max(1, Math.floor(viewport.width));
  const height = Math.max(1, Math.floor(viewport.height));
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { alpha: false });
  if (!ctx) return null;

  const task = page.render({
    canvasContext: ctx,
    viewport,
    canvas,
  });
  await task.promise;

  try {
    return canvas.toDataURL("image/jpeg", 0.72);
  } catch {
    return null;
  }
}

/** Primera página + conteo (usa bytes ya leídos). */
export async function loadPdfPreviewFromBytes(
  bytes: ArrayBuffer,
): Promise<PdfPreviewInfo> {
  return enqueueThumbWork(async () => {
    const pdfjs = await ensurePdfjs();
    const doc = await pdfjs.getDocument({ data: copyPdfBytes(bytes) }).promise;
    try {
      const page = await doc.getPage(1);
      try {
        const thumbUrl = await renderPageThumb(page, 0.45);
        return { pageCount: doc.numPages, thumbUrl };
      } finally {
        page.cleanup?.();
      }
    } finally {
      doc.cleanup();
    }
  });
}

/** @deprecated prefer loadPdfPreviewFromBytes */
export async function loadPdfPreview(file: File): Promise<PdfPreviewInfo> {
  const bytes = await file.arrayBuffer();
  return loadPdfPreviewFromBytes(bytes);
}

/** Miniaturas de todas las páginas, en cola (progresivo vía onPage). */
export async function loadAllPageThumbsFromBytes(
  bytes: ArrayBuffer,
  options?: {
    scale?: number;
    /** 0-based inclusive. Default 0. Usa 1 si la portada ya está lista. */
    fromPageIndex?: number;
    signal?: AbortSignal;
    onPage?: (thumb: PdfPageThumb, pageCount: number) => void;
  },
): Promise<{ pageCount: number; thumbs: PdfPageThumb[] }> {
  return enqueueThumbWork(async () => {
    if (options?.signal?.aborted) {
      throw new DOMException("Aborted", "AbortError");
    }

    const pdfjs = await ensurePdfjs();
    const doc = await pdfjs.getDocument({ data: copyPdfBytes(bytes) }).promise;
    const scale = options?.scale ?? 0.28;
    const from = Math.max(0, options?.fromPageIndex ?? 0);
    const thumbs: PdfPageThumb[] = [];

    try {
      for (let i = from + 1; i <= doc.numPages; i++) {
        if (options?.signal?.aborted) {
          throw new DOMException("Aborted", "AbortError");
        }

        let entry: PdfPageThumb;
        try {
          const page = await doc.getPage(i);
          try {
            const thumbUrl = await renderPageThumb(page, scale);
            entry = {
              pageIndex: i - 1,
              thumbUrl,
              error: !thumbUrl,
            };
          } finally {
            page.cleanup?.();
          }
        } catch {
          entry = { pageIndex: i - 1, thumbUrl: null, error: true };
        }

        thumbs.push(entry);
        options?.onPage?.(entry, doc.numPages);

        // Cede el hilo para no congelar la UI en PDFs largos.
        await new Promise((r) => setTimeout(r, 0));
      }
      return { pageCount: doc.numPages, thumbs };
    } finally {
      doc.cleanup();
    }
  });
}

/** Una página en alta resolución para el lightbox (cola serial). */
export async function renderPagePreviewFromBytes(
  bytes: ArrayBuffer,
  pageIndex: number,
  scale = 1.35,
): Promise<string | null> {
  return enqueueThumbWork(async () => {
    const pdfjs = await ensurePdfjs();
    const doc = await pdfjs.getDocument({ data: copyPdfBytes(bytes) }).promise;
    try {
      const page = await doc.getPage(pageIndex + 1);
      try {
        return await renderPageThumb(page, scale);
      } finally {
        page.cleanup?.();
      }
    } finally {
      doc.cleanup();
    }
  });
}

/** @deprecated prefer loadAllPageThumbsFromBytes */
export async function loadAllPageThumbs(
  file: File,
  options?: {
    scale?: number;
    onPage?: (thumb: PdfPageThumb, pageCount: number) => void;
  },
): Promise<{ pageCount: number; thumbs: PdfPageThumb[] }> {
  const bytes = await file.arrayBuffer();
  return loadAllPageThumbsFromBytes(bytes, options);
}
