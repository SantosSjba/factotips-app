"use client";

import type { SelectHTMLAttributes } from "react";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

export const fieldControlClass =
  "w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-foreground outline-none transition placeholder:text-muted/70 focus:border-brand focus:ring-2 focus:ring-brand/20 disabled:cursor-not-allowed disabled:opacity-60";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  wrapperClassName?: string;
};

/**
 * Select estilizado como input: sin flecha nativa del SO.
 */
export function Select({
  className,
  wrapperClassName,
  disabled,
  ...props
}: SelectProps) {
  return (
    <div className={cn("relative", wrapperClassName)}>
      <select
        disabled={disabled}
        className={cn(
          fieldControlClass,
          "appearance-none pr-10",
          "bg-surface [-webkit-appearance:none]",
          className,
        )}
        {...props}
      />
      <Icon
        icon="mdi:chevron-down"
        className={cn(
          "pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-muted",
          disabled && "opacity-50",
        )}
      />
    </div>
  );
}
