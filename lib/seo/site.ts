/** Canonical site + SEO helpers for FactoTips */

export const SITE_NAME = "FactoTips";
export const SITE_BRAND = "Factosys Perú";
export const FACTOSYS_URL = "https://factosysperu.com";

export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return raw.replace(/\/$/, "");
}

export function absoluteUrl(path = "/"): string {
  const base = getSiteUrl();
  if (!path || path === "/") return `${base}/`;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
