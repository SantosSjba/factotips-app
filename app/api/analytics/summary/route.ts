import type { NextRequest } from "next/server";
import { jsonFail, jsonOk } from "@/lib/api";
import { getToolVisitStats } from "@/lib/analytics/visits";

/**
 * Resumen de visitas. Protegido con header:
 *   Authorization: Bearer $ANALYTICS_TOKEN
 */
export async function GET(request: NextRequest) {
  const token = process.env.ANALYTICS_TOKEN;
  if (!token) {
    return jsonFail("Analytics no configurado.", { status: 503 });
  }

  const auth = request.headers.get("authorization") ?? "";
  const expected = `Bearer ${token}`;
  if (auth !== expected) {
    return jsonFail("No autorizado.", { status: 401 });
  }

  const stats = await getToolVisitStats();
  return jsonOk({ tools: stats });
}
