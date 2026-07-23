"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { MapView } from "@/components/map/map-view";
import { useI18n } from "@/lib/i18n/provider";
import {
  PERU_DEFAULT_CENTER,
  getBrowserPosition,
  reverseGeocode,
  type ReverseGeoResult,
} from "@/lib/precios/location";

type ConfirmPayload = {
  lat: number;
  lon: number;
  geo: ReverseGeoResult;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: (payload: ConfirmPayload) => void | Promise<void>;
};

export function LocationPickerModal({ open, onClose, onConfirm }: Props) {
  const { t } = useI18n();
  const [lat, setLat] = useState(PERU_DEFAULT_CENTER.lat);
  const [lon, setLon] = useState(PERU_DEFAULT_CENTER.lon);
  const [ready, setReady] = useState(false);
  const [locating, setLocating] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [preview, setPreview] = useState<ReverseGeoResult | null>(null);
  const [error, setError] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resolvePoint = useCallback(
    async (nextLat: number, nextLon: number) => {
      setResolving(true);
      setError("");
      try {
        const geo = await reverseGeocode(nextLat, nextLon);
        if (!geo.ok) {
          setPreview(null);
          setError(geo.message);
          return;
        }
        setPreview(geo.data);
      } catch {
        setPreview(null);
        setError(t.precios.locationPickerReadError);
      } finally {
        setResolving(false);
      }
    },
    [t.precios.locationPickerReadError],
  );

  const moveTo = useCallback(
    (nextLat: number, nextLon: number) => {
      setLat(nextLat);
      setLon(nextLon);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        void resolvePoint(nextLat, nextLon);
      }, 350);
    },
    [resolvePoint],
  );

  const locateMe = useCallback(async () => {
    setLocating(true);
    setError("");
    try {
      const pos = await getBrowserPosition();
      moveTo(pos.coords.latitude, pos.coords.longitude);
    } catch (err) {
      const code =
        err && typeof err === "object" && "code" in err
          ? Number((err as GeolocationPositionError).code)
          : 0;
      setError(
        code === 1
          ? t.precios.locationPickerDenied
          : err instanceof Error
            ? err.message
            : t.precios.locationPickerGpsError,
      );
      // Igual mostramos mapa centrado en Lima
      void resolvePoint(PERU_DEFAULT_CENTER.lat, PERU_DEFAULT_CENTER.lon);
    } finally {
      setLocating(false);
      setReady(true);
    }
  }, [
    moveTo,
    resolvePoint,
    t.precios.locationPickerDenied,
    t.precios.locationPickerGpsError,
  ]);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    void (async () => {
      await Promise.resolve();
      if (cancelled) return;
      setReady(false);
      setPreview(null);
      setError("");
      setConfirming(false);
      await locateMe();
    })();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      cancelled = true;
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // Solo al abrir el modal
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, onClose]);

  if (!open) return null;

  const onConfirmClick = async () => {
    if (!preview) return;
    setConfirming(true);
    try {
      await onConfirm({ lat, lon, geo: preview });
      onClose();
    } catch {
      setError(t.precios.locationPickerApplyError);
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-end justify-center sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/55 backdrop-blur-sm"
        aria-label={t.common.close}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="ubicacion-titulo"
        className="relative z-10 flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-2xl bg-surface shadow-2xl sm:max-h-[88vh] sm:rounded-2xl"
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-border px-4 py-4 sm:px-5">
          <div>
            <h3
              id="ubicacion-titulo"
              className="font-display text-lg font-semibold text-foreground"
            >
              {t.precios.locationPickerTitle}
            </h3>
            <p className="mt-1 text-xs text-muted sm:text-sm">
              {t.precios.locationPickerHint}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-muted hover:bg-background hover:text-foreground"
            aria-label={t.common.close}
          >
            <Icon icon="mdi:close" className="h-5 w-5" />
          </button>
        </div>

        <div className="relative min-h-[280px] flex-1 sm:min-h-[360px]">
          {ready ? (
            <MapView
              lat={lat}
              lon={lon}
              zoom={16}
              draggable
              onChange={moveTo}
              className="h-full min-h-[280px] rounded-none border-0 sm:min-h-[360px]"
            />
          ) : (
            <div className="flex h-full min-h-[280px] items-center justify-center gap-2 text-sm text-muted sm:min-h-[360px]">
              <Icon icon="mdi:loading" className="h-5 w-5 animate-spin text-brand" />
              {t.precios.locationPickerLocating}
            </div>
          )}
        </div>

        <div className="shrink-0 space-y-3 border-t border-border p-4 sm:p-5">
          <div className="rounded-xl border border-border bg-background px-3 py-3 text-sm">
            {resolving ? (
              <p className="flex items-center gap-2 text-muted">
                <Icon icon="mdi:loading" className="h-4 w-4 animate-spin" />
                {t.precios.locationPickerResolving}
              </p>
            ) : preview ? (
              <div className="flex gap-2">
                <Icon icon="mdi:map-marker" className="mt-0.5 h-4 w-4 text-brand" />
                <div className="min-w-0">
                  <p className="font-medium text-foreground">
                    {[preview.distrito, preview.provincia, preview.departamento]
                      .filter(Boolean)
                      .join(" · ") || t.precios.locationPickerDetected}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-muted">
                    {preview.displayName}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-muted">{t.precios.locationPickerMoveHint}</p>
            )}
            {error ? (
              <p className="mt-2 text-xs text-danger">{error}</p>
            ) : null}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => void locateMe()}
              disabled={locating}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 text-sm font-semibold text-foreground hover:bg-brand-soft disabled:opacity-55"
            >
              {locating ? (
                <Icon icon="mdi:loading" className="h-4 w-4 animate-spin" />
              ) : (
                <Icon icon="mdi:crosshairs-gps" className="h-4 w-4" />
              )}
              {t.precios.locationPickerRecenter}
            </button>
            <button
              type="button"
              onClick={() => void onConfirmClick()}
              disabled={!preview || resolving || confirming}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-brand px-5 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-55"
            >
              {confirming ? (
                <Icon icon="mdi:loading" className="h-4 w-4 animate-spin" />
              ) : null}
              {t.precios.locationPickerConfirm}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
