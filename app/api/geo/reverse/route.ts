import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lon: z.coerce.number().min(-180).max(180),
});

/**
 * Reverse geocode (Nominatim) — evita CORS y fija User-Agent.
 * Solo Perú; devuelve state / county / city para mapear ubigeo.
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
      { success: false, message: "Coordenadas inválidas." },
      { status: 400 },
    );
  }

  const { lat, lon } = parsed.data;
  const url = new URL("https://nominatim.openstreetmap.org/reverse");
  url.searchParams.set("format", "json");
  url.searchParams.set("lat", String(lat));
  url.searchParams.set("lon", String(lon));
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("accept-language", "es");
  url.searchParams.set("zoom", "16");

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
        {
          success: false,
          message: "No se pudo obtener la ubicación. Intenta de nuevo.",
        },
        { status: 502 },
      );
    }

    const data = (await res.json()) as {
      address?: Record<string, string>;
      display_name?: string;
      error?: string;
    };

    if (data.error || !data.address) {
      return NextResponse.json(
        {
          success: false,
          message: "No encontramos una dirección cerca de ti.",
        },
        { status: 404 },
      );
    }

    const a = data.address;
    const country = (a.country_code ?? "").toLowerCase();
    if (country && country !== "pe") {
      return NextResponse.json(
        {
          success: false,
          message:
            "Tu ubicación parece estar fuera del Perú. Selecciona el ubigeo manualmente.",
        },
        { status: 422 },
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        displayName: data.display_name ?? "",
        departamento:
          a.state ?? a.region ?? a.province ?? a["ISO3166-2-lvl4"] ?? "",
        provincia: a.county ?? a.province ?? a.state_district ?? "",
        distrito:
          a.city_district ??
          a.suburb ??
          a.city ??
          a.town ??
          a.village ??
          a.municipality ??
          a.district ??
          "",
      },
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Error al resolver tu ubicación.",
      },
      { status: 500 },
    );
  }
}
