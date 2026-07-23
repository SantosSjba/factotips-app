"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Options as QrOptions } from "qr-code-styling";
import { Icon } from "@/components/ui/icon";
import { Select, fieldControlClass } from "@/components/ui/select";
import { useI18n } from "@/lib/i18n/provider";
import {
  buildQrPayload,
  QR_CONTENT_TYPES,
  QR_SIZES,
  type QrContentType,
  type QrCornerStyle,
  type QrDotStyle,
  type SocialNetwork,
  type WifiSecurity,
} from "@/lib/qr/payload";
import { TOOL_ROUTES } from "@/lib/seo/tools";
import { cn } from "@/lib/utils";

type QrInstance = {
  update: (opts: Partial<QrOptions>) => void | Promise<void>;
  append: (el: HTMLElement) => void;
  download: (opts?: {
    name?: string;
    extension?: "png" | "jpeg" | "webp" | "svg";
  }) => void | Promise<void>;
};

const PRESET_COLORS = [
  { id: "brand" as const, fg: "#0d6e63", bg: "#ffffff" },
  { id: "classic" as const, fg: "#0f1f1c", bg: "#ffffff" },
  { id: "soft" as const, fg: "#1a1a1a", bg: "#f4f8f7" },
  { id: "accent" as const, fg: "#c45c26", bg: "#fff8f3" },
  { id: "inverted" as const, fg: "#ffffff", bg: "#0d6e63" },
] as const;

const DOT_STYLES: QrDotStyle[] = [
  "square",
  "rounded",
  "dots",
  "extra-rounded",
  "classy",
  "classy-rounded",
];

const TYPE_ICONS: Record<QrContentType, string> = {
  url: "mdi:link-variant",
  text: "mdi:text",
  email: "mdi:email-outline",
  phone: "mdi:phone",
  sms: "mdi:message-text-outline",
  vcard: "mdi:card-account-details-outline",
  whatsapp: "mdi:whatsapp",
  wifi: "mdi:wifi",
  event: "mdi:calendar-month-outline",
  social: "mdi:share-variant-outline",
};

