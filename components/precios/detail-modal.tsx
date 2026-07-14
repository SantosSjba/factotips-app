"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ExternalLink, Loader2, MapPin, Store, X } from "lucide-react";
import { MapView } from "@/components/map/map-view";
import { forwardGeocode } from "@/lib/precios/location";
import type { DetalleEstablecimiento } from "@/lib/types/precios";
import {
  extraDetailFields,
  formatFieldLabel,
  formatSol,
} from "@/lib/precios/utils";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  loading: boolean;
  error: string;
  detalle: DetalleEstablecimiento | null;
  onClose: () => void;
};

function str(v: unknown): string | null {
  if (v == null || v === "") return null;
  const s = String(v).trim();
  if (!s || s === "NO REGISTRADO") return null;
  return s;
}

export function DetailModal({
  open,
  loading,
  error,
  detalle,
  onClose,
}: Props) {
  const [mapPoint, setMapPoint] = useState<{
    lat: number;
    lon: number;
    displayName: string;
  } | null>(null);
  const [mapLoading, setMapLoading] = useState(false);
  const [mapError, setMapError] = useState("");

  const addressParts = useMemo(() => {
    if (!detalle) {
      return {
        full: "",
        withStreetClean: "",
        byEstablishment: "",
        line: "",
        hasStreet: false,
        hasEstablishment: false,
      };
    }
    const direccion = str(detalle.direccion);
    const establecimiento =
      str(detalle.nombreComercial) ?? str(detalle.nombreEstablecimiento);
    const distrito = str(detalle.distrito);
    const provincia = str(detalle.provincia);
    const departamento = str(detalle.departamento);

    const place = [distrito, provincia, departamento]
      .filter(Boolean)
      .join(", ");

    const full = [direccion, place].filter(Boolean).join(", ");
    // Quita abreviaciones genéricas ruidosas: CAL. / AV. / JR. suelen confundir menos si se dejan;
    // mantenemos la dirección tal cual + lugar.
    const withStreetClean = full;
    const byEstablishment = establecimiento
      ? [establecimiento, place].filter(Boolean).join(", ")
      : "";
    const line = [direccion, distrito, provincia].filter(Boolean).join(" · ");

    return {
      full,
      withStreetClean,
      byEstablishment,
      line,
      hasStreet: Boolean(direccion),
      hasEstablishment: Boolean(establecimiento),
    };
  }, [detalle]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    if (!addressParts.hasStreet && !addressParts.hasEstablishment) {
      void (async () => {
        await Promise.resolve();
        setMapLoading(false);
        setMapPoint(null);
        setMapError("No disponible");
      })();
      return;
    }

    let cancelled = false;
    void (async () => {
      await Promise.resolve();
      if (cancelled) return;
      setMapLoading(true);
      setMapError("");
      setMapPoint(null);

      // Solo consultas precisas: dirección completa, luego establecimiento + zona.
      // Nunca caer a solo ciudad/departamento (da pines imprecisos).
      const candidates = [
        addressParts.hasStreet ? addressParts.full : "",
        addressParts.hasStreet ? addressParts.withStreetClean : "",
        addressParts.hasEstablishment ? addressParts.byEstablishment : "",
      ].filter((q, i, arr) => q.length >= 5 && arr.indexOf(q) === i);

      let found: { lat: number; lon: number; displayName: string } | null =
        null;

      for (const query of candidates) {
        const result = await forwardGeocode(query, { preciseOnly: true });
        if (cancelled) return;
        if (result.ok) {
          found = result.data;
          break;
        }
      }

      if (cancelled) return;
      if (found) {
        setMapPoint(found);
        setMapError("");
      } else {
        setMapPoint(null);
        setMapError("No disponible");
      }
      setMapLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [
    open,
    addressParts.full,
    addressParts.withStreetClean,
    addressParts.byEstablishment,
    addressParts.hasStreet,
    addressParts.hasEstablishment,
  ]);

  if (!open) return null;

  const extras = extraDetailFields(detalle);
  const title =
    str(detalle?.nombreComercial) ?? "Detalle del establecimiento";
  const subtitle = addressParts.line || "—";

  // Solo link externo si hay pin preciso
  const mapsUrl = mapPoint
    ? `https://www.openstreetmap.org/?mlat=${mapPoint.lat}&mlon=${mapPoint.lon}#map=17/${mapPoint.lat}/${mapPoint.lon}`
    : null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/55 backdrop-blur-sm"
        aria-label="Cerrar"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="detalle-titulo"
        className="relative z-10 flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-t-2xl bg-surface shadow-2xl sm:max-h-[88vh] sm:rounded-2xl"
      >
        <div className="flex shrink-0 items-start justify-between gap-4 bg-gradient-to-br from-brand to-brand-dark px-5 py-5 sm:px-6">
          <div className="min-w-0 flex-1 overflow-hidden">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/20">
                <Store className="h-5 w-5 text-white" aria-hidden />
              </span>
              <div className="min-w-0 overflow-hidden">
                <h3
                  id="detalle-titulo"
                  className="truncate text-lg font-bold text-white sm:text-xl"
                >
                  {loading ? "Cargando..." : title}
                </h3>
                <p className="mt-0.5 truncate text-sm text-white/90">
                  {loading ? "Obteniendo detalle del establecimiento" : subtitle}
                </p>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-xl p-2 text-white/90 transition hover:bg-white/20 hover:text-white"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {loading ? (
          <DetailLoadingSkeleton />
        ) : error ? (
          <div className="flex flex-1 items-center justify-center px-6 py-12 text-center">
            <p className="text-sm font-medium text-danger">{error}</p>
          </div>
        ) : detalle ? (
          <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6">
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <PriceCard
                label="Precio por pack"
                value={formatSol(detalle.precio1)}
              />
              <PriceCard
                label="Precio unitario"
                value={formatSol(detalle.precio2)}
                highlight
              />
              <PriceCard
                label="Tipo"
                value={str(detalle.setcodigo) ?? "—"}
                compact
              />
              <PriceCard
                label="Forma"
                value={str(detalle.nombreFormaFarmaceutica) ?? "—"}
                compact
              />
            </div>

            <div className="mt-5 grid gap-5 lg:grid-cols-2 lg:items-start">
              <div className="min-w-0 space-y-5 overflow-hidden">
                <DetailBlock title="Dirección y contacto">
                  <DetailRow label="Dirección" value={str(detalle.direccion)} />
                  <DetailRow
                    label="Departamento"
                    value={str(detalle.departamento)}
                  />
                  <DetailRow label="Provincia" value={str(detalle.provincia)} />
                  <DetailRow label="Distrito" value={str(detalle.distrito)} />
                  <DetailRow label="Teléfono" value={str(detalle.telefono)} />
                  <DetailRow
                    label="Horario de atención"
                    value={str(detalle.horarioAtencion)}
                  />
                </DetailBlock>

                <DetailBlock title="Producto">
                  <DetailRow
                    label="Nombre del producto"
                    value={str(detalle.nombreProducto)}
                  />
                  <DetailRow
                    label="Principio activo"
                    value={str(detalle.nombreSustancia)}
                  />
                  <DetailRow label="Concentración" value={str(detalle.concent)} />
                  <DetailRow
                    label="Laboratorio"
                    value={str(detalle.nombreLaboratorio)}
                  />
                  <DetailRow
                    label="Registro sanitario"
                    value={
                      str(detalle.numeroRS) ?? str(detalle.registroSanitario)
                    }
                  />
                </DetailBlock>

                {Object.keys(extras).length > 0 ? (
                  <DetailBlock title="Otros datos">
                    {Object.entries(extras).map(([key, value]) => (
                      <DetailRow
                        key={key}
                        label={formatFieldLabel(key)}
                        value={value}
                      />
                    ))}
                  </DetailBlock>
                ) : null}
              </div>

              <div className="min-w-0 space-y-3 overflow-hidden lg:sticky lg:top-0">
                <div className="overflow-hidden rounded-2xl border border-border bg-background/70 p-3 sm:p-4">
                  <div className="mb-3 flex min-w-0 items-center justify-between gap-2">
                    <h4 className="flex min-w-0 items-center gap-2 text-sm font-bold text-foreground">
                      <MapPin className="h-4 w-4 shrink-0 text-brand" />
                      <span className="truncate">Ubicación en el mapa</span>
                    </h4>
                    {mapsUrl && !mapLoading ? (
                      <a
                        href={mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-brand hover:underline"
                      >
                        Abrir
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    ) : null}
                  </div>

                  <div className="relative h-56 overflow-hidden rounded-xl bg-brand-soft/30 sm:h-72 lg:h-[380px]">
                    {mapLoading ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-4 text-center">
                        <Loader2 className="h-7 w-7 animate-spin text-brand" />
                        <p className="text-sm font-medium text-foreground">
                          Localizando en el mapa...
                        </p>
                        <p className="text-xs text-muted">
                          Esto puede tomar unos segundos
                        </p>
                      </div>
                    ) : mapPoint ? (
                      <MapView
                        lat={mapPoint.lat}
                        lon={mapPoint.lon}
                        zoom={16}
                        className="h-full rounded-xl border-0"
                      />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 px-6 text-center">
                        <MapPin className="h-5 w-5 text-muted" aria-hidden />
                        <p className="text-sm font-semibold text-foreground">
                          {mapError || "No disponible"}
                        </p>
                        <p className="text-xs text-muted">
                          No hay una ubicación precisa para este establecimiento
                        </p>
                      </div>
                    )}
                  </div>

                  {addressParts.line ? (
                    <p className="mt-3 break-words text-xs leading-relaxed text-muted [overflow-wrap:anywhere]">
                      {addressParts.line}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function DetailLoadingSkeleton() {
  return (
    <div className="min-h-0 flex-1 overflow-hidden p-4 sm:p-6" aria-busy>
      <div className="flex flex-col items-center gap-2 py-2 pb-6">
        <Loader2 className="h-7 w-7 animate-spin text-brand" />
        <p className="text-sm font-medium text-foreground">
          Cargando detalle...
        </p>
        <p className="text-xs text-muted">Consultando datos en DIGEMID</p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-2xl bg-border/60"
          />
        ))}
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <div className="space-y-3">
          <div className="h-40 animate-pulse rounded-2xl bg-border/50" />
          <div className="h-48 animate-pulse rounded-2xl bg-border/50" />
        </div>
        <div className="h-72 animate-pulse rounded-2xl bg-border/50 lg:h-[420px]" />
      </div>
    </div>
  );
}

function PriceCard({
  label,
  value,
  highlight,
  compact,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "min-w-0 overflow-hidden rounded-2xl border p-3 text-center sm:p-4",
        highlight
          ? "border-success/30 bg-emerald-50"
          : "border-border bg-background",
      )}
    >
      <p
        className={cn(
          "truncate text-xs font-semibold tracking-wide uppercase",
          highlight ? "text-success" : "text-muted",
        )}
      >
        {label}
      </p>
      <p
        className={cn(
          "mt-2 break-words font-bold [overflow-wrap:anywhere]",
          highlight
            ? "text-2xl text-success sm:text-3xl"
            : compact
              ? "text-sm text-foreground sm:text-base"
              : "text-2xl text-foreground sm:text-3xl",
        )}
      >
        {value}
      </p>
    </div>
  );
}

function DetailBlock({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="min-w-0 overflow-hidden rounded-2xl border border-border bg-background/70 p-4 sm:p-5">
      <h4 className="mb-3 text-sm font-bold text-foreground">{title}</h4>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  if (!value) return null;
  return (
    <div className="min-w-0 overflow-hidden">
      <p className="text-xs font-medium text-muted">{label}</p>
      <p className="mt-0.5 break-words text-sm text-foreground [overflow-wrap:anywhere]">
        {value}
      </p>
    </div>
  );
}
