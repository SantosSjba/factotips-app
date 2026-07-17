"use client";

import { useEffect, useRef } from "react";
import type { ToolAnalyticsId } from "@/lib/analytics/tool-ids";

type Props = {
  toolId: ToolAnalyticsId;
};

/**
 * Registra una visita al montar (una vez por montaje de página).
 * Falla en silencio para no afectar la UX.
 */
export function ToolVisitTracker({ toolId }: Props) {
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current) return;
    sent.current = true;

    const path =
      typeof window !== "undefined"
        ? window.location.pathname.slice(0, 300)
        : `/${toolId}`;

    const body = JSON.stringify({ toolId, path });

    void fetch("/api/analytics/visit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
      credentials: "same-origin",
    }).catch(() => {});
  }, [toolId]);

  return null;
}
