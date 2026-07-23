/** Helpers para payload de QR (cliente). */

export type QrContentType =
  | "url"
  | "text"
  | "email"
  | "phone"
  | "sms"
  | "vcard"
  | "whatsapp"
  | "wifi"
  | "event"
  | "social";

export type WifiSecurity = "WPA" | "WEP" | "nopass";

export type SocialNetwork =
  | "instagram"
  | "facebook"
  | "tiktok"
  | "x"
  | "linkedin"
  | "youtube"
  | "other";

export type QrDotStyle =
  | "square"
  | "dots"
  | "rounded"
  | "extra-rounded"
  | "classy"
  | "classy-rounded";

export type QrCornerStyle = "square" | "dot" | "extra-rounded";

export type QrPayloadFields = {
  text: string;
  url: string;
  emailTo: string;
  emailSubject: string;
  emailBody: string;
  phone: string;
  smsPhone: string;
  smsBody: string;
  vcardFirstName: string;
  vcardLastName: string;
  vcardOrg: string;
  vcardPhone: string;
  vcardEmail: string;
  vcardUrl: string;
  waPhone: string;
  waMessage: string;
  wifiSsid: string;
  wifiPassword: string;
  wifiSecurity: WifiSecurity;
  wifiHidden: boolean;
  eventTitle: string;
  eventLocation: string;
  eventStart: string;
  eventEnd: string;
  eventDescription: string;
  socialNetwork: SocialNetwork;
  socialHandle: string;
  socialUrl: string;
};

function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

function ensureHttpUrl(raw: string): string {
  const u = raw.trim();
  if (!u) return "";
  if (/^https?:\/\//i.test(u)) return u;
  return `https://${u}`;
}

export function buildEmailPayload(
  to: string,
  subject: string,
  body: string,
): string {
  const email = to.trim();
  if (!email) return "";
  const params = new URLSearchParams();
  if (subject.trim()) params.set("subject", subject.trim());
  if (body.trim()) params.set("body", body.trim());
  const qs = params.toString();
  return qs ? `mailto:${email}?${qs}` : `mailto:${email}`;
}

export function buildPhonePayload(phoneRaw: string): string {
  const digits = digitsOnly(phoneRaw);
  return digits ? `tel:+${digits}` : "";
}

export function buildSmsPayload(phoneRaw: string, body: string): string {
  const digits = digitsOnly(phoneRaw);
  if (!digits) return "";
  const text = body.trim();
  // Compatible con iOS/Android: sms:+digits?body=
  return text
    ? `sms:+${digits}?body=${encodeURIComponent(text)}`
    : `sms:+${digits}`;
}

export function buildVCardPayload(opts: {
  firstName: string;
  lastName: string;
  org: string;
  phone: string;
  email: string;
  url: string;
}): string {
  const first = opts.firstName.trim();
  const last = opts.lastName.trim();
  const org = opts.org.trim();
  const phone = digitsOnly(opts.phone);
  const email = opts.email.trim();
  const url = ensureHttpUrl(opts.url);
  if (!first && !last && !org && !phone && !email && !url) return "";

  const fullName = [first, last].filter(Boolean).join(" ") || org || email;
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${last};${first};;;`,
    `FN:${fullName}`,
  ];
  if (org) lines.push(`ORG:${org}`);
  if (phone) lines.push(`TEL;TYPE=CELL:+${phone}`);
  if (email) lines.push(`EMAIL:${email}`);
  if (url) lines.push(`URL:${url}`);
  lines.push("END:VCARD");
  return lines.join("\n");
}

/** Convierte datetime-local (YYYY-MM-DDTHH:mm) a UTC compacto YYYYMMDDTHHMMSSZ */
function toIcsUtc(localValue: string): string | null {
  const trimmed = localValue.trim();
  if (!trimmed) return null;
  const d = new Date(trimmed);
  if (Number.isNaN(d.getTime())) return null;
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}` +
    `T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`
  );
}

