"use client";

import Link from "next/link";
import {
  useCallback,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { flushSync } from "react-dom";
import { Icon } from "@/components/ui/icon";
import { useI18n } from "@/lib/i18n/provider";
import { PageLightbox } from "@/components/pdf/page-lightbox";
import { assemblePdfFromPages, downloadPdfBytes } from "@/lib/pdf/assemble";
import { pushHistory, type HistorySnapshot } from "@/lib/pdf/history";
import {
  PDF_MAX_FILES_MERGE,
  PDF_MAX_UPLOAD_BYTES,
  PDF_MAX_UPLOAD_MB,
} from "@/lib/pdf/limits";
import {
  loadAllPageThumbsFromBytes,
  loadPdfPreviewFromBytes,
} from "@/lib/pdf/preview";
import { PDF_HUB_PATH, pdfToolLandingPath } from "@/lib/pdf/tools";
import {
  colorForIndex,
  duplicateSelectedPages,
  moveSelectedToEdge,
  nextRotation,
  pagesFromSource,
  reorderByIds,
  reverseItems,
  sanitizeDownloadName,
  type PdfSourceFile,
  type PdfWorkspacePage,
  type Rotation,
} from "@/lib/pdf/workspace";
import { cn } from "@/lib/utils";

type ViewMode = "files" | "pages";

function isPdfFile(file: File): boolean {
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  return name.endsWith(".pdf") || type.includes("pdf");
}

function shortName(name: string, max = 20): string {
  if (name.length <= max) return name;
  const ext = name.includes(".") ? name.slice(name.lastIndexOf(".")) : "";
  const base = name.slice(0, Math.max(8, max - ext.length - 1));
  return `${base}…${ext}`;
}

export function UnirPdfTool() {
  const { t } = useI18n();
  const c = t.pdfUnir;
  const inputId = useId();
  const nameId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const insertBeforeRef = useRef<string | null>(null);

  const [sources, setSources] = useState<PdfSourceFile[]>([]);
  const [pages, setPages] = useState<PdfWorkspacePage[]>([]);
  const [past, setPast] = useState<HistorySnapshot<PdfWorkspacePage>[]>([]);
  const [future, setFuture] = useState<HistorySnapshot<PdfWorkspacePage>[]>([]);
  const [view, setView] = useState<ViewMode>("pages");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [dragId, setDragId] = useState<string | null>(null);
  const [dropOverId, setDropOverId] = useState<string | null>(null);
  const [zoneOver, setZoneOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [busyFiles, setBusyFiles] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState("documento-unido");
  const [lightboxPageId, setLightboxPageId] = useState<string | null>(null);

  const fileOrder = useMemo(() => {
    const seen = new Set<string>();
    const order: PdfSourceFile[] = [];
    for (const page of pages) {
      if (seen.has(page.sourceId)) continue;
      seen.add(page.sourceId);
      const src = sources.find((s) => s.id === page.sourceId);
      if (src) order.push(src);
    }
    for (const src of sources) {
      if (!seen.has(src.id)) order.push(src);
    }
    return order;
  }, [pages, sources]);

  const commitPages = useCallback((updater: (prev: PdfWorkspacePage[]) => PdfWorkspacePage[]) => {
    setPages((prev) => {
      const next = updater(prev);
      if (next === prev) return prev;
      setPast((p) => pushHistory(p, { pages: prev }));
      setFuture([]);
      return next;
    });
  }, []);

  const undo = useCallback(() => {
    setPast((p) => {
      if (p.length === 0) return p;
      const previous = p[p.length - 1];
      setFuture((f) => [{ pages }, ...f]);
      setPages(previous.pages);
      return p.slice(0, -1);
    });
    setSelected(new Set());
  }, [pages]);

  const redo = useCallback(() => {
    setFuture((f) => {
      if (f.length === 0) return f;
      const [next, ...rest] = f;
      setPast((p) => pushHistory(p, { pages }));
      setPages(next.pages);
      return rest;
    });
    setSelected(new Set());
  }, [pages]);

  const openPicker = (beforePageId: string | null = null) => {
    insertBeforeRef.current = beforePageId;
    inputRef.current?.click();
  };

  const applyThumb = useCallback(
    (
      sourceId: string,
      pageIndex: number,
      thumbUrl: string | null,
      error?: boolean,
    ) => {
      const status =
        error || !thumbUrl ? ("error" as const) : ("ready" as const);
      setPages((prev) => {
        let changed = false;
        const next = prev.map((p) => {
          if (p.sourceId !== sourceId || p.pageIndex !== pageIndex) return p;
          changed = true;
          return { ...p, thumbUrl: thumbUrl ?? p.thumbUrl, thumbStatus: status };
        });
        return changed ? next : prev;
      });
      if (pageIndex === 0 && thumbUrl) {
        setSources((prev) =>
          prev.map((s) =>
            s.id === sourceId ? { ...s, coverThumb: thumbUrl } : s,
          ),
        );
      }
    },
    [],
  );

  const ingestFiles = useCallback(
    async (list: FileList | File[], beforePageId: string | null = null) => {
      setError(null);
      const incoming = Array.from(list).filter(Boolean);
      if (!incoming.length) return;

      setBusyFiles(true);
      try {
        const currentCount = sources.length;
        if (currentCount + incoming.length > PDF_MAX_FILES_MERGE) {
          setError(c.errorMaxFiles.replace("{n}", String(PDF_MAX_FILES_MERGE)));
          return;
        }

        const newSources: PdfSourceFile[] = [];
        const newPages: PdfWorkspacePage[] = [];

        // Fase 1: leer + portada (sin generar todas las thumbs aún).
        for (const file of incoming) {
          if (!isPdfFile(file)) {
            setError(c.errorNotPdf.replace("{name}", file.name));
            continue;
          }
          if (file.size > PDF_MAX_UPLOAD_BYTES) {
            setError(
              c.errorTooLarge
                .replace("{name}", file.name)
                .replace("{mb}", String(PDF_MAX_UPLOAD_MB)),
            );
            continue;
          }

          const bytes = await file.arrayBuffer();
          const preview = await loadPdfPreviewFromBytes(bytes);
          const id = crypto.randomUUID();
          const source: PdfSourceFile = {
            id,
            file,
            name: file.name,
            bytes,
            pageCount: preview.pageCount,
            coverThumb: preview.thumbUrl,
            color: colorForIndex(currentCount + newSources.length),
          };
          newSources.push(source);
          newPages.push(
            ...pagesFromSource(
              source,
              Array.from({ length: preview.pageCount }, (_, pageIndex) => ({
                pageIndex,
                thumbUrl: pageIndex === 0 ? preview.thumbUrl : null,
              })),
            ),
          );
        }

        if (!newSources.length) return;

        // Fase 2: commit síncrono — si generamos thumbs antes, onPage no encuentra páginas.
        flushSync(() => {
          setSources((prev) => [...prev, ...newSources]);
          setPages((prev) => {
            setPast((p) => pushHistory(p, { pages: prev }));
            setFuture([]);
            if (!beforePageId) return [...prev, ...newPages];
            const idx = prev.findIndex((p) => p.id === beforePageId);
            if (idx < 0) return [...prev, ...newPages];
            const next = [...prev];
            next.splice(idx, 0, ...newPages);
            return next;
          });
        });

        if (fileName === "documento-unido" && newSources[0]) {
          const stem = newSources[0].name.replace(/\.pdf$/i, "");
          setFileName(stem.slice(0, 80) || "documento-unido");
        }

        // Fase 3: miniaturas desde la pág. 2 (la 1 ya vino en el preview).
        for (const source of newSources) {
          if (source.pageCount <= 1) continue;
          void loadAllPageThumbsFromBytes(source.bytes, {
            fromPageIndex: 1,
            onPage: (thumb) => {
              applyThumb(
                source.id,
                thumb.pageIndex,
                thumb.thumbUrl,
                thumb.error,
              );
            },
          }).catch(() => {
            setPages((prev) =>
              prev.map((p) =>
                p.sourceId === source.id && p.thumbStatus === "pending"
                  ? { ...p, thumbStatus: "error" }
                  : p,
              ),
            );
          });
        }
      } finally {
        setBusyFiles(false);
        insertBeforeRef.current = null;
      }
    },
    [applyThumb, c, fileName, sources.length],
  );

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAll() {
    if (view === "files") {
      const ids = fileOrder.map((f) => f.id);
      const allOn = ids.every((id) => selected.has(id));
      setSelected(allOn ? new Set() : new Set(ids));
    } else {
      const ids = pages.map((p) => p.id);
      const allOn = ids.length > 0 && ids.every((id) => selected.has(id));
      setSelected(allOn ? new Set() : new Set(ids));
    }
  }

  function deleteSelected() {
    if (selected.size === 0) return;
    if (view === "files") {
      commitPages((prev) => prev.filter((p) => !selected.has(p.sourceId)));
      setSources((prev) => prev.filter((s) => !selected.has(s.id)));
    } else {
      commitPages((prev) => {
        const next = prev.filter((p) => !selected.has(p.id));
        const remaining = new Set(next.map((p) => p.sourceId));
        setSources((srcs) => srcs.filter((s) => remaining.has(s.id)));
        return next;
      });
    }
    setSelected(new Set());
  }

  function rotateSelected(delta: 90 | -90) {
    if (view !== "pages" || selected.size === 0) return;
    commitPages((prev) =>
      prev.map((p) =>
        selected.has(p.id)
          ? { ...p, rotation: nextRotation(p.rotation, delta) }
          : p,
      ),
    );
  }

  function duplicateSelected() {
    if (view !== "pages" || selected.size === 0) return;
    commitPages((prev) => duplicateSelectedPages(prev, selected));
  }

  function moveSelected(edge: "start" | "end") {
    if (selected.size === 0) return;
    if (view === "pages") {
      commitPages((prev) => moveSelectedToEdge(prev, selected, edge));
    } else {
      commitPages((prev) => {
        const groups = new Map<string, PdfWorkspacePage[]>();
        const order: string[] = [];
        for (const page of prev) {
          if (!groups.has(page.sourceId)) {
            groups.set(page.sourceId, []);
            order.push(page.sourceId);
          }
          groups.get(page.sourceId)!.push(page);
        }
        const nextOrder = moveSelectedToEdge(
          order.map((id) => ({ id })),
          selected,
          edge,
        ).map((x) => x.id);
        return nextOrder.flatMap((id) => groups.get(id) ?? []);
      });
    }
  }

  function reverseOrder() {
    if (view === "pages") {
      commitPages((prev) => reverseItems(prev));
    } else {
      commitPages((prev) => {
        const groups = new Map<string, PdfWorkspacePage[]>();
        const order: string[] = [];
        for (const page of prev) {
          if (!groups.has(page.sourceId)) {
            groups.set(page.sourceId, []);
            order.push(page.sourceId);
          }
          groups.get(page.sourceId)!.push(page);
        }
        return reverseItems(order).flatMap((id) => groups.get(id) ?? []);
      });
    }
    setSelected(new Set());
  }

  function clearAll() {
    if (!pages.length) return;
    commitPages(() => []);
    setSources([]);
    setSelected(new Set());
  }

  function onDragStart(id: string) {
    setDragId(id);
  }

  function onDropOn(targetId: string) {
    if (!dragId || dragId === targetId) {
      setDragId(null);
      setDropOverId(null);
      return;
    }

    if (view === "files") {
      const fromSrc = dragId;
      const toSrc = targetId;
      commitPages((prev) => {
        const groups = new Map<string, PdfWorkspacePage[]>();
        const order: string[] = [];
        for (const page of prev) {
          if (!groups.has(page.sourceId)) {
            groups.set(page.sourceId, []);
            order.push(page.sourceId);
          }
          groups.get(page.sourceId)!.push(page);
        }
        const nextOrder = reorderByIds(
          order.map((id) => ({ id })),
          fromSrc,
          toSrc,
        ).map((x) => x.id);
        return nextOrder.flatMap((id) => groups.get(id) ?? []);
      });
    } else {
      commitPages((prev) => reorderByIds(prev, dragId, targetId));
    }

    setDragId(null);
    setDropOverId(null);
  }

  async function handleFinish() {
    if (pages.length === 0) {
      setError(c.errorMinPages);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const bytesBySource = new Map(
        sources.map((s) => [s.id, s.bytes] as const),
      );
      const assembled = await assemblePdfFromPages(
        pages.map((p) => ({
          sourceBytes: bytesBySource.get(p.sourceId)!,
          pageIndex: p.pageIndex,
          rotation: p.rotation,
        })),
      );
      downloadPdfBytes(assembled, sanitizeDownloadName(fileName));
    } catch {
      setError(c.errorGeneric);
    } finally {
      setLoading(false);
    }
  }

  const hasContent = pages.length > 0;
  const selectedCount = selected.size;
  const canFinish = pages.length > 0 && !loading && !busyFiles;
  const downloadPreview = sanitizeDownloadName(fileName);

  const toolBtn =
    "inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-2.5 text-sm font-semibold text-foreground transition-colors hover:border-brand/40 disabled:cursor-not-allowed disabled:opacity-40";
  const iconBtn =
    "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background text-muted transition-colors hover:text-brand disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col">
      <div className="sticky top-0 z-20 border-b border-border/80 bg-surface/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
          <Link
            href={pdfToolLandingPath("unir")}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-brand"
          >
            <Icon icon="mdi:arrow-left" className="h-4 w-4" />
            <span className="hidden sm:inline">{c.back}</span>
          </Link>

          <h1 className="font-display text-lg font-semibold text-foreground sm:text-xl">
            {c.title}
          </h1>

          {hasContent ? (
            <p className="hidden text-sm text-muted md:block">
              {c.statsBar
                .replace("{files}", String(fileOrder.length))
                .replace("{pages}", String(pages.length))}
            </p>
          ) : null}

          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              disabled={!canFinish}
              onClick={handleFinish}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Icon icon="mdi:loading" className="h-4 w-4 animate-spin" />
                  {c.merging}
                </>
              ) : (
                <>
                  {c.finishCta}
                  <Icon icon="mdi:arrow-right" className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </div>

        {hasContent ? (
          <div className="mx-auto flex max-w-6xl flex-col gap-3 border-t border-border/60 px-4 py-2.5 sm:px-6">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex rounded-xl border border-border bg-background p-0.5">
                <button
                  type="button"
                  onClick={() => {
                    setView("files");
                    setSelected(new Set());
                  }}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors",
                    view === "files"
                      ? "bg-brand text-white"
                      : "text-muted hover:text-foreground",
                  )}
                >
                  {c.tabFiles}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setView("pages");
                    setSelected(new Set());
                  }}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors",
                    view === "pages"
                      ? "bg-brand text-white"
                      : "text-muted hover:text-foreground",
                  )}
                >
                  {c.tabPages}
                </button>
              </div>

              <button
                type="button"
                onClick={() => openPicker(null)}
                disabled={busyFiles || sources.length >= PDF_MAX_FILES_MERGE}
                className={toolBtn}
              >
                <Icon icon="mdi:plus" className="h-4 w-4" />
                {c.addMore}
              </button>

              <button
                type="button"
                disabled={past.length === 0}
                onClick={undo}
                aria-label={c.undo}
                title={c.undo}
                className={iconBtn}
              >
                <Icon icon="mdi:undo" className="h-4 w-4" />
              </button>
              <button
                type="button"
                disabled={future.length === 0}
                onClick={redo}
                aria-label={c.redo}
                title={c.redo}
                className={iconBtn}
              >
                <Icon icon="mdi:redo" className="h-4 w-4" />
              </button>

              {view === "pages" ? (
                <>
                  <button
                    type="button"
                    disabled={selectedCount === 0}
                    onClick={() => rotateSelected(-90)}
                    aria-label={c.rotateLeft}
                    title={c.rotateLeft}
                    className={iconBtn}
                  >
                    <Icon icon="mdi:rotate-left" className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    disabled={selectedCount === 0}
                    onClick={() => rotateSelected(90)}
                    aria-label={c.rotateRight}
                    title={c.rotateRight}
                    className={iconBtn}
                  >
                    <Icon icon="mdi:rotate-right" className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    disabled={selectedCount === 0}
                    onClick={duplicateSelected}
                    aria-label={c.duplicate}
                    title={c.duplicate}
                    className={iconBtn}
                  >
                    <Icon icon="mdi:content-copy" className="h-4 w-4" />
                  </button>
                </>
              ) : null}

              <button
                type="button"
                disabled={selectedCount === 0}
                onClick={() => moveSelected("start")}
                aria-label={c.moveToStart}
                title={c.moveToStart}
                className={iconBtn}
              >
                <Icon icon="mdi:arrow-collapse-up" className="h-4 w-4" />
              </button>
              <button
                type="button"
                disabled={selectedCount === 0}
                onClick={() => moveSelected("end")}
                aria-label={c.moveToEnd}
                title={c.moveToEnd}
                className={iconBtn}
              >
                <Icon icon="mdi:arrow-collapse-down" className="h-4 w-4" />
              </button>
              <button
                type="button"
                disabled={pages.length < 2}
                onClick={reverseOrder}
                aria-label={c.reverseOrder}
                title={c.reverseOrder}
                className={iconBtn}
              >
                <Icon icon="mdi:swap-vertical" className="h-4 w-4" />
              </button>

              <button
                type="button"
                disabled={selectedCount === 0}
                onClick={deleteSelected}
                aria-label={c.remove}
                title={c.remove}
                className={cn(iconBtn, "hover:text-danger")}
              >
                <Icon icon="mdi:delete-outline" className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={clearAll}
                className={cn(toolBtn, "text-muted")}
              >
                {c.clearAll}
              </button>

              <label className="ml-auto inline-flex cursor-pointer items-center gap-2 text-sm text-muted">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-[var(--brand)]"
                  checked={
                    view === "files"
                      ? fileOrder.length > 0 &&
                        fileOrder.every((f) => selected.has(f.id))
                      : pages.length > 0 &&
                        pages.every((p) => selected.has(p.id))
                  }
                  onChange={selectAll}
                />
                {c.selectAll}
                {selectedCount > 0 ? (
                  <span className="rounded-md bg-brand-soft px-1.5 py-0.5 text-xs font-semibold text-brand">
                    {selectedCount}
                  </span>
                ) : null}
              </label>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <label
                htmlFor={nameId}
                className="shrink-0 text-sm font-semibold text-foreground"
              >
                {c.fileNameLabel}
              </label>
              <div className="flex min-w-0 flex-1 items-center gap-2">
                <input
                  id={nameId}
                  type="text"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  placeholder={c.fileNamePlaceholder}
                  className="h-10 min-w-0 flex-1 rounded-xl border border-border bg-background px-3 text-sm text-foreground outline-none transition-colors focus:border-brand"
                />
                <span className="hidden shrink-0 text-sm text-muted sm:inline">
                  .pdf
                </span>
              </div>
              <p className="truncate text-xs text-muted sm:max-w-[220px]" title={downloadPreview}>
                {c.fileNamePreview.replace("{name}", downloadPreview)}
              </p>
            </div>
          </div>
        ) : null}
      </div>

      <div
        className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8"
        onDragEnter={(e) => {
          e.preventDefault();
          setZoneOver(true);
        }}
        onDragOver={(e) => e.preventDefault()}
        onDragLeave={() => setZoneOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setZoneOver(false);
          if (e.dataTransfer.files?.length) {
            void ingestFiles(e.dataTransfer.files, insertBeforeRef.current);
          }
        }}
      >
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept="application/pdf,.pdf"
          multiple
          className="sr-only"
          onChange={(e) => {
            if (e.target.files?.length) {
              void ingestFiles(e.target.files, insertBeforeRef.current);
            }
            e.target.value = "";
          }}
        />

        {!hasContent ? (
          <div
            className={cn(
              "flex min-h-[420px] flex-col items-center justify-center rounded-2xl border border-dashed px-6 py-16 text-center transition-colors",
              zoneOver
                ? "border-brand bg-brand-soft/40"
                : "border-border bg-surface",
            )}
          >
            <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-soft text-brand">
              <Icon icon="mdi:file-pdf-box" className="h-7 w-7" />
            </span>
            <p className="mt-5 font-display text-2xl font-semibold text-foreground">
              {c.dropTitle}
            </p>
            <p className="mt-2 max-w-md text-sm text-muted">
              {c.dropHint
                .replace("{max}", String(PDF_MAX_FILES_MERGE))
                .replace("{mb}", String(PDF_MAX_UPLOAD_MB))}
            </p>
            <p className="mt-3 max-w-lg text-sm text-muted">{c.workspaceHint}</p>
            <button
              type="button"
              onClick={() => openPicker(null)}
              disabled={busyFiles}
              className="mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-brand px-6 text-base font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-50"
            >
              {busyFiles ? (
                <Icon icon="mdi:loading" className="h-5 w-5 animate-spin" />
              ) : (
                <Icon icon="mdi:folder-open-outline" className="h-5 w-5" />
              )}
              {c.pickFiles}
            </button>
            <p className="mt-6 inline-flex items-center gap-2 text-xs text-brand">
              <Icon icon="mdi:shield-lock" className="h-3.5 w-3.5" />
              {c.privacyNote}
            </p>
          </div>
        ) : (
          <>
            <p className="mb-5 text-sm text-muted">
              {view === "files" ? c.filesHint : c.pagesHint}
            </p>

            <div className="grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {view === "files"
                ? fileOrder.map((file, index) => {
                    const pageCount = pages.filter(
                      (p) => p.sourceId === file.id,
                    ).length;
                    const firstPageId =
                      pages.find((p) => p.sourceId === file.id)?.id ?? null;
                    return (
                      <GridCell
                        key={file.id}
                        showInsert={index > 0}
                        insertLabel={c.insertHere}
                        onInsert={() => openPicker(firstPageId)}
                      >
                        <FileCard
                          name={file.name}
                          thumbUrl={file.coverThumb}
                          color={file.color}
                          pagesLabel={c.previewPages.replace(
                            "{n}",
                            String(pageCount),
                          )}
                          enlargeLabel={c.enlarge}
                          selected={selected.has(file.id)}
                          dragging={dragId === file.id}
                          dropOver={dropOverId === file.id}
                          onSelect={() => toggleSelect(file.id)}
                          onEnlarge={() => {
                            if (firstPageId) setLightboxPageId(firstPageId);
                          }}
                          onDragStart={() => onDragStart(file.id)}
                          onDragOver={() => setDropOverId(file.id)}
                          onDrop={() => onDropOn(file.id)}
                          onDragEnd={() => {
                            setDragId(null);
                            setDropOverId(null);
                          }}
                        />
                      </GridCell>
                    );
                  })
                : pages.map((page, index) => (
                    <GridCell
                      key={page.id}
                      showInsert={index > 0}
                      insertLabel={c.insertHere}
                      onInsert={() => openPicker(page.id)}
                    >
                      <PageCard
                        name={shortName(page.sourceName)}
                        pageNumber={index + 1}
                        thumbUrl={page.thumbUrl}
                        thumbStatus={page.thumbStatus}
                        color={page.color}
                        rotation={page.rotation}
                        enlargeLabel={c.enlarge}
                        selected={selected.has(page.id)}
                        dragging={dragId === page.id}
                        dropOver={dropOverId === page.id}
                        onSelect={() => toggleSelect(page.id)}
                        onEnlarge={() => setLightboxPageId(page.id)}
                        onDragStart={() => onDragStart(page.id)}
                        onDragOver={() => setDropOverId(page.id)}
                        onDrop={() => onDropOn(page.id)}
                        onDragEnd={() => {
                          setDragId(null);
                          setDropOverId(null);
                        }}
                      />
                    </GridCell>
                  ))}

              <button
                type="button"
                onClick={() => openPicker(null)}
                disabled={busyFiles || sources.length >= PDF_MAX_FILES_MERGE}
                className="flex aspect-[3/4] w-full flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface px-3 text-center transition-colors hover:border-brand/50 hover:bg-brand-soft/30 disabled:opacity-50"
              >
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand-soft text-brand">
                  <Icon icon="mdi:plus" className="h-5 w-5" />
                </span>
                <span className="mt-3 text-xs font-semibold leading-snug text-muted">
                  {c.addTile}
                </span>
              </button>
            </div>
          </>
        )}

        {lightboxPageId ? (
          <PageLightbox
            pages={pages}
            sources={sources}
            pageId={lightboxPageId}
            onClose={() => setLightboxPageId(null)}
            onNavigate={setLightboxPageId}
            labels={{
              close: t.common.close,
              prev: c.lightboxPrev,
              next: c.lightboxNext,
              pageOf: c.lightboxPageOf,
              enlargeHint: c.enlarge,
            }}
          />
        ) : null}

        {error ? (
          <p
            role="alert"
            className="mt-6 rounded-xl border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger"
          >
            {error}
          </p>
        ) : null}

        <p className="mt-8 text-sm text-muted">{c.disclaimer}</p>
        <p className="mt-3">
          <Link
            href={PDF_HUB_PATH}
            className="text-sm font-semibold text-brand hover:underline"
          >
            {c.moreTools}
          </Link>
        </p>
      </div>
    </div>
  );
}

