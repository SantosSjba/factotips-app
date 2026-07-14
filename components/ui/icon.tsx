"use client";

import { Icon as IconifyIcon } from "@iconify/react";
import { cn } from "@/lib/utils";

type Props = {
  /** Iconify name, e.g. `mdi:phone` */
  icon: string;
  className?: string;
  /** Accessible label; omit for decorative icons */
  label?: string;
};

export function Icon({ icon, className, label }: Props) {
  return (
    <IconifyIcon
      icon={icon}
      className={cn("inline-block shrink-0", className)}
      aria-hidden={label ? undefined : true}
      role={label ? "img" : undefined}
      aria-label={label}
    />
  );
}
