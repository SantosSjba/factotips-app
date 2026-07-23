import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { jsonFail } from "@/lib/api";
import { factotipsPyFetch } from "@/lib/factotips-py/client";
import {
  PDF_MAX_FILES_MERGE,
  PDF_MAX_UPLOAD_BYTES,
} from "@/lib/pdf/limits";
import {
  LIMIT_SOFT,
  attachUserCookie,
  enforceRateLimit,
} from "@/lib/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 60;

async function readPyErrorMessage(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as { detail?: unknown };
    if (typeof data.detail === "string") return data.detail;
    if (Array.isArray(data.detail)) {
      const first = data.detail[0] as { msg?: string } | undefined;
      if (first?.msg) return first.msg;
    }
  } catch {
    /* ignore */
  }
  return "No se pudo dividir el PDF. Intenta de nuevo.";
}

export async function POST(request: NextRequest) {
  const rl = await enforceRateLimit(
    request,
    "pdf:divide",
    LIMIT_SOFT.limit,
    LIMIT_SOFT.windowSeconds,
  );

  if (!rl.ok) {
    return jsonFail(
      `Demasiadas solicitudes. Intenta de nuevo en ${rl.retryAfter}s.`,
      {
        status: 429,
        retryAfter: rl.retryAfter,
        userId: rl.userId,
        isNew: rl.isNew,
      },
    );
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return jsonFail("No se pudieron leer los archivos.", {
      status: 400,
      userId: rl.userId,
      isNew: rl.isNew,
    });
  }

  const modeRaw = String(form.get("mode") ?? "").trim().toLowerCase();
  if (modeRaw !== "split" && modeRaw !== "extract") {
    return jsonFail("Modo inválido. Usa split o extract.", {
      status: 400,
      userId: rl.userId,
      isNew: rl.isNew,
    });
  }

  const planRaw = form.get("plan");
  if (typeof planRaw !== "string" || !planRaw.trim()) {
    return jsonFail("Falta el plan de división.", {
      status: 400,
      userId: rl.userId,
      isNew: rl.isNew,
    });
  }

  const files = form
    .getAll("files")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);

  if (files.length < 1) {
    return jsonFail("Sube al menos un archivo PDF.", {
      status: 400,
      userId: rl.userId,
      isNew: rl.isNew,
    });
  }

  if (files.length > PDF_MAX_FILES_MERGE) {
    return jsonFail(`Máximo ${PDF_MAX_FILES_MERGE} archivos.`, {
      status: 400,
      userId: rl.userId,
      isNew: rl.isNew,
    });
  }

  for (const file of files) {
    const name = file.name.toLowerCase();
    const type = file.type.toLowerCase();
    const looksPdf =
      name.endsWith(".pdf") ||
      type.includes("pdf") ||
      type === "application/octet-stream";
    if (!looksPdf) {
      return jsonFail(`"${file.name}" no parece un PDF.`, {
        status: 400,
        userId: rl.userId,
        isNew: rl.isNew,
      });
    }
    if (file.size > PDF_MAX_UPLOAD_BYTES) {
      return jsonFail(
        `"${file.name}" supera el límite de ${PDF_MAX_UPLOAD_BYTES / (1024 * 1024)} MB.`,
        {
          status: 400,
          userId: rl.userId,
          isNew: rl.isNew,
        },
      );
    }
  }

  const outbound = new FormData();
  outbound.append("mode", modeRaw);
  outbound.append("plan", planRaw);
  for (const file of files) {
    outbound.append("files", file, file.name);
  }

  let upstream: Response;
  try {
    upstream = await factotipsPyFetch("/v1/pdf/divide", {
      method: "POST",
      body: outbound,
    });
  } catch {
    return jsonFail(
      "El servicio de PDF no está disponible. Intenta más tarde.",
      {
        status: 503,
        userId: rl.userId,
        isNew: rl.isNew,
      },
    );
  }

  if (!upstream.ok) {
    const message = await readPyErrorMessage(upstream);
    return jsonFail(message, {
      status:
        upstream.status >= 400 && upstream.status < 600 ? upstream.status : 502,
      userId: rl.userId,
      isNew: rl.isNew,
    });
  }

  const bytes = await upstream.arrayBuffer();
  const contentType =
    upstream.headers.get("Content-Type") ||
    (modeRaw === "split" ? "application/zip" : "application/pdf");
  const disposition =
    upstream.headers.get("Content-Disposition") ||
    'attachment; filename="factotips-divide.bin"';

  const res = new NextResponse(bytes, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": disposition,
      "Cache-Control": "no-store",
    },
  });

  if (rl.isNew) {
    attachUserCookie(res, rl.userId);
  }

  return res;
}
