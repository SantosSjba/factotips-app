"use client";

import Link from "next/link";
import {
  useCallback,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { flushSync } from "react-dom";
import { PageLightbox } from "@/components/pdf/page-lightbox";
import { Icon } from "@/components/ui/icon";
import { buildDividePlan, requestDivide } from "@/lib/pdf/divide-api";
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
import {
  cutsFromEveryN,
  segmentsFromCuts,
  toggleCut,
} from "@/lib/pdf/split";
import { PDF_HUB_PATH, pdfToolLandingPath } from "@/lib/pdf/tools";
import {
  colorForIndex,
  nextRotation,
  pagesFromSource,
  sanitizeDownloadName,
  type PdfSourceFile,
  type PdfWorkspacePage,
} from "@/lib/pdf/workspace";
import { useI18n } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";

type Mode = "split" | "extract";

function isPdfFile(file: File): boolean {
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  return name.endsWith(".pdf") || type.includes("pdf");
}

function shortName(name: string, max = 22): string {
  if (name.length <= max) return name;
  const ext = name.includes(".") ? name.slice(name.lastIndexOf(".")) : "";
  const base = name.slice(0, Math.max(8, max - ext.length - 1));
  return `${base}…${ext}`;
}

export function DividirPdfTool() {
  const { t } = useI18n();
  const c = t.pdfDividir;
  const inputId = useId();
  const nameId = useId();
  const everyId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const insertBeforeRef = useRef<string | null>(null);

  const [sources, setSources] = useState<PdfSourceFile[]>([]);
  const [pages, setPages] = useState<PdfWorkspacePage[]>([]);
  const [past, setPast] = useState<HistorySnapshot<PdfWorkspacePage>[]>([]);
  const [future, setFuture] = useState<HistorySnapshot<PdfWorkspacePage>[]>([]);
  const [mode, setMode] = useState<Mode>("split");
  const [cuts, setCuts] = useState<Set<number>>(new Set());
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [everyNEnabled, setEveryNEnabled] = useState(false);
  const [everyN, setEveryN] = useState(1);
  const [extractAsZip, setExtractAsZip] = useState(false);
  const [zoneOver, setZoneOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [busyFiles, setBusyFiles] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState("documento-dividido");
  const [lightboxPageId, setLightboxPageId] = useState<string | null>(null);

  const effectiveCuts = useMemo(() => {
    if (mode !== "split") return cuts;
    if (everyNEnabled) return cutsFromEveryN(pages.length, everyN);
    return cuts;
  }, [mode, everyNEnabled, everyN, pages.length, cuts]);

  const partCount = useMemo(() => {
    if (mode !== "split" || pages.length === 0) return 0;
    return segmentsFromCuts(pages.length, effectiveCuts).length;
  }, [mode, pages.length, effectiveCuts]);

  const commitPages = useCallback(
    (updater: (prev: PdfWorkspacePage[]) => PdfWorkspacePage[]) => {
      setPages((prev) => {
        const next = updater(prev);
        if (next === prev) return prev;
        setPast((p) => pushHistory(p, { pages: prev }));
        setFuture([]);
        if (next.length !== prev.length) {
          setCuts(
            (cutsPrev) =>
              new Set(
                [...cutsPrev].filter((c) => c >= 0 && c < next.length - 1),
              ),
          );
        }
        return next;
      });
    },
    [],
  );

  const undo = useCallback(() => {
    setPast((p) => {
      if (p.length === 0) return p;
      const previous = p[p.length - 1];
      setFuture((f) => [{ pages }, ...f]);
      setPages(previous.pages);
      return p.slice(0, -1);
    });
    setSelected(new Set());
    setCuts(new Set());
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
    setCuts(new Set());
  }, [pages]);

  const applyThumb = useCallback(
    (
      sourceId: string,
      pageIndex: number,
      thumbUrl: string | null,
      errorThumb?: boolean,
    ) => {
      const status =
        errorThumb || !thumbUrl ? ("error" as const) : ("ready" as const);
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

  const openPicker = (beforePageId: string | null = null) => {
    insertBeforeRef.current = beforePageId;
    inputRef.current?.click();
  };

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
          setCuts(new Set());
        });

        if (fileName === "documento-dividido" && newSources[0]) {
          const stem = newSources[0].name.replace(/\.pdf$/i, "");
          setFileName(stem.slice(0, 80) || "documento-dividido");
        }

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
    const ids = pages.map((p) => p.id);
    const allOn = ids.length > 0 && ids.every((id) => selected.has(id));
    setSelected(allOn ? new Set() : new Set(ids));
  }

  function deleteSelected() {
    if (selected.size === 0) return;
    commitPages((prev) => prev.filter((p) => !selected.has(p.id)));
    setSelected(new Set());
  }

  function rotateSelected(delta: 90 | -90) {
    if (selected.size === 0) return;
    commitPages((prev) =>
      prev.map((p) =>
        selected.has(p.id)
          ? { ...p, rotation: nextRotation(p.rotation, delta) }
          : p,
      ),
    );
  }

  function clearAll() {
    if (!pages.length) return;
    commitPages(() => []);
    setSources([]);
    setSelected(new Set());
  }

  async function handleFinish() {
    if (pages.length === 0 || sources.length === 0) {
      setError(c.errorMinPages);
      return;
    }

    const workPages =
      mode === "extract"
        ? pages.filter((p) => selected.has(p.id))
        : pages;

    if (mode === "extract" && workPages.length === 0) {
      setError(c.errorNeedSelection);
      return;
    }
    if (mode === "split" && partCount < 2) {
      setError(c.errorNeedCuts);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Orden de archivos = orden de primera aparición en el plan de páginas.
      const orderedIds: string[] = [];
      for (const page of workPages) {
        if (!orderedIds.includes(page.sourceId)) orderedIds.push(page.sourceId);
      }
      const orderedSources = orderedIds
        .map((id) => sources.find((s) => s.id === id))
        .filter((s): s is PdfSourceFile => Boolean(s));

      const { files, plan } = buildDividePlan({
        sources: orderedSources,
        pages: workPages,
        cuts: mode === "split" && !everyNEnabled ? [...effectiveCuts] : [],
        every: mode === "split" && everyNEnabled ? everyN : null,
        perPage: mode === "extract" && extractAsZip,
        baseName: fileName,
      });

      await requestDivide({
        mode,
        files,
        plan,
        downloadName: sanitizeDownloadName(fileName).replace(/\.pdf$/i, ""),
      });
    } catch (err) {
      const status = (err as Error & { status?: number }).status;
      const message = err instanceof Error ? err.message : "";
      if (status === 429) setError(c.errorRateLimit);
      else if (status === 503) setError(c.errorNetwork);
      else if (message && message !== "DIVIDE_FAILED") setError(message);
      else setError(c.errorGeneric);
    } finally {
      setLoading(false);
    }
  }

  const hasContent = pages.length > 0;
  const fileCount = useMemo(
    () => new Set(pages.map((p) => p.sourceId)).size,
    [pages],
  );
  const canFinish =
    hasContent &&
    !loading &&
    !busyFiles &&
    (mode === "split" ? partCount >= 2 : selected.size > 0);
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
            href={pdfToolLandingPath("dividir")}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-brand"
          >
            <Icon icon="mdi:arrow-left" className="h-4 w-4" />
            <span className="hidden sm:inline">{c.back}</span>
          </Link>

          <h1 className="inline-flex items-center gap-2 font-display text-lg font-semibold text-foreground sm:text-xl">
            <Icon icon="mdi:call-split" className="h-5 w-5 text-brand" />
            {c.title}
          </h1>

          {hasContent ? (
            <div className="hidden items-center gap-3 text-sm text-muted md:flex">
              <span className="inline-flex items-center gap-1">
                <Icon icon="mdi:file-multiple-outline" className="h-4 w-4" />
                {fileCount}
              </span>
              <span className="inline-flex items-center gap-1">
                <Icon icon="mdi:file-document-outline" className="h-4 w-4" />
                {pages.length}
              </span>
              <span className="inline-flex items-center gap-1">
                <Icon
                  icon={
                    mode === "split"
                      ? "mdi:content-cut"
                      : "mdi:checkbox-marked-outline"
                  }
                  className="h-4 w-4"
                />
                {mode === "split" ? partCount : selected.size}
              </span>
            </div>
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
                  {c.working}
                </>
              ) : (
                <>
                  <Icon icon="mdi:check-circle-outline" className="h-4 w-4" />
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
                    setMode("split");
                    setSelected(new Set());
                  }}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors",
                    mode === "split"
                      ? "bg-brand text-white"
                      : "text-muted hover:text-foreground",
                  )}
                >
                  <Icon icon="mdi:content-cut" className="h-4 w-4" />
                  {c.tabSplit}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode("extract");
                    setCuts(new Set());
                    setEveryNEnabled(false);
                  }}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors",
                    mode === "extract"
                      ? "bg-brand text-white"
                      : "text-muted hover:text-foreground",
                  )}
                >
                  <Icon
                    icon="mdi:checkbox-multiple-marked-outline"
                    className="h-4 w-4"
                  />
                  {c.tabExtract}
                </button>
              </div>

              <button
                type="button"
                onClick={() => openPicker(null)}
                disabled={busyFiles || sources.length >= PDF_MAX_FILES_MERGE}
                className={toolBtn}
              >
                <Icon icon="mdi:file-plus-outline" className="h-4 w-4" />
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
              <button
                type="button"
                disabled={selected.size === 0}
                onClick={deleteSelected}
                aria-label={c.remove}
                title={c.remove}
                className={iconBtn}
              >
                <Icon icon="mdi:delete-outline" className="h-4 w-4" />
              </button>

              {mode === "split" ? (
                <label className="ml-auto flex items-center gap-2 text-sm text-foreground">
                  <Icon
                    icon="mdi:scissors-cutting"
                    className="hidden h-4 w-4 text-brand sm:block"
                  />
                  <input
                    type="checkbox"
                    checked={everyNEnabled}
                    onChange={(e) => {
                      setEveryNEnabled(e.target.checked);
                      if (e.target.checked) setCuts(new Set());
                    }}
                    className="h-4 w-4 rounded border-border accent-[var(--brand)]"
                  />
                  <span>{c.splitEveryLabel}</span>
                  <input
                    id={everyId}
                    type="number"
                    min={1}
                    max={Math.max(1, pages.length - 1)}
                    value={everyN}
                    disabled={!everyNEnabled}
                    onChange={(e) =>
                      setEveryN(Math.max(1, Number(e.target.value) || 1))
                    }
                    className="h-8 w-14 rounded-lg border border-border bg-background px-2 text-center text-sm font-semibold disabled:opacity-40"
                  />
                  <span className="inline-flex items-center gap-1 text-muted">
                    <Icon icon="mdi:book-open-page-variant-outline" className="h-3.5 w-3.5" />
                    {c.splitEveryUnit}
                  </span>
                </label>
              ) : (
                <label className="ml-auto flex items-center gap-2 text-sm text-foreground">
                  <Icon icon="mdi:folder-zip-outline" className="h-4 w-4 text-brand" />
                  <span>{c.extractSplitToggle}</span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={extractAsZip}
                    onClick={() => setExtractAsZip((v) => !v)}
                    className={cn(
                      "relative h-6 w-11 rounded-full transition-colors",
                      extractAsZip ? "bg-brand" : "bg-border",
                    )}
                  >
                    <span
                      className={cn(
                        "absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
                        extractAsZip && "translate-x-5",
                      )}
                    />
                  </button>
                </label>
              )}
            </div>

            <div className="flex flex-wrap items-end gap-3">
              {mode === "extract" ? (
                <label className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
                  <Icon icon="mdi:select-all" className="h-4 w-4 text-brand" />
                  <input
                    type="checkbox"
                    checked={
                      pages.length > 0 &&
                      pages.every((p) => selected.has(p.id))
                    }
                    onChange={selectAll}
                    className="h-4 w-4 rounded border-border accent-[var(--brand)]"
                  />
                  {c.selectAll}
                </label>
              ) : (
                <p className="inline-flex items-start gap-2 text-sm text-muted">
                  <Icon
                    icon="mdi:information-outline"
                    className="mt-0.5 h-4 w-4 shrink-0 text-brand"
                  />
                  <span>{c.splitHint}</span>
                </p>
              )}

              <div className="ml-auto flex flex-wrap items-center gap-2">
                <label
                  htmlFor={nameId}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wide text-muted uppercase"
                >
                  <Icon icon="mdi:form-textbox" className="h-3.5 w-3.5" />
                  {c.fileNameLabel}
                </label>
                <div className="relative">
                  <Icon
                    icon="mdi:file-pdf-box"
                    className="pointer-events-none absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2 text-muted"
                  />
                  <input
                    id={nameId}
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    placeholder={c.fileNamePlaceholder}
                    className="h-9 w-44 rounded-lg border border-border bg-background py-2 pr-3 pl-8 text-sm sm:w-56"
                  />
                </div>
                <button
                  type="button"
                  onClick={clearAll}
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 text-sm font-semibold text-muted transition-colors hover:border-danger/40 hover:text-danger"
                >
                  <Icon icon="mdi:broom" className="h-4 w-4" />
                  {c.clearAll}
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-6 sm:px-6">
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept="application/pdf,.pdf"
          multiple
          className="sr-only"
          onChange={(e) => {
            const before = insertBeforeRef.current;
            void ingestFiles(e.target.files ?? [], before);
            if (inputRef.current) inputRef.current.value = "";
          }}
        />

        {!hasContent ? (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setZoneOver(true);
            }}
            onDragLeave={() => setZoneOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setZoneOver(false);
              void ingestFiles(e.dataTransfer.files);
            }}
            className={cn(
              "flex flex-1 flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-16 text-center transition-colors",
              zoneOver
                ? "border-brand bg-brand-soft/40"
                : "border-border bg-surface/60",
            )}
          >
            <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-soft text-brand">
              <Icon icon="mdi:call-split" className="h-7 w-7" />
            </span>
            <h2 className="mt-5 font-display text-2xl font-semibold text-foreground">
              {c.dropTitle}
            </h2>
            <p className="mt-2 max-w-md text-sm text-muted">
              {c.dropHint
                .replace("{max}", String(PDF_MAX_FILES_MERGE))
                .replace("{mb}", String(PDF_MAX_UPLOAD_MB))}
            </p>
            <p className="mt-3 inline-flex max-w-md items-start gap-2 text-sm text-muted">
              <Icon
                icon="mdi:shield-lock-outline"
                className="mt-0.5 h-4 w-4 shrink-0 text-brand"
              />
              <span>{c.privacyNote}</span>
            </p>
            <button
              type="button"
              disabled={busyFiles}
              onClick={() => openPicker(null)}
              className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand px-5 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-50"
            >
              {busyFiles ? (
                <Icon icon="mdi:loading" className="h-4 w-4 animate-spin" />
              ) : (
                <Icon icon="mdi:file-upload-outline" className="h-4 w-4" />
              )}
              {c.pickFiles}
            </button>
          </div>
        ) : (
          <>
            <p className="mb-4 inline-flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted">
              <Icon
                icon={
                  mode === "split"
                    ? "mdi:content-cut"
                    : "mdi:checkbox-multiple-marked-outline"
                }
                className="h-4 w-4 text-brand"
              />
              <span>{mode === "split" ? c.splitHint : c.extractHint}</span>
              <span className="text-border">·</span>
              <Icon icon="mdi:download-outline" className="h-4 w-4 text-brand" />
              <span>
                {c.fileNamePreview.replace("{name}", downloadPreview)}
              </span>
            </p>

            <div className="grid grid-cols-2 gap-x-1 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {pages.map((page, index) => {
                const isSelected = selected.has(page.id);
                const cutAfter = effectiveCuts.has(index);
                const showScissors =
                  mode === "split" && index < pages.length - 1;

                return (
                  <div key={page.id} className="relative flex items-stretch">
                    <div
                      className={cn(
                        "group relative flex w-full flex-col rounded-xl border bg-background p-2 transition-colors",
                        mode === "extract" && isSelected
                          ? "border-brand bg-brand-soft/30"
                          : "border-border hover:border-brand/40",
                      )}
                    >
                      {mode === "extract" ? (
                        <label className="absolute top-3 left-3 z-10">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelect(page.id)}
                            className="h-4 w-4 rounded border-border accent-[var(--brand)]"
                          />
                        </label>
                      ) : null}

                      <div className="absolute top-2 right-2 z-10 hidden gap-1 group-hover:flex group-focus-within:flex">
                        <button
                          type="button"
                          className={iconBtn}
                          title={c.enlarge}
                          aria-label={c.enlarge}
                          onClick={() => setLightboxPageId(page.id)}
                        >
                          <Icon
                            icon="mdi:magnify-plus-outline"
                            className="h-4 w-4"
                          />
                        </button>
                        <button
                          type="button"
                          className={iconBtn}
                          title={c.rotateLeft}
                          aria-label={c.rotateLeft}
                          onClick={() => {
                            setSelected(new Set([page.id]));
                            commitPages((prev) =>
                              prev.map((p) =>
                                p.id === page.id
                                  ? {
                                      ...p,
                                      rotation: nextRotation(p.rotation, -90),
                                    }
                                  : p,
                              ),
                            );
                          }}
                        >
                          <Icon icon="mdi:rotate-left" className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          className={iconBtn}
                          title={c.rotateRight}
                          aria-label={c.rotateRight}
                          onClick={() => {
                            setSelected(new Set([page.id]));
                            commitPages((prev) =>
                              prev.map((p) =>
                                p.id === page.id
                                  ? {
                                      ...p,
                                      rotation: nextRotation(p.rotation, 90),
                                    }
                                  : p,
                              ),
                            );
                          }}
                        >
                          <Icon icon="mdi:rotate-right" className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          className={iconBtn}
                          title={c.remove}
                          aria-label={c.remove}
                          onClick={() => {
                            commitPages((prev) =>
                              prev.filter((p) => p.id !== page.id),
                            );
                            setSelected((prev) => {
                              const next = new Set(prev);
                              next.delete(page.id);
                              return next;
                            });
                          }}
                        >
                          <Icon icon="mdi:delete-outline" className="h-4 w-4" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (mode === "extract") toggleSelect(page.id);
                          else setLightboxPageId(page.id);
                        }}
                        className="relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-surface"
                      >
                        {page.thumbUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={page.thumbUrl}
                            alt=""
                            className="h-full w-full object-contain"
                            style={{
                              transform: `rotate(${page.rotation}deg)`,
                            }}
                          />
                        ) : (
                          <span className="flex h-full items-center justify-center text-muted">
                            {page.thumbStatus === "error" ? (
                              <Icon
                                icon="mdi:alert-circle-outline"
                                className="h-6 w-6"
                              />
                            ) : (
                              <Icon
                                icon="mdi:loading"
                                className="h-6 w-6 animate-spin"
                              />
                            )}
                          </span>
                        )}
                      </button>

                      <div
                        className="mt-2 truncate rounded-md px-2 py-1 text-xs font-semibold text-white"
                        style={{ backgroundColor: page.color }}
                        title={page.sourceName}
                      >
                        {shortName(page.sourceName)}
                      </div>
                      <p className="mt-1 text-center text-sm font-semibold text-foreground">
                        {page.pageIndex + 1}
                      </p>
                    </div>

                    {mode === "extract" && index < pages.length - 1 ? (
                      <div className="relative z-10 -mx-1 flex w-8 shrink-0 items-center justify-center self-center">
                        <button
                          type="button"
                          title={c.insertHere}
                          aria-label={c.insertHere}
                          disabled={
                            busyFiles || sources.length >= PDF_MAX_FILES_MERGE
                          }
                          onClick={() => openPicker(pages[index + 1]?.id ?? null)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full border-2 border-brand/50 bg-background text-brand shadow-sm transition-colors hover:bg-brand-soft disabled:opacity-40"
                        >
                          <Icon icon="mdi:plus" className="h-4 w-4" />
                        </button>
                      </div>
                    ) : null}

                    {showScissors ? (
                      <div className="relative z-10 -mx-1 flex w-8 shrink-0 items-center justify-center self-center">
                        <button
                          type="button"
                          disabled={everyNEnabled}
                          title={cutAfter ? c.removeCut : c.addCut}
                          aria-label={cutAfter ? c.removeCut : c.addCut}
                          onClick={() =>
                            setCuts((prev) => toggleCut(prev, index))
                          }
                          className={cn(
                            "inline-flex h-8 w-8 items-center justify-center rounded-full border-2 shadow-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50",
                            cutAfter
                              ? "border-brand bg-brand text-white"
                              : "border-brand/50 bg-background text-brand hover:bg-brand-soft",
                          )}
                        >
                          <Icon icon="mdi:content-cut" className="h-4 w-4" />
                        </button>
                        <span
                          className={cn(
                            "pointer-events-none absolute inset-y-8 left-1/2 w-px -translate-x-1/2 border-l-2 border-dashed",
                            cutAfter ? "border-brand" : "border-border",
                          )}
                          aria-hidden
                        />
                      </div>
                    ) : mode === "split" ? (
                      <div className="w-0 sm:w-2" aria-hidden />
                    ) : null}
                  </div>
                );
              })}

              <button
                type="button"
                onClick={() => openPicker(null)}
                disabled={busyFiles || sources.length >= PDF_MAX_FILES_MERGE}
                className="flex min-h-[220px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-surface/40 p-4 text-sm font-semibold text-muted transition-colors hover:border-brand/40 hover:text-brand disabled:opacity-40"
              >
                <Icon icon="mdi:file-plus-outline" className="h-8 w-8" />
                <span className="mt-2">{c.addTile}</span>
              </button>
            </div>

            {mode === "extract" && selected.size > 0 ? (
              <div className="mt-6 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => rotateSelected(-90)}
                  className={toolBtn}
                >
                  <Icon icon="mdi:rotate-left" className="h-4 w-4" />
                  {c.rotateLeft}
                </button>
                <button
                  type="button"
                  onClick={() => rotateSelected(90)}
                  className={toolBtn}
                >
                  <Icon icon="mdi:rotate-right" className="h-4 w-4" />
                  {c.rotateRight}
                </button>
              </div>
            ) : null}
          </>
        )}

        {error ? (
          <p
            role="alert"
            className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          >
            {error}
          </p>
        ) : null}

        <p className="mt-8 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center text-xs text-muted">
          <Icon icon="mdi:shield-check-outline" className="h-3.5 w-3.5" />
          <span>{c.disclaimer}</span>
          <Link
            href={PDF_HUB_PATH}
            className="inline-flex items-center gap-1 font-semibold text-brand hover:underline"
          >
            <Icon icon="mdi:toolbox-outline" className="h-3.5 w-3.5" />
            {c.moreTools}
          </Link>
        </p>
      </div>

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
    </div>
  );
}
