"use client";

import { ContactActions } from "@/components/precios/contact-actions";
import { HorarioBadge } from "@/components/precios/horario-badge";
import { useI18n } from "@/lib/i18n/provider";
import type { PrecioRow } from "@/lib/types/precios";
import { cn } from "@/lib/utils";

export type CachedContact = {
  telefono?: unknown;
  horarioAtencion?: unknown;
  email?: unknown;
};

type Props = {
  item: PrecioRow;
  contact?: CachedContact | null;
  size?: "sm" | "md";
  className?: string;
  /** stack = cards; inline = table cell */
  layout?: "stack" | "inline";
};

export function ResultContactInfo({
  item,
  contact,
  size = "sm",
  className,
  layout = "stack",
}: Props) {
  const { t, tf } = useI18n();
  const telefono = contact?.telefono ?? item.telefono;
  const horario = contact?.horarioAtencion ?? item.horarioAtencion;
  const email = contact?.email ?? item.email ?? item.correo;
  const product =
    (typeof item.nombreProducto === "string" && item.nombreProducto) ||
    (typeof item.nombreSustancia === "string" && item.nombreSustancia) ||
    "";
  const shop =
    typeof item.nombreComercial === "string" ? item.nombreComercial : "";

  const whatsappMessage = product
    ? shop
      ? tf(t.contact.waMessage, { product, shop })
      : tf(t.contact.waMessageNoShop, { product })
    : undefined;

  const emailSubject = product
    ? shop
      ? tf(t.contact.emailSubject, { product, shop })
      : tf(t.contact.emailSubjectNoShop, { product })
    : t.contact.emailSubjectFallback;

  return (
    <div
      className={cn(
        layout === "stack" ? "mt-3 space-y-2" : "space-y-1.5",
        className,
      )}
    >
      <ContactActions
        telefono={telefono}
        email={email}
        size={size}
        whatsappMessage={whatsappMessage}
        emailSubject={emailSubject}
      />
      <HorarioBadge
        horario={horario}
        showRaw={layout === "stack"}
        showTz={layout === "stack"}
      />
    </div>
  );
}