function GridCell({
  children,
  showInsert,
  insertLabel,
  onInsert,
}: {
  children: ReactNode;
  showInsert: boolean;
  insertLabel: string;
  onInsert: () => void;
}) {
  return (
    <div className="group/cell relative">
      {showInsert ? (
        <button
          type="button"
          title={insertLabel}
          aria-label={insertLabel}
          onClick={onInsert}
          className="absolute -left-2 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-brand text-white opacity-0 shadow-md transition-opacity group-hover/cell:opacity-100 focus:opacity-100"
        >
          <Icon icon="mdi:plus" className="h-4 w-4" />
        </button>
      ) : null}
      {children}
    </div>
  );
}

function FileCard(props: {
  name: string;
  thumbUrl: string | null;
  color: string;
  pagesLabel: string;
  enlargeLabel: string;
  selected: boolean;
  dragging: boolean;
  dropOver: boolean;
  onSelect: () => void;
  onEnlarge: () => void;
  onDragStart: () => void;
  onDragOver: () => void;
  onDrop: () => void;
  onDragEnd: () => void;
}) {
  return (
    <div
      draggable
      onDragStart={props.onDragStart}
      onDragOver={(e) => {
        e.preventDefault();
        props.onDragOver();
      }}
      onDrop={(e) => {
        e.preventDefault();
        props.onDrop();
      }}
      onDragEnd={props.onDragEnd}
      className={cn(
        "group/card relative flex h-full w-full cursor-grab flex-col overflow-hidden rounded-xl border bg-surface shadow-sm transition-all active:cursor-grabbing",
        props.selected ? "border-brand ring-2 ring-brand/30" : "border-border",
        props.dragging && "opacity-50",
        props.dropOver && "ring-2 ring-brand",
      )}
    >
      <button
        type="button"
        onClick={props.onSelect}
        className="absolute left-2 top-2 z-10 flex h-5 w-5 items-center justify-center rounded border border-border bg-white"
        aria-pressed={props.selected}
      >
        {props.selected ? (
          <Icon icon="mdi:check" className="h-3.5 w-3.5 text-brand" />
        ) : null}
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          props.onEnlarge();
        }}
        className="absolute right-2 top-2 z-10 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-surface/95 text-brand opacity-100 shadow-sm transition-opacity sm:opacity-0 sm:group-hover/card:opacity-100"
        aria-label={props.enlargeLabel}
        title={props.enlargeLabel}
      >
        <Icon icon="mdi:magnify-plus-outline" className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={props.onEnlarge}
        className="flex aspect-[3/4] w-full items-center justify-center overflow-hidden bg-[#f0f3f2]"
      >
        {props.thumbUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={props.thumbUrl}
            alt=""
            className="max-h-full max-w-full object-contain shadow-sm"
          />
        ) : (
          <Icon icon="mdi:file-pdf-box" className="h-10 w-10 text-muted" />
        )}
      </button>
      <div
        className="truncate px-2 py-1.5 text-center text-[11px] font-semibold text-white"
        style={{ backgroundColor: props.color }}
        title={props.name}
      >
        {shortName(props.name, 18)}
      </div>
      <p className="px-2 py-1.5 text-center text-[11px] text-muted">
        {props.pagesLabel}
      </p>
    </div>
  );
}

