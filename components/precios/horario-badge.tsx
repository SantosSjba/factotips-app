"use client";

import { useMemo } from "react";
import { Icon } from "@/components/ui/icon";
import { evaluateBusinessHours } from "@/lib/horario/parse";
import { useI18n } from "@/lib/i18n/provider";
import { cleanContactValue } from "@/lib/contact/phone";
import { cn } from "@/lib/utils";

type Props = {
  horario: unknown;
  className?: string;
  showRaw?: boolean;
  showTz?: boolean;
};

const STATUS_STYLES = {
  open: "border-emerald-300 bg-emerald-50 text-emerald-900",
  always_open: "border-emerald-300 bg-emerald-50 text-emerald-900",
  closes_soon: "border-amber-300 bg-amber-50 text-amber-950",
  opens_soon: "border-sky-300 bg-sky-50 text-sky-950",
  closed: "border-red-300 bg-red-50 text-red-900",
  unknown: "border-border bg-background text-muted",
} as const;

export function HorarioBadge({
  horario,
  className,
  showRaw = true,
  showTz = true,
}: Props) {
  const { t, locale } = useI18n();
  const raw = cleanContactValue(horario);
  const evaluation = useMemo(
    () => evaluateBusinessHours(raw ?? "", undefined, locale),
    [raw, locale],
  );

  if (!raw && evaluation.status === "unknown") return null;

  const labelMap = {
    open: t.hours.open,
    closed: t.hours.closed,
    closes_soon: t.hours.closesSoon,
    opens_soon: t.hours.opensSoon,
    always_open: t.hours.alwaysOpen,
    unknown: t.hours.unknown,
  } as const;

  return (
    <div className={cn("min-w-0 space-y-1.5", className)}>
      <span
        className={cn(
          "inline-flex max-w-full items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold",
          STATUS_STYLES[evaluation.status],
        )}
      >
        <Icon icon="mdi:clock-outline" className="h-3.5 w-3.5" />
        <span className="truncate">{labelMap[evaluation.labelKey]}</span>
      </span>
      {showRaw && raw ? (
        <p className="break-words text-xs leading-relaxed text-muted [overflow-wrap:anywhere]">
          {raw}
        </p>
      ) : null}
      {showTz ? (
        <p className="text-[11px] text-muted">
          {t.hours.limaTz} · {evaluation.limaNowLabel}
        </p>
      ) : null}
    </div>
  );
}