export function buildEventPayload(opts: {
  title: string;
  location: string;
  start: string;
  end: string;
  description: string;
}): string {
  const title = opts.title.trim();
  const start = toIcsUtc(opts.start);
  if (!title || !start) return "";
  const end = toIcsUtc(opts.end) ?? start;
  const esc = (v: string) =>
    v
      .replace(/\\/g, "\\\\")
      .replace(/;/g, "\\;")
      .replace(/,/g, "\\,")
      .replace(/\n/g, "\\n");
  const stamp = (() => {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    return (
      `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}` +
      `T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`
    );
  })();
  const uid = `factotips-${start}-${Math.abs(
    Array.from(title).reduce((a, ch) => a + ch.charCodeAt(0), 0),
  )}@factotips.app`;
  const eventLines = [
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${stamp}`,
    `SUMMARY:${esc(title)}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
  ];
  if (opts.location.trim()) {
    eventLines.push(`LOCATION:${esc(opts.location.trim())}`);
  }
  if (opts.description.trim()) {
    eventLines.push(`DESCRIPTION:${esc(opts.description.trim())}`);
  }
  eventLines.push("END:VEVENT");
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//FactoTips//QR Generator//ES",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    ...eventLines,
    "END:VCALENDAR",
  ].join("\n");
}

export function buildSocialPayload(
  network: SocialNetwork,
  handle: string,
  customUrl: string,
): string {
  if (network === "other") return ensureHttpUrl(customUrl);

  const h = handle.trim().replace(/^@/, "");
  if (!h && customUrl.trim()) return ensureHttpUrl(customUrl);
  if (!h) return "";

  switch (network) {
    case "instagram":
      return `https://instagram.com/${encodeURIComponent(h)}`;
    case "facebook":
      return `https://facebook.com/${encodeURIComponent(h)}`;
    case "tiktok":
      return `https://www.tiktok.com/@${encodeURIComponent(h)}`;
    case "x":
      return `https://x.com/${encodeURIComponent(h)}`;
    case "linkedin":
      return `https://www.linkedin.com/in/${encodeURIComponent(h)}`;
    case "youtube":
      return `https://www.youtube.com/@${encodeURIComponent(h)}`;
    default:
      return ensureHttpUrl(customUrl);
  }
}

export function buildWhatsAppPayload(phoneRaw: string, message: string): string {
  const digits = digitsOnly(phoneRaw);
  if (!digits) return "";
  const text = message.trim();
  const base = `https://wa.me/${digits}`;
  if (!text) return base;
  return `${base}?text=${encodeURIComponent(text)}`;
}

export function buildWifiPayload(opts: {
  ssid: string;
  password: string;
  security: WifiSecurity;
  hidden?: boolean;
}): string {
  const esc = (v: string) =>
    v.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/"/g, '\\"');
  const type = opts.security === "nopass" ? "nopass" : opts.security;
  const pass =
    opts.security === "nopass" ? "" : `P:${esc(opts.password)};`;
  const hidden = opts.hidden ? "H:true;" : "";
  return `WIFI:T:${type};S:${esc(opts.ssid)};${pass}${hidden};`;
}

export function buildQrPayload(
  type: QrContentType,
  fields: QrPayloadFields,
): string {
  switch (type) {
    case "url":
      return ensureHttpUrl(fields.url);
    case "email":
      return buildEmailPayload(
        fields.emailTo,
        fields.emailSubject,
        fields.emailBody,
      );
    case "phone":
      return buildPhonePayload(fields.phone);
    case "sms":
      return buildSmsPayload(fields.smsPhone, fields.smsBody);
    case "vcard":
      return buildVCardPayload({
        firstName: fields.vcardFirstName,
        lastName: fields.vcardLastName,
        org: fields.vcardOrg,
        phone: fields.vcardPhone,
        email: fields.vcardEmail,
        url: fields.vcardUrl,
      });
    case "whatsapp":
      return buildWhatsAppPayload(fields.waPhone, fields.waMessage);
    case "wifi": {
      if (!fields.wifiSsid.trim()) return "";
      if (
        fields.wifiSecurity !== "nopass" &&
        !fields.wifiPassword.trim()
      ) {
        return "";
      }
      return buildWifiPayload({
        ssid: fields.wifiSsid,
        password: fields.wifiPassword,
        security: fields.wifiSecurity,
        hidden: fields.wifiHidden,
      });
    }
    case "event":
      return buildEventPayload({
        title: fields.eventTitle,
        location: fields.eventLocation,
        start: fields.eventStart,
        end: fields.eventEnd,
        description: fields.eventDescription,
      });
    case "social":
      return buildSocialPayload(
        fields.socialNetwork,
        fields.socialHandle,
        fields.socialUrl,
      );
    case "text":
    default:
      return fields.text.trim();
  }
}

export const QR_SIZES = [256, 512, 768, 1024] as const;
export const QR_LOGO_MAX_RATIO = 0.32;

export const QR_CONTENT_TYPES: QrContentType[] = [
  "url",
  "text",
  "email",
  "phone",
  "sms",
  "vcard",
  "whatsapp",
  "wifi",
  "event",
  "social",
];
