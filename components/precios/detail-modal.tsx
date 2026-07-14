"use client";

import { useEffect, type ReactNode } from "react";
import { Loader2, Store, X } from "lucide-react";
import type { DetalleEstablecimiento } from "@/lib/types/precios";
import {
  extraDetailFields,
  formatFieldLabel,
  formatSol,
} from "@/lib/precios/utils";

type Props = {
  open: boolean;
  loading: boolean;
  error: string;
  detalle: DetalleEstablecimiento | null;
  onClose: () => void;
};

function str(v: unknown): string | null {
  if (v == null || v === "") return null;
  const s = String(v);
  if (s === "NO REGISTRADO") return null;
  return s;
}

export function DetailModal({
  open,
  loading,
  error,
  detalle,
  onClose,
}: Props) {
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

  if (!open) return null;

  const extras = extraDetailFields(detalle);
  const title =
    str(detalle?.nombreComercial) ?? "Detalle del establecimiento";
  const subtitle = [
    str(detalle?.direccion),
    str(detalle?.distrito),
    str(detalle?.provincia),
  ]
    .filter(Boolean)
    .join(" · ");

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
        className="relative z-10 flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl bg-surface shadow-2xl sm:max-h-[85vh] sm:rounded-2xl"
      >
        <div className="flex shrink-0 items-start justify-between gap-4 bg-gradient-to-br from-brand to-brand-dark px-5 py-5 sm:px-6">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/20">
                <Store className="h-5 w-5 text-white" aria-hidden />
              </span>
              <div className="min-w-0">
                <h3
                  id="detalle-titulo"
                  className="truncate text-lg font-bold text-white"
                >
                  {loading ? "Cargando..." : title}
                </h3>
                <p className="mt-0.5 truncate text-sm text-white/90">
                  {loading ? "Obteniendo detalle" : subtitle || "—"}
                </p>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-white/90 transition hover:bg-white/20 hover:text-white"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {loading ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 py-16">
            <Loader2 className="h-9 w-9 animate-spin text-brand" />
            <p className="text-sm text-muted">Cargando detalle...</p>
          </div>
        ) : error ? (
          <div className="flex flex-1 items-center justify-center px-6 py-12 text-center">
            <p className="text-sm font-medium text-danger">{error}</p>
          </div>
        ) : detalle ? (
          <div className="flex-1 overflow-y-auto p-5 sm:p-6">
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="rounded-2xl border border-border bg-background p-4 text-center sm:p-5">
                <p className="text-xs font-semibold tracking-wide text-muted uppercase">
                  Precio por pack
                </p>
                <p className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">
                  {formatSol(detalle.precio1)}
                </p>
              </div>
              <div className="rounded-2xl border-2 border-success/30 bg-emerald-50 p-4 text-center sm:p-5">
                <p className="text-xs font-semibold tracking-wide text-success uppercase">
                  Precio unitario
                </p>
                <p className="mt-2 text-2xl font-bold text-success sm:text-3xl">
                  {formatSol(detalle.precio2)}
                </p>
              </div>
            </div>

            <DetailBlock title="Establecimiento">
              <DetailRow label="Nombre comercial" value={str(detalle.nombreComercial)} />
              <DetailRow label="Tipo" value={str(detalle.setcodigo)} />
              <DetailRow label="Dirección" value={str(detalle.direccion)} wide />
              <DetailRow label="Departamento" value={str(detalle.departamento)} />
              <DetailRow label="Provincia" value={str(detalle.provincia)} />
              <DetailRow label="Distrito" value={str(detalle.distrito)} />
              <DetailRow label="Teléfono" value={str(detalle.telefono)} />
              <DetailRow
                label="Horario de atención"
                value={str(detalle.horarioAtencion)}
                wide
              />
            </DetailBlock>

            <DetailBlock title="Producto">
              <DetailRow label="Nombre del producto" value={str(detalle.nombreProducto)} wide />
              <DetailRow label="Principio activo" value={str(detalle.nombreSustancia)} />
              <DetailRow label="Concentración" value={str(detalle.concent)} />
              <DetailRow
                label="Forma farmacéutica"
                value={str(detalle.nombreFormaFarmaceutica)}
              />
              <DetailRow
                label="Laboratorio"
                value={str(detalle.nombreLaboratorio)}
                wide
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
        ) : null}
      </div>
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
    <div className="mt-6 rounded-2xl border border-border bg-background/70 p-4 sm:p-5">
      <h4 className="mb-3 text-sm font-bold text-foreground">{title}</h4>
      <dl className="grid gap-2 text-sm sm:grid-cols-2">{children}</dl>
    </div>
  );
}

function DetailRow({
  label,
  value,
  wide,
}: {
  label: string;
  value: string | null | undefined;
  wide?: boolean;
}) {
  if (!value) return null;
  return (
    <>
      <dt
        className={`font-medium text-muted ${wide ? "sm:col-span-2" : ""}`}
      >
        {label}
      </dt>
      <dd
        className={`text-foreground ${wide ? "sm:col-span-2" : ""}`}
      >
        {value}
      </dd>
    </>
  );
}
