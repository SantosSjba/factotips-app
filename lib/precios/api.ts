import type {
  ApiResponse,
  AutocompleteItem,
  BuscarPreciosFiltro,
  DetalleEstablecimiento,
  PrecioRow,
  SearchHistoryItem,
  UbigeoItem,
} from "@/lib/types/precios";
import type { DepartamentoOption } from "@/lib/departamentos";

async function postJson<T>(
  url: string,
  body: unknown,
): Promise<{ status: number; payload: ApiResponse<T> }> {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });

  let payload: ApiResponse<T>;
  try {
    payload = (await res.json()) as ApiResponse<T>;
  } catch {
    payload = {
      success: false,
      message: "Respuesta inválida del servidor.",
    };
  }

  return { status: res.status, payload };
}

export async function fetchDepartamentos(): Promise<DepartamentoOption[]> {
  const res = await fetch("/api/precios/departamentos");
  const json = (await res.json()) as ApiResponse<DepartamentoOption[]>;
  if (!json.success) return [];
  return json.data ?? [];
}

export async function fetchAutocomplete(
  query: string,
): Promise<AutocompleteItem[]> {
  const { payload } = await postJson<AutocompleteItem[]>(
    "/api/precios/autocomplete",
    { query },
  );
  if (!payload.success) return [];
  return (payload.data ?? []).slice(0, 12);
}

export async function fetchProvincias(
  codigoDepartamento: string,
): Promise<UbigeoItem[]> {
  const { payload } = await postJson<UbigeoItem[]>(
    "/api/precios/provincias",
    { codigoDepartamento },
  );
  if (!payload.success) return [];
  return payload.data ?? [];
}

export async function fetchDistritos(
  codigoDepartamento: string,
  codigoProvincia: string,
): Promise<UbigeoItem[]> {
  const { payload } = await postJson<UbigeoItem[]>("/api/precios/distritos", {
    codigoDepartamento,
    codigoProvincia,
  });
  if (!payload.success) return [];
  return payload.data ?? [];
}

export async function buscarPrecios(filtro: BuscarPreciosFiltro): Promise<{
  status: number;
  payload: ApiResponse<PrecioRow[]>;
}> {
  return postJson<PrecioRow[]>("/api/precios/buscar", filtro);
}

export async function fetchDetalle(
  codigoProducto: string | number,
  codEstablecimiento: string,
): Promise<ApiResponse<DetalleEstablecimiento | null>> {
  const { payload } = await postJson<DetalleEstablecimiento | null>(
    "/api/precios/detalle",
    { codigoProducto, codEstablecimiento },
  );
  return payload;
}

export async function fetchHistorial(
  limit = 12,
): Promise<SearchHistoryItem[]> {
  const res = await fetch(`/api/precios/historial?limit=${limit}`, {
    headers: { Accept: "application/json" },
    credentials: "same-origin",
  });
  const json = (await res.json()) as ApiResponse<SearchHistoryItem[]>;
  if (!json.success) return [];
  return json.data ?? [];
}

export async function deleteHistorialItem(id: string): Promise<boolean> {
  const res = await fetch(`/api/precios/historial?id=${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: { Accept: "application/json" },
    credentials: "same-origin",
  });
  const json = (await res.json()) as ApiResponse<{ deleted: number }>;
  return json.success;
}

export async function clearHistorial(): Promise<boolean> {
  const res = await fetch("/api/precios/historial?all=1", {
    method: "DELETE",
    headers: { Accept: "application/json" },
    credentials: "same-origin",
  });
  const json = (await res.json()) as ApiResponse<{ deleted: number }>;
  return json.success;
}