function PageCard(props: {
  name: string;
  pageNumber: number;
  thumbUrl: string | null;
  thumbStatus: "pending" | "ready" | "error";
  color: string;
  rotation: Rotation;
  enlargeLabel: string;
  selected: boolean;
  dragging: boolean;
  dropOver: boolean;
  onSelect: () => void;
  onEnlarge: () => void;
  onDragStart: () => void;
  onDragOver: () => void;
  onDrop: () => void;
  onDragEnd: () => void;
}) {
  return (
    <div
      draggable
      onDragStart={props.onDragStart}
      onDragOver={(e) => {
        e.preventDefault();
        props.onDragOver();
      }}
      onDrop={(e) => {
        e.preventDefault();
        props.onDrop();
      }}
      onDragEnd={props.onDragEnd}
      className={cn(
        "group/card relative flex h-full w-full cursor-grab flex-col overflow-hidden rounded-xl border bg-surface shadow-sm transition-all active:cursor-grabbing",
        props.selected ? "border-brand ring-2 ring-brand/30" : "border-border",
        props.dragging && "opacity-50",
        props.dropOver && "ring-2 ring-brand",
      )}
    >
      <button
        type="button"
        onClick={props.onSelect}
        className="absolute left-2 top-2 z-10 flex h-5 w-5 items-center justify-center rounded border border-border bg-white"
        aria-pressed={props.selected}
      >
        {props.selected ? (
          <Icon icon="mdi:check" className="h-3.5 w-3.5 text-brand" />
        ) : null}
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          props.onEnlarge();
        }}
        className="absolute right-2 top-2 z-10 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-surface/95 text-brand opacity-100 shadow-sm transition-opacity sm:opacity-0 sm:group-hover/card:opacity-100"
        aria-label={props.enlargeLabel}
        title={props.enlargeLabel}
      >
        <Icon icon="mdi:magnify-plus-outline" className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={props.onEnlarge}
        className="flex aspect-[3/4] w-full items-center justify-center overflow-hidden bg-[#f0f3f2]"
      >
        {props.thumbUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={props.thumbUrl}
            alt=""
            className="max-h-[88%] max-w-[88%] object-contain shadow-sm transition-transform"
            style={{ transform: `rotate(${props.rotation}deg)` }}
          />
        ) : props.thumbStatus === "error" ? (
          <div className="flex flex-col items-center gap-1 text-muted">
            <Icon icon="mdi:file-pdf-box" className="h-7 w-7" />
            <span className="text-[10px] font-medium">PDF</span>
          </div>
        ) : (
          <Icon
            icon="mdi:loading"
            className="h-6 w-6 animate-spin text-muted"
          />
        )}
      </button>
      <div
        className="truncate px-2 py-1 text-center text-[10px] font-semibold text-white"
        style={{ backgroundColor: props.color }}
        title={props.name}
      >
        {props.name}
      </div>
      <p className="py-1.5 text-center text-xs font-semibold tabular-nums text-foreground">
        {props.pageNumber}
      </p>
    </div>
  );
}
