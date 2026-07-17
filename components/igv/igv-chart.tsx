"use client";

import type { IgvBreakdown } from "@/lib/pe/igv";
import { formatPen, shareOfTotal } from "@/lib/pe/igv";
import { cn } from "@/lib/utils";

type Labels = {
  base: string;
  tax: string;
  igvNeto: string;
  ipm: string;
  ofTotal: string;
};

type Props = {
  result: IgvBreakdown;
  locale: string;
  labels: Labels;
  className?: string;
};

/** Donut SVG: base vs impuesto (y opcionalmente IGV/IPM en leyenda). */
export function IgvDonutChart({ result, locale, labels, className }: Props) {
  const total = result.total;
  const basePct = shareOfTotal(result.base, total);
  const taxPct = shareOfTotal(result.igv, total);

  const r = 54;
  const c = 2 * Math.PI * r;
  const baseLen = (basePct / 100) * c;
  const taxLen = (taxPct / 100) * c;

  return (
    <div className={cn("flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:gap-8", className)}>
      <div className="relative h-40 w-40 shrink-0">
        <svg viewBox="0 0 140 140" className="h-full w-full -rotate-90" aria-hidden>
          <circle
            cx="70"
            cy="70"
            r={r}
            fill="none"
            stroke="var(--border)"
            strokeWidth="18"
          />
          <circle
            cx="70"
            cy="70"
            r={r}
            fill="none"
            stroke="var(--brand)"
            strokeWidth="18"
            strokeDasharray={`${baseLen} ${c - baseLen}`}
            strokeLinecap="butt"
          />
          <circle
            cx="70"
            cy="70"
            r={r}
            fill="none"
            stroke="var(--accent)"
            strokeWidth="18"
            strokeDasharray={`${taxLen} ${c - taxLen}`}
            strokeDashoffset={-baseLen}
            strokeLinecap="butt"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-[10px] font-semibold tracking-wide text-muted uppercase">
            Total
          </span>
          <span className="font-display text-sm font-semibold leading-tight text-foreground">
            {formatPen(result.total, locale)}
          </span>
        </div>
      </div>

      <ul className="w-full space-y-3 text-sm">
        <li className="flex items-start justify-between gap-3">
          <span className="flex items-center gap-2 text-muted">
            <span className="mt-0.5 h-2.5 w-2.5 shrink-0 rounded-sm bg-brand" />
            {labels.base}
          </span>
          <span className="text-right">
            <span className="block font-semibold text-foreground">
              {formatPen(result.base, locale)}
            </span>
            <span className="text-xs text-muted">
              {basePct}% {labels.ofTotal}
            </span>
          </span>
        </li>
        <li className="flex items-start justify-between gap-3">
          <span className="flex items-center gap-2 text-muted">
            <span className="mt-0.5 h-2.5 w-2.5 shrink-0 rounded-sm bg-accent" />
            {labels.tax}
          </span>
          <span className="text-right">
            <span className="block font-semibold text-foreground">
              {formatPen(result.igv, locale)}
            </span>
            <span className="text-xs text-muted">
              {taxPct}% {labels.ofTotal}
            </span>
          </span>
        </li>
        {result.split ? (
          <li className="border-t border-border pt-3 text-xs text-muted">
            <p className="flex justify-between gap-2">
              <span>{labels.igvNeto}</span>
              <span className="font-medium text-foreground">
                {formatPen(result.split.igvNeto, locale)}
              </span>
            </p>
            <p className="mt-1.5 flex justify-between gap-2">
              <span>{labels.ipm}</span>
              <span className="font-medium text-foreground">
                {formatPen(result.split.ipm, locale)}
              </span>
            </p>
          </li>
        ) : null}
      </ul>
    </div>
  );
}

type BarProps = {
  result: IgvBreakdown;
  className?: string;
};

/** Barra apilada base | impuesto. */
export function IgvStackedBar({ result, className }: BarProps) {
  const basePct = shareOfTotal(result.base, result.total);
  const taxPct = Math.max(0, 100 - basePct);

  return (
    <div className={cn("w-full", className)} role="img" aria-label="Desglose">
      <div className="flex h-3 overflow-hidden rounded-full bg-border/60">
        <div
          className="bg-brand transition-[width] duration-300 ease-out"
          style={{ width: `${basePct}%` }}
        />
        <div
          className="bg-accent transition-[width] duration-300 ease-out"
          style={{ width: `${taxPct}%` }}
        />
      </div>
    </div>
  );
}