export function QrTool() {
  const { t } = useI18n();
  const c = t.qr;
  const previewRef = useRef<HTMLDivElement>(null);
  const qrRef = useRef<QrInstance | null>(null);
  const [ready, setReady] = useState(false);

  const [contentType, setContentType] = useState<QrContentType>("url");
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");
  const [emailTo, setEmailTo] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [phone, setPhone] = useState("");
  const [smsPhone, setSmsPhone] = useState("");
  const [smsBody, setSmsBody] = useState("");
  const [vcardFirstName, setVcardFirstName] = useState("");
  const [vcardLastName, setVcardLastName] = useState("");
  const [vcardOrg, setVcardOrg] = useState("");
  const [vcardPhone, setVcardPhone] = useState("");
  const [vcardEmail, setVcardEmail] = useState("");
  const [vcardUrl, setVcardUrl] = useState("");
  const [waPhone, setWaPhone] = useState("");
  const [waMessage, setWaMessage] = useState("");
  const [wifiSsid, setWifiSsid] = useState("");
  const [wifiPassword, setWifiPassword] = useState("");
  const [wifiSecurity, setWifiSecurity] = useState<WifiSecurity>("WPA");
  const [wifiHidden, setWifiHidden] = useState(false);
  const [eventTitle, setEventTitle] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [eventStart, setEventStart] = useState("");
  const [eventEnd, setEventEnd] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [socialNetwork, setSocialNetwork] = useState<SocialNetwork>("instagram");
  const [socialHandle, setSocialHandle] = useState("");
  const [socialUrl, setSocialUrl] = useState("");

  const [fg, setFg] = useState("#0d6e63");
  const [bg, setBg] = useState("#ffffff");
  const [size, setSize] = useState<number>(512);
  const [margin, setMargin] = useState(8);
  const [dotStyle, setDotStyle] = useState<QrDotStyle>("rounded");
  const [cornerStyle, setCornerStyle] = useState<QrCornerStyle>("extra-rounded");
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);
  const [logoSize, setLogoSize] = useState(0.22);
  const [logoName, setLogoName] = useState<string | null>(null);
  const [logoError, setLogoError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  const payload = buildQrPayload(contentType, {
    text,
    url,
    emailTo,
    emailSubject,
    emailBody,
    phone,
    smsPhone,
    smsBody,
    vcardFirstName,
    vcardLastName,
    vcardOrg,
    vcardPhone,
    vcardEmail,
    vcardUrl,
    waPhone,
    waMessage,
    wifiSsid,
    wifiPassword,
    wifiSecurity,
    wifiHidden,
    eventTitle,
    eventLocation,
    eventStart,
    eventEnd,
    eventDescription,
    socialNetwork,
    socialHandle,
    socialUrl,
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
      setLogoError(null);
      return;
    }
    if (!file.type.startsWith("image/")) {
      setLogoError(c.logoErrorType);
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setLogoError(c.logoErrorSize);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setLogoDataUrl(String(reader.result));
      setLogoName(file.name);
      setLogoError(null);
    };
    reader.onerror = () => {
      setLogoError(c.logoErrorType);
    };
    reader.readAsDataURL(file);
  }

  async function download(ext: "png" | "svg") {
    const qr = qrRef.current;
    if (!qr || !canGenerate || downloading) return;
    setDownloading(true);
    try {
      await Promise.resolve(qr.update({ width: size, height: size }));
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      });
      await Promise.resolve(
        qr.download({ name: "factotips-qr", extension: ext }),
      );
    } finally {
      await Promise.resolve(qr.update({ width: 280, height: 280 }));
      setDownloading(false);
    }
  }

  const typeLabels: Record<QrContentType, string> = {
    url: c.typeUrl,
    text: c.typeText,
    email: c.typeEmail,
    phone: c.typePhone,
    sms: c.typeSms,
    vcard: c.typeVcard,
    whatsapp: c.typeWhatsapp,
    wifi: c.typeWifi,
    event: c.typeEvent,
    social: c.typeSocial,
  };

  const typeTabs = QR_CONTENT_TYPES.map((id) => ({
    id,
    label: typeLabels[id],
    icon: TYPE_ICONS[id],
  }));

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
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5">
              {typeTabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setContentType(tab.id)}
                  className={cn(
                    "inline-flex flex-col items-center justify-center gap-1.5 rounded-xl border px-2 py-3 text-xs font-semibold transition-all sm:text-sm",
                    contentType === tab.id
                      ? "border-brand bg-brand text-white shadow-sm"
                      : "border-border bg-background hover:border-brand/40",
                  )}
                >
                  <Icon icon={tab.icon} className="h-5 w-5" />
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
                  placeholder={c.urlPlaceholder}
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
                    className={cn(fieldControlClass, "mt-1")}
                    autoComplete="off"
                  />
                </label>
              ) : null}
              {contentType === "email" ? (
                <>
                  <Field
                    label={c.emailToLabel}
                    value={emailTo}
                    onChange={setEmailTo}
                    placeholder={c.emailToPlaceholder}
                  />
                  <Field
                    label={c.emailSubjectLabel}
                    value={emailSubject}
                    onChange={setEmailSubject}
                    placeholder={c.emailSubjectPlaceholder}
                  />
                  <label className="block">
                    <span className="text-xs font-semibold text-muted">
                      {c.emailBodyLabel}
                    </span>
                    <textarea
                      value={emailBody}
                      onChange={(e) => setEmailBody(e.target.value)}
                      rows={3}
                      className={cn(fieldControlClass, "mt-1")}
                    />
                  </label>
                </>
              ) : null}
              {contentType === "phone" ? (
                <Field
                  label={c.phoneLabel}
                  value={phone}
                  onChange={setPhone}
                  placeholder={c.phonePlaceholder}
                  hint={c.phoneHint}
                />
              ) : null}
              {contentType === "sms" ? (
                <>
                  <Field
                    label={c.smsPhoneLabel}
                    value={smsPhone}
                    onChange={setSmsPhone}
                    placeholder={c.phonePlaceholder}
                    hint={c.phoneHint}
                  />
                  <label className="block">
                    <span className="text-xs font-semibold text-muted">
                      {c.smsBodyLabel}
                    </span>
                    <textarea
                      value={smsBody}
                      onChange={(e) => setSmsBody(e.target.value)}
                      rows={3}
                      className={cn(fieldControlClass, "mt-1")}
                    />
                  </label>
                </>
              ) : null}
              {contentType === "vcard" ? (
                <>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field
                      label={c.vcardFirstNameLabel}
                      value={vcardFirstName}
                      onChange={setVcardFirstName}
                      placeholder={c.vcardFirstNamePlaceholder}
                    />
                    <Field
                      label={c.vcardLastNameLabel}
                      value={vcardLastName}
                      onChange={setVcardLastName}
                      placeholder={c.vcardLastNamePlaceholder}
                    />
                  </div>
                  <Field
                    label={c.vcardOrgLabel}
                    value={vcardOrg}
                    onChange={setVcardOrg}
                    placeholder={c.vcardOrgPlaceholder}
                  />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field
                      label={c.vcardPhoneLabel}
                      value={vcardPhone}
                      onChange={setVcardPhone}
                      placeholder={c.phonePlaceholder}
                    />
                    <Field
                      label={c.vcardEmailLabel}
                      value={vcardEmail}
                      onChange={setVcardEmail}
                      placeholder={c.vcardEmailPlaceholder}
                    />
                  </div>
                  <Field
                    label={c.vcardUrlLabel}
                    value={vcardUrl}
                    onChange={setVcardUrl}
                    placeholder={c.urlPlaceholder}
                  />
                </>
              ) : null}
              {contentType === "whatsapp" ? (
                <>
                  <Field
                    label={c.waPhoneLabel}
                    value={waPhone}
                    onChange={setWaPhone}
                    placeholder={c.waPhonePlaceholder}
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
                    placeholder={c.wifiSsidPlaceholder}
                  />
                  <div>
                    <label
                      className="text-xs font-semibold text-muted"
                      htmlFor="qr-wifi-security"
                    >
                      {c.wifiSecurityLabel}
                    </label>
                    <Select
                      id="qr-wifi-security"
                      className="mt-1"
                      value={wifiSecurity}
                      onChange={(e) =>
                        setWifiSecurity(e.target.value as WifiSecurity)
                      }
                    >
                      <option value="WPA">WPA / WPA2</option>
                      <option value="WEP">WEP</option>
                      <option value="nopass">{c.wifiOpen}</option>
                    </Select>
                  </div>
                  {wifiSecurity !== "nopass" ? (
                    <Field
                      label={c.wifiPassLabel}
                      value={wifiPassword}
                      onChange={setWifiPassword}
                      placeholder="••••••••"
                      hint={
                        !wifiPassword.trim() ? c.wifiPassRequired : undefined
                      }
                    />
                  ) : null}
                  <label className="flex items-center gap-2 text-sm text-foreground">
                    <input
                      type="checkbox"
                      checked={wifiHidden}
                      onChange={(e) => setWifiHidden(e.target.checked)}
                      className="h-4 w-4 accent-[var(--brand)]"
                    />
                    {c.wifiHiddenLabel}
                  </label>
                </>
              ) : null}
              {contentType === "event" ? (
                <>
                  <Field
                    label={c.eventTitleLabel}
                    value={eventTitle}
                    onChange={setEventTitle}
                    placeholder={c.eventTitlePlaceholder}
                  />
                  <Field
                    label={c.eventLocationLabel}
                    value={eventLocation}
                    onChange={setEventLocation}
                    placeholder={c.eventLocationPlaceholder}
                  />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="block">
                      <span className="text-xs font-semibold text-muted">
                        {c.eventStartLabel}
                      </span>
                      <input
                        type="datetime-local"
                        value={eventStart}
                        onChange={(e) => setEventStart(e.target.value)}
                        className={cn(fieldControlClass, "mt-1")}
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs font-semibold text-muted">
                        {c.eventEndLabel}
                      </span>
                      <input
                        type="datetime-local"
                        value={eventEnd}
                        onChange={(e) => setEventEnd(e.target.value)}
                        className={cn(fieldControlClass, "mt-1")}
                      />
                    </label>
                  </div>
                  <label className="block">
                    <span className="text-xs font-semibold text-muted">
                      {c.eventDescriptionLabel}
                    </span>
                    <textarea
                      value={eventDescription}
                      onChange={(e) => setEventDescription(e.target.value)}
                      rows={3}
                      className={cn(fieldControlClass, "mt-1")}
                    />
                  </label>
                </>
              ) : null}
              {contentType === "social" ? (
                <>
                  <div>
                    <label
                      className="text-xs font-semibold text-muted"
                      htmlFor="qr-social-network"
                    >
                      {c.socialNetworkLabel}
                    </label>
                    <Select
                      id="qr-social-network"
                      className="mt-1"
                      value={socialNetwork}
                      onChange={(e) =>
                        setSocialNetwork(e.target.value as SocialNetwork)
                      }
                    >
                      <option value="instagram">{c.socialInstagram}</option>
                      <option value="facebook">{c.socialFacebook}</option>
                      <option value="tiktok">{c.socialTiktok}</option>
                      <option value="x">{c.socialX}</option>
                      <option value="linkedin">{c.socialLinkedin}</option>
                      <option value="youtube">{c.socialYoutube}</option>
                      <option value="other">{c.socialOther}</option>
                    </Select>
                  </div>
                  {socialNetwork === "other" ? (
                    <Field
                      label={c.socialUrlLabel}
                      value={socialUrl}
                      onChange={setSocialUrl}
                      placeholder={c.urlPlaceholder}
                    />
                  ) : (
                    <Field
                      label={c.socialHandleLabel}
                      value={socialHandle}
                      onChange={setSocialHandle}
                      placeholder={c.socialHandlePlaceholder}
                      hint={c.socialHandleHint}
                    />
                  )}
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
              {PRESET_COLORS.map((p) => {
                const presetLabels = {
                  brand: c.presetBrand,
                  classic: c.presetClassic,
                  soft: c.presetSoft,
                  accent: c.presetAccent,
                  inverted: c.presetInverted,
                } as const;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setFg(p.fg);
                      setBg(p.bg);
                    }}
                    className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-xs font-semibold transition-colors hover:border-brand/40"
                  >
                    <span
                      className="h-4 w-4 rounded-full border border-black/10"
                      style={{
                        background: `linear-gradient(135deg, ${p.fg} 50%, ${p.bg} 50%)`,
                      }}
                    />
                    {presetLabels[p.id]}
                  </button>
                );
              })}
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
                    className={cn(fieldControlClass, "font-mono")}
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
                    className={cn(fieldControlClass, "font-mono")}
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
              <div>
                <label
                  className="text-xs font-semibold text-muted"
                  htmlFor="qr-export-size"
                >
                  {c.sizeLabel}
                </label>
                <Select
                  id="qr-export-size"
                  className="mt-1"
                  value={size}
                  onChange={(e) => setSize(Number(e.target.value))}
                >
                  {QR_SIZES.map((s) => (
                    <option key={s} value={s}>
                      {s}×{s} px
                    </option>
                  ))}
                </Select>
              </div>
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
            {logoError ? (
              <p className="mt-2 text-xs font-medium text-danger" role="alert">
                {logoError}
              </p>
            ) : null}
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
                disabled={!canGenerate || !ready || downloading}
                onClick={() => download("png")}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Icon icon="mdi:download" className="h-4 w-4" />
                {c.downloadPng}
              </button>
              <button
                type="button"
                disabled={!canGenerate || !ready || downloading}
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
        className={cn(fieldControlClass, "mt-1")}
        autoComplete="off"
      />
      {hint ? <span className="mt-1 block text-[11px] text-muted">{hint}</span> : null}
    </label>
  );
}
