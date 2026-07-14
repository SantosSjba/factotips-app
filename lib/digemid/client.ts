import { createHash } from "node:crypto";
import { getDigemidConfig } from "./config";

export type DigemidRawBody = {
  codigo?: string;
  mensaje?: string;
  data?: unknown;
  cantidad?: number;
  entidad?: unknown;
  [key: string]: unknown;
};

export class DigemidHttpError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "DigemidHttpError";
  }
}

function buildHeaders(origin: string): HeadersInit {
  return {
    Accept: "application/json, text/plain, */*",
    "Content-Type": "application/json",
    Origin: origin,
    Referer: `${origin}/`,
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  };
}

/**
 * POST a DIGEMID con timeout y headers oficiales OPM.
 */
export async function digemidPost(
  path: string,
  filtro: Record<string, unknown>,
  timeoutMs?: number,
): Promise<DigemidRawBody> {
  const { baseUrl, origin, timeoutMs: defaultTimeout } = getDigemidConfig();
  const ms = timeoutMs ?? defaultTimeout;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);

  try {
    const res = await fetch(`${baseUrl}${path}`, {
      method: "POST",
      headers: buildHeaders(origin),
      body: JSON.stringify({ filtro }),
      signal: controller.signal,
      cache: "no-store",
    });

    if (!res.ok) {
      throw new DigemidHttpError(
        `El servicio DIGEMID no está disponible (HTTP ${res.status}).`,
        res.status,
      );
    }

    return (await res.json()) as DigemidRawBody;
  } catch (err) {
    if (err instanceof DigemidHttpError) throw err;
    if (err instanceof Error && err.name === "AbortError") {
      throw new DigemidHttpError(
        "La consulta a DIGEMID tardó demasiado. Intenta de nuevo.",
      );
    }
    throw new DigemidHttpError(
      "No se pudo conectar al servicio DIGEMID. Verifica tu conexión.",
    );
  } finally {
    clearTimeout(timer);
  }
}

export function isDigemidSuccess(body: DigemidRawBody): boolean {
  return body.codigo === "00";
}

export function cacheKey(prefix: string, parts: string[]): string {
  const raw = parts.map((p) => p.trim().toLowerCase()).join("|");
  return `${prefix}_${createHash("md5").update(raw).digest("hex")}`;
}
