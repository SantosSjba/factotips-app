"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { renderPagePreviewFromBytes } from "@/lib/pdf/preview";
import type { PdfSourceFile, PdfWorkspacePage } from "@/lib/pdf/workspace";
import { cn } from "@/lib/utils";

type Labels = {
  close: string;
  prev: string;
  next: string;
  pageOf: string;
  enlargeHint: string;
};

type Props = {
  pages: PdfWorkspacePage[];
  sources: PdfSourceFile[];
  pageId: string;
  labels: Labels;
  onClose: () => void;
  onNavigate: (pageId: string) => void;
};

export function PageLightbox({
  pages,
  sources,
  pageId,
  labels,
  onClose,
  onNavigate,
}: Props) {
  const index = pages.findIndex((p) => p.id === pageId);
  const page = index >= 0 ? pages[index] : null;
  const source = page
    ? sources.find((s) => s.id === page.sourceId) ?? null
    : null;

  const [hiRes, setHiRes] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!page || !source) return;
    let cancelled = false;
    setLoading(true);
    setHiRes(null);

    void renderPagePreviewFromBytes(source.bytes, page.pageIndex, 1.4)
      .then((url) => {
        if (!cancelled) setHiRes(url);
      })
      .catch(() => {
        if (!cancelled) setHiRes(page.thumbUrl);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [page, source]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === "ArrowLeft" && index > 0) {
        e.preventDefault();
        onNavigate(pages[index - 1].id);
      }
      if (e.key === "ArrowRight" && index >= 0 && index < pages.length - 1) {
        e.preventDefault();
        onNavigate(pages[index + 1].id);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, onClose, onNavigate, pages]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  if (!page) return null;

  const displayUrl = hiRes ?? page.thumbUrl;
  const canPrev = index > 0;
  const canNext = index >= 0 && index < pages.length - 1;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6">
      <button
        type="button"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        aria-label={labels.close}
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={labels.pageOf
          .replace("{n}", String(index + 1))
          .replace("{total}", String(pages.length))}
        className="relative z-10 flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-surface shadow-2xl"
      >
        <div className="flex shrink-0 items-center gap-3 border-b border-border px-4 py-3 sm:px-5">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-foreground">
              {page.sourceName}
            </p>
            <p className="text-xs text-muted">
              {labels.pageOf
                .replace("{n}", String(index + 1))
                .replace("{total}", String(pages.length))}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-muted transition-colors hover:bg-brand-soft hover:text-brand"
            aria-label={labels.close}
          >
            <Icon icon="mdi:close" className="h-5 w-5" />
          </button>
        </div>

        <div className="relative flex min-h-0 flex-1 items-center justify-center bg-[#0f1f1c]/[0.04] px-3 py-4 sm:px-8 sm:py-6">
          <button
            type="button"
            disabled={!canPrev}
            onClick={() => canPrev && onNavigate(pages[index - 1].id)}
            className={cn(
              "absolute left-2 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full bg-surface text-foreground shadow-md transition-colors hover:bg-brand hover:text-white disabled:opacity-30 sm:left-4",
            )}
            aria-label={labels.prev}
          >
            <Icon icon="mdi:chevron-left" className="h-6 w-6" />
          </button>

          <div className="flex max-h-[70vh] w-full items-center justify-center">
            {displayUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={displayUrl}
                alt=""
                className="max-h-[70vh] max-w-full rounded-lg object-contain shadow-lg transition-transform"
                style={{ transform: `rotate(${page.rotation}deg)` }}
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-muted">
                <Icon
                  icon={loading ? "mdi:loading" : "mdi:file-pdf-box"}
                  className={cn("h-10 w-10", loading && "animate-spin")}
                />
              </div>
            )}
            {loading && displayUrl ? (
              <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-lg bg-surface/90 px-2.5 py-1 text-xs font-medium text-muted shadow">
                <Icon icon="mdi:loading" className="h-3.5 w-3.5 animate-spin" />
                HD
              </span>
            ) : null}
          </div>

          <button
            type="button"
            disabled={!canNext}
            onClick={() => canNext && onNavigate(pages[index + 1].id)}
            className="absolute right-2 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full bg-surface text-foreground shadow-md transition-colors hover:bg-brand hover:text-white disabled:opacity-30 sm:right-4"
            aria-label={labels.next}
          >
            <Icon icon="mdi:chevron-right" className="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
