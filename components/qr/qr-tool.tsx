"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Options as QrOptions } from "qr-code-styling";
import { Icon } from "@/components/ui/icon";
import { useI18n } from "@/lib/i18n/provider";
import {
  buildQrPayload,
  QR_SIZES,
  type QrContentType,
  type QrCornerStyle,
  type QrDotStyle,
  type WifiSecurity,
} from "@/lib/qr/payload";
import { TOOL_ROUTES } from "@/lib/seo/tools";
import { cn } from "@/lib/utils";

type QrInstance = {
  update: (opts: Partial<QrOptions>) => void;
  append: (el: HTMLElement) => void;
  download: (opts?: { name?: string; extension?: "png" | "jpeg" | "webp" | "svg" }) => void;
};

const PRESET_COLORS = [
  { fg: "#0d6e63", bg: "#ffffff", label: "Marca" },
  { fg: "#0f1f1c", bg: "#ffffff", label: "Clásico" },
  { fg: "#1a1a1a", bg: "#f4f8f7", label: "Suave" },
  { fg: "#c45c26", bg: "#fff8f3", label: "Acento" },
  { fg: "#ffffff", bg: "#0d6e63", label: "Invertido" },
] as const;

const DOT_STYLES: QrDotStyle[] = [
  "square",
  "rounded",
  "dots",
  "extra-rounded",
  "classy",
  "classy-rounded",
];

