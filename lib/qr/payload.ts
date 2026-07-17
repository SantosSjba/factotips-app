/** Helpers para payload de QR (cliente). */

export type QrContentType = "url" | "text" | "whatsapp" | "wifi";

export type WifiSecurity = "WPA" | "WEP" | "nopass";

export type QrDotStyle =
  | "square"
  | "dots"
  | "rounded"
  | "extra-rounded"
  | "classy"
  | "classy-rounded";

export type QrCornerStyle = "square" | "dot" | "extra-rounded";

export function buildWhatsAppPayload(phoneRaw: string, message: string): string {
  const digits = phoneRaw.replace(/\D/g, "");
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
  fields: {
    text: string;
    url: string;
    waPhone: string;
    waMessage: string;
    wifiSsid: string;
    wifiPassword: string;
    wifiSecurity: WifiSecurity;
  },
): string {
  switch (type) {
    case "url": {
      const u = fields.url.trim();
      if (!u) return "";
      if (/^https?:\/\//i.test(u)) return u;
      return `https://${u}`;
    }
    case "whatsapp":
      return buildWhatsAppPayload(fields.waPhone, fields.waMessage);
    case "wifi":
      if (!fields.wifiSsid.trim()) return "";
      return buildWifiPayload({
        ssid: fields.wifiSsid,
        password: fields.wifiPassword,
        security: fields.wifiSecurity,
      });
    case "text":
    default:
      return fields.text.trim();
  }
}

export const QR_SIZES = [256, 512, 768, 1024] as const;
export const QR_LOGO_MAX_RATIO = 0.32;
