import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  query: z.string().trim().min(3).max(300),
  /** Si true, ignora resultados groseros (ciudad/departamento) */
  preciseOnly: z.boolean().optional().default(true),
});

type NominatimHit = {
  lat: string;
  lon: string;
  display_name?: string;
  class?: string;
  type?: string;
  importance?: number;
  address?: Record<string, string>;
};

/** Resultados demasiado amplios (centro de ciudad, región, etc.) */
function isCoarseHit(hit: NominatimHit): boolean {
  const cls = hit.class ?? "";
  const type = hit.type ?? "";

  if (cls === "boundary") return true;
  if (cls === "place") {
    return [
      "city",
      "town",
      "municipality",
      "state",
      "region",
      "province",
      "county",
      "district",
      "suburb",
      "neighbourhood",
      "quarter",
      "village",
      "hamlet",
    ].includes(type);
  }
  if (cls === "administrative") return true;
  return false;
}

function isUsefulPreciseHit(hit: NominatimHit): boolean {
  if (isCoarseHit(hit)) return false;
  if (hit.address?.house_number) return true;

  const cls = hit.class ?? "";
  return [
    "building",
    "amenity",
    "shop",
    "office",
    "healthcare",
    "tourism",
    "leisure",
    "highway",
  ].includes(cls);
}

/**
 * Forward geocode (Nominatim) acotado a Perú.
 * Con preciseOnly evita pines en el centro de la ciudad.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Body JSON inválido." },
      { status: 400 },
    );
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, message: "Consulta demasiado corta." },
      { status: 400 },
    );
  }

  const { query, preciseOnly } = parsed.data;
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("format", "json");
  url.searchParams.set("q", `${query}, Perú`);
  url.searchParams.set("countrycodes", "pe");
  url.searchParams.set("limit", preciseOnly ? "5" : "1");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("accept-language", "es");

  try {
    const res = await fetch(url.toString(), {
      headers: {
        Accept: "application/json",
        "User-Agent": "FactoTips/1.0 (Factosys Peru; precios@factotips)",
      },
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      return NextResponse.json(
        { success: false, message: "No se pudo buscar la dirección." },
        { status: 502 },
      );
    }

    const rows = (await res.json()) as NominatimHit[];
    if (!rows.length) {
      return NextResponse.json(
        {
          success: false,
          message: "No disponible",
          code: "NOT_FOUND",
        },
        { status: 404 },
      );
    }

    const hit = preciseOnly
      ? rows.find((r) => isUsefulPreciseHit(r))
      : rows[0];

    if (!hit) {
      return NextResponse.json(
        {
          success: false,
          message: "No disponible",
          code: "TOO_COARSE",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        lat: Number(hit.lat),
        lon: Number(hit.lon),
        displayName: hit.display_name ?? query,
        class: hit.class ?? null,
        type: hit.type ?? null,
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Error al buscar la dirección." },
      { status: 500 },
    );
  }
}