export function QrTool() {
  const { t } = useI18n();
  const c = t.qr;
  const previewRef = useRef<HTMLDivElement>(null);
  const qrRef = useRef<QrInstance | null>(null);
  const [ready, setReady] = useState(false);

  const [contentType, setContentType] = useState<QrContentType>("url");
  const [url, setUrl] = useState("https://factosysperu.com");
  const [text, setText] = useState("");
  const [waPhone, setWaPhone] = useState("51999999999");
  const [waMessage, setWaMessage] = useState("Hola, vi tu QR de FactoTips");
  const [wifiSsid, setWifiSsid] = useState("");
  const [wifiPassword, setWifiPassword] = useState("");
  const [wifiSecurity, setWifiSecurity] = useState<WifiSecurity>("WPA");

  const [fg, setFg] = useState("#0d6e63");
  const [bg, setBg] = useState("#ffffff");
  const [size, setSize] = useState<number>(512);
  const [margin, setMargin] = useState(8);
  const [dotStyle, setDotStyle] = useState<QrDotStyle>("rounded");
  const [cornerStyle, setCornerStyle] = useState<QrCornerStyle>("extra-rounded");
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);
  const [logoSize, setLogoSize] = useState(0.22);
  const [logoName, setLogoName] = useState<string | null>(null);

  const payload = buildQrPayload(contentType, {
    text,
    url,
    waPhone,
    waMessage,
    wifiSsid,
    wifiPassword,
    wifiSecurity,
  });
  const canGenerate = payload.length > 0;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { default: QRCodeStyling } = await import("qr-code-styling");
      if (cancelled || !previewRef.current) return;
      previewRef.current.innerHTML = "";
      const instance = new QRCodeStyling({
        width: 280,
        height: 280,
        type: "canvas",
        data: "https://factosysperu.com",
        margin: 8,
        qrOptions: { errorCorrectionLevel: "H" },
        dotsOptions: { color: "#0d6e63", type: "rounded" },
        backgroundOptions: { color: "#ffffff" },
        cornersSquareOptions: { type: "extra-rounded", color: "#0d6e63" },
        cornersDotOptions: { type: "dot", color: "#0d6e63" },
        imageOptions: {
          crossOrigin: "anonymous",
          margin: 6,
          imageSize: 0.22,
          hideBackgroundDots: true,
        },
      }) as unknown as QrInstance;
      instance.append(previewRef.current);
      qrRef.current = instance;
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!ready || !qrRef.current || !canGenerate) return;
    qrRef.current.update({
      width: 280,
      height: 280,
      data: payload,
      margin,
      qrOptions: { errorCorrectionLevel: "H" },
      dotsOptions: { color: fg, type: dotStyle },
      backgroundOptions: { color: bg },
      cornersSquareOptions: { type: cornerStyle, color: fg },
      cornersDotOptions: { type: "dot", color: fg },
      image: logoDataUrl ?? undefined,
      imageOptions: {
        crossOrigin: "anonymous",
        margin: 6,
        imageSize: logoSize,
        hideBackgroundDots: true,
      },
    });
  }, [
    ready,
    canGenerate,
    payload,
    fg,
    bg,
    margin,
    dotStyle,
    cornerStyle,
    logoDataUrl,
    logoSize,
  ]);

  function onLogoChange(file: File | null) {
    if (!file) {
      setLogoDataUrl(null);
      setLogoName(null);
      return;
    }
    if (!file.type.startsWith("image/")) return;
    if (file.size > 2 * 1024 * 1024) return;
    const reader = new FileReader();
    reader.onload = () => {
      setLogoDataUrl(String(reader.result));
      setLogoName(file.name);
    };
    reader.readAsDataURL(file);
  }

  async function download(ext: "png" | "svg") {
    if (!qrRef.current || !canGenerate) return;
    // Render at chosen export size temporarily
    qrRef.current.update({ width: size, height: size });
    qrRef.current.download({ name: "factotips-qr", extension: ext });
    // Restore preview size
    window.setTimeout(() => {
      qrRef.current?.update({ width: 280, height: 280 });
    }, 100);
  }

  const typeTabs: { id: QrContentType; label: string; icon: string }[] = [
    { id: "url", label: c.typeUrl, icon: "mdi:link-variant" },
    { id: "text", label: c.typeText, icon: "mdi:text" },
    { id: "whatsapp", label: c.typeWhatsapp, icon: "mdi:whatsapp" },
    { id: "wifi", label: c.typeWifi, icon: "mdi:wifi" },
  ];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <Link
        href={TOOL_ROUTES.qr.landingPath}
        className="inline-flex items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-brand"
      >
        <Icon icon="mdi:arrow-left" className="h-4 w-4" />
        {c.back}
      </Link>

      <header className="mt-6 max-w-3xl animate-fade-up">
        <p className="text-sm font-semibold tracking-[0.16em] text-brand uppercase">
          {c.eyebrow}
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {c.title}
        </h1>
        <p className="mt-3 text-base leading-relaxed text-muted sm:text-lg">
          {c.subtitle}
        </p>
        <p className="mt-3 inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand-soft px-3 py-1.5 text-xs font-semibold text-brand">
          <Icon icon="mdi:shield-lock-outline" className="h-4 w-4" />
          {c.privacyBadge}
        </p>
      </header>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)] lg:items-start">
        <div className="space-y-5 animate-fade-up animation-delay-1">
          <section className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
            <h2 className="text-sm font-semibold text-foreground">{c.contentTitle}</h2>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {typeTabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setContentType(tab.id)}
                  className={cn(
                    "inline-flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-sm font-semibold transition-all",
                    contentType === tab.id
                      ? "border-brand bg-brand text-white"
                      : "border-border bg-background hover:border-brand/40",
                  )}
                >
                  <Icon icon={tab.icon} className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="mt-4 space-y-3">
              {contentType === "url" ? (
                <Field
                  label={c.urlLabel}
                  value={url}
                  onChange={setUrl}
                  placeholder="https://tu-negocio.com"
                />
              ) : null}
              {contentType === "text" ? (
                <label className="block">
                  <span className="text-xs font-semibold text-muted">{c.textLabel}</span>
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    rows={4}
                    placeholder={c.textPlaceholder}
                    className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-brand"
                  />
                </label>
              ) : null}
              {contentType === "whatsapp" ? (
                <>
                  <Field
                    label={c.waPhoneLabel}
                    value={waPhone}
                    onChange={setWaPhone}
                    placeholder="51999999999"
                    hint={c.waPhoneHint}
                  />
                  <Field
                    label={c.waMessageLabel}
                    value={waMessage}
                    onChange={setWaMessage}
                    placeholder={c.waMessagePlaceholder}
                  />
                </>
              ) : null}
              {contentType === "wifi" ? (
                <>
                  <Field
                    label={c.wifiSsidLabel}
                    value={wifiSsid}
                    onChange={setWifiSsid}
                    placeholder="Mi_Red_WiFi"
                  />
                  <Field
                    label={c.wifiPassLabel}
                    value={wifiPassword}
                    onChange={setWifiPassword}
                    placeholder="••••••••"
                  />
                  <label className="block">
                    <span className="text-xs font-semibold text-muted">
                      {c.wifiSecurityLabel}
                    </span>
                    <select
                      value={wifiSecurity}
                      onChange={(e) =>
                        setWifiSecurity(e.target.value as WifiSecurity)
                      }
                      className="mt-1 h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-brand"
                    >
                      <option value="WPA">WPA / WPA2</option>
                      <option value="WEP">WEP</option>
                      <option value="nopass">{c.wifiOpen}</option>
                    </select>
                  </label>
                </>
              ) : null}
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
            <h2 className="text-sm font-semibold text-foreground">{c.styleTitle}</h2>

            <p className="mt-3 text-xs font-semibold tracking-wide text-muted uppercase">
              {c.presetsLabel}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {PRESET_COLORS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => {
                    setFg(p.fg);
                    setBg(p.bg);
                  }}
                  className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-xs font-semibold transition-colors hover:border-brand/40"
                >
                  <span
                    className="h-4 w-4 rounded-full border border-black/10"
                    style={{ background: `linear-gradient(135deg, ${p.fg} 50%, ${p.bg} 50%)` }}
                  />
                  {p.label}
                </button>
              ))}
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="text-xs font-semibold text-muted">{c.fgLabel}</span>
                <div className="mt-1 flex items-center gap-2">
                  <input
                    type="color"
                    value={fg}
                    onChange={(e) => setFg(e.target.value)}
                    className="h-10 w-12 cursor-pointer rounded-lg border border-border bg-background p-1"
                  />
                  <input
                    type="text"
                    value={fg}
                    onChange={(e) => setFg(e.target.value)}
                    className="h-10 flex-1 rounded-xl border border-border bg-background px-3 font-mono text-sm outline-none focus:border-brand"
                  />
                </div>
              </label>
              <label className="block">
                <span className="text-xs font-semibold text-muted">{c.bgLabel}</span>
                <div className="mt-1 flex items-center gap-2">
                  <input
                    type="color"
                    value={bg}
                    onChange={(e) => setBg(e.target.value)}
                    className="h-10 w-12 cursor-pointer rounded-lg border border-border bg-background p-1"
                  />
                  <input
                    type="text"
                    value={bg}
                    onChange={(e) => setBg(e.target.value)}
                    className="h-10 flex-1 rounded-xl border border-border bg-background px-3 font-mono text-sm outline-none focus:border-brand"
                  />
                </div>
              </label>
            </div>

            <p className="mt-4 text-xs font-semibold tracking-wide text-muted uppercase">
              {c.dotsLabel}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {DOT_STYLES.map((style) => (
                <button
                  key={style}
                  type="button"
                  onClick={() => setDotStyle(style)}
                  className={cn(
                    "rounded-lg border px-2.5 py-1.5 text-xs font-semibold capitalize transition-colors",
                    dotStyle === style
                      ? "border-brand bg-brand-soft text-brand"
                      : "border-border hover:border-brand/40",
                  )}
                >
                  {style.replace("-", " ")}
                </button>
              ))}
            </div>

            <p className="mt-4 text-xs font-semibold tracking-wide text-muted uppercase">
              {c.cornersLabel}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {(
                [
                  { id: "square" as const, label: c.cornerSquare },
                  { id: "dot" as const, label: c.cornerDot },
                  { id: "extra-rounded" as const, label: c.cornerRounded },
                ] as const
              ).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setCornerStyle(item.id)}
                  className={cn(
                    "rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors",
                    cornerStyle === item.id
                      ? "border-brand bg-brand-soft text-brand"
                      : "border-border hover:border-brand/40",
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="text-xs font-semibold text-muted">{c.sizeLabel}</span>
                <select
                  value={size}
                  onChange={(e) => setSize(Number(e.target.value))}
                  className="mt-1 h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-brand"
                >
                  {QR_SIZES.map((s) => (
                    <option key={s} value={s}>
                      {s}×{s} px
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-xs font-semibold text-muted">
                  {c.marginLabel}: {margin}
                </span>
                <input
                  type="range"
                  min={0}
                  max={24}
                  value={margin}
                  onChange={(e) => setMargin(Number(e.target.value))}
                  className="mt-3 w-full accent-[var(--brand)]"
                />
              </label>
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
            <h2 className="text-sm font-semibold text-foreground">{c.logoTitle}</h2>
            <p className="mt-1 text-sm text-muted">{c.logoHint}</p>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl border border-brand/30 bg-brand-soft px-4 text-sm font-semibold text-brand transition-colors hover:border-brand">
                <Icon icon="mdi:image-plus" className="h-4 w-4" />
                {c.logoUpload}
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  className="hidden"
                  onChange={(e) => onLogoChange(e.target.files?.[0] ?? null)}
                />
              </label>
              {logoDataUrl ? (
                <button
                  type="button"
                  onClick={() => onLogoChange(null)}
                  className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-border px-3 text-sm font-semibold text-muted hover:text-danger"
                >
                  <Icon icon="mdi:close" className="h-4 w-4" />
                  {c.logoRemove}
                </button>
              ) : null}
            </div>
            {logoName ? (
              <p className="mt-2 text-xs text-muted">{logoName}</p>
            ) : null}

            {logoDataUrl ? (
              <label className="mt-4 block">
                <span className="text-xs font-semibold text-muted">
                  {c.logoSizeLabel}: {Math.round(logoSize * 100)}%
                </span>
                <input
                  type="range"
                  min={12}
                  max={32}
                  value={Math.round(logoSize * 100)}
                  onChange={(e) => setLogoSize(Number(e.target.value) / 100)}
                  className="mt-2 w-full accent-[var(--brand)]"
                />
              </label>
            ) : null}
          </section>
        </div>

        {/* Preview sticky */}
        <aside className="animate-fade-up animation-delay-2 lg:sticky lg:top-24">
          <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
            <h2 className="text-sm font-semibold text-foreground">{c.previewTitle}</h2>
            <div
              className="relative mt-4 flex min-h-[300px] items-center justify-center rounded-2xl border border-dashed border-border bg-background p-4"
              style={{ backgroundColor: canGenerate ? bg : undefined }}
            >
              {!canGenerate ? (
                <p className="absolute inset-0 z-10 flex items-center justify-center bg-background/90 px-4 text-center text-sm text-muted">
                  {c.previewEmpty}
                </p>
              ) : null}
              <div
                ref={previewRef}
                className={cn(
                  "[&_canvas]:max-w-full",
                  !canGenerate && "invisible",
                )}
              />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={!canGenerate || !ready}
                onClick={() => download("png")}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Icon icon="mdi:download" className="h-4 w-4" />
                {c.downloadPng}
              </button>
              <button
                type="button"
                disabled={!canGenerate || !ready}
                onClick={() => download("svg")}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-border text-sm font-semibold text-foreground transition-colors hover:border-brand/40 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Icon icon="mdi:vector-square" className="h-4 w-4" />
                {c.downloadSvg}
              </button>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-muted">{c.exportHint}</p>
          </div>
          <p className="mt-4 text-xs leading-relaxed text-muted">{c.disclaimer}</p>
        </aside>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-muted">{label}</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-brand"
        autoComplete="off"
      />
      {hint ? <span className="mt-1 block text-[11px] text-muted">{hint}</span> : null}
    </label>
  );
}
