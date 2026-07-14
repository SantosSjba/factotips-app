"use client";

import { useEffect } from "react";
import L from "leaflet";
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

const brandIcon = L.divIcon({
  className: "",
  html: `<span style="
    display:block;width:22px;height:22px;border-radius:50% 50% 50% 0;
    background:#0d6e63;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.35);
    transform:rotate(-45deg);
  "></span>`,
  iconSize: [22, 22],
  iconAnchor: [11, 22],
});

function Recenter({ lat, lon }: { lat: number; lon: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lon], map.getZoom(), { animate: true });
  }, [lat, lon, map]);
  return null;
}

function MapClickHandler({
  onPick,
}: {
  onPick: (lat: number, lon: number) => void;
}) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

type Props = {
  lat: number;
  lon: number;
  zoom?: number;
  draggable?: boolean;
  onChange?: (lat: number, lon: number) => void;
  className?: string;
};

export function LeafletMap({
  lat,
  lon,
  zoom = 15,
  draggable = false,
  onChange,
  className,
}: Props) {
  return (
    <MapContainer
      center={[lat, lon]}
      zoom={zoom}
      scrollWheelZoom
      className={className}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Recenter lat={lat} lon={lon} />
      {draggable && onChange ? <MapClickHandler onPick={onChange} /> : null}
      <Marker
        position={[lat, lon]}
        icon={brandIcon}
        draggable={draggable}
        eventHandlers={
          draggable && onChange
            ? {
                dragend: (e) => {
                  const m = e.target as L.Marker;
                  const p = m.getLatLng();
                  onChange(p.lat, p.lng);
                },
              }
            : undefined
        }
      />
    </MapContainer>
  );
}
