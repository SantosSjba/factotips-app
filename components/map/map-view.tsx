"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const LeafletMap = dynamic(
  () => import("./leaflet-map").then((m) => m.LeafletMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-brand-soft/40 text-sm text-muted">
        <Loader2 className="mr-2 h-4 w-4 animate-spin text-brand" />
        Cargando mapa...
      </div>
    ),
  },
);

type Props = {
  lat: number;
  lon: number;
  zoom?: number;
  draggable?: boolean;
  onChange?: (lat: number, lon: number) => void;
  className?: string;
};

export function MapView(props: Props) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-border [&_.leaflet-container]:z-0",
        props.className,
      )}
    >
      <LeafletMap {...props} />
    </div>
  );
}
