/** Cliente interno hacia factotips-py (no llamar desde el browser). */

const DEFAULT_BASE = "http://127.0.0.1:8000";

export function getFactotipsPyBaseUrl(): string {
  const raw = process.env.FACTOTIPS_PY_URL?.trim();
  if (!raw) return DEFAULT_BASE;
  return raw.replace(/\/+$/, "");
}

export function getFactotipsPyApiKey(): string {
  return process.env.FACTOTIPS_PY_API_KEY?.trim() ?? "";
}

export function isFactotipsPyConfigured(): boolean {
  return Boolean(process.env.FACTOTIPS_PY_URL?.trim());
}

export async function factotipsPyFetch(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  const url = `${getFactotipsPyBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`;
  const headers = new Headers(init.headers);
  const apiKey = getFactotipsPyApiKey();
  if (apiKey) {
    headers.set("X-API-Key", apiKey);
  }

  return fetch(url, {
    ...init,
    headers,
    cache: "no-store",
  });
}
