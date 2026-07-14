"use client";

import { Mail, MessageCircle, Phone } from "lucide-react";
import {
  findEmail,
  mailHref,
  normalizePeruPhone,
  telHref,
  whatsappHref,
} from "@/lib/contact/phone";
import { useI18n } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";

type Props = {
  telefono?: unknown;
  email?: unknown;
  detalle?: Record<string, unknown> | null;
  className?: string;
  size?: "sm" | "md";
  /** Mensaje prellenado de WhatsApp */
  whatsappMessage?: string;
  emailSubject?: string;
};

export function ContactActions({
  telefono,
  email,
  detalle,
  className,
  size = "md",
  whatsappMessage,
  emailSubject,
}: Props) {
  const { t } = useI18n();
  const phone = normalizePeruPhone(telefono);
  const resolvedEmail =
    findEmail(
      email
        ? { email: String(email) }
        : ((detalle as Record<string, unknown> | null) ?? null),
    ) ?? null;

  const call = telHref(telefono);
  const wa = whatsappHref(telefono, whatsappMessage);
  const mail = mailHref(resolvedEmail, emailSubject);

  if (!call && !wa && !mail) return null;

  const btn =
    size === "sm"
      ? "inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold"
      : "inline-flex min-h-10 items-center gap-1.5 rounded-xl px-3 text-sm font-semibold";

  return (
    <div className={cn("flex min-w-0 flex-wrap gap-2", className)}>
      {call ? (
        <a
          href={call}
          className={cn(btn, "bg-sky-100 text-sky-900 hover:bg-sky-200")}
        >
          <Phone className="h-3.5 w-3.5 shrink-0" aria-hidden />
          {t.contact.call}
          {phone && size === "md" ? (
            <span className="max-w-[7rem] truncate font-normal opacity-80">
              {phone.display}
            </span>
          ) : null}
        </a>
      ) : null}
      {wa ? (
        <a
          href={wa}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(btn, "bg-emerald-100 text-emerald-900 hover:bg-emerald-200")}
        >
          <MessageCircle className="h-3.5 w-3.5 shrink-0" aria-hidden />
          {t.contact.whatsapp}
        </a>
      ) : null}
      {mail ? (
        <a
          href={mail}
          className={cn(btn, "bg-violet-100 text-violet-900 hover:bg-violet-200")}
        >
          <Mail className="h-3.5 w-3.5 shrink-0" aria-hidden />
          {t.contact.email}
          {resolvedEmail && size === "md" ? (
            <span className="max-w-[10rem] truncate font-normal opacity-80">
              {resolvedEmail}
            </span>
          ) : null}
        </a>
      ) : null}
    </div>
  );
}
