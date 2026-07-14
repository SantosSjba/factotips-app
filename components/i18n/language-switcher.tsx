"use client";

import { useI18n } from "@/lib/i18n/provider";
import type { Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, setLocale, t } = useI18n();

  const options: { value: Locale; label: string }[] = [
    { value: "es", label: "ES" },
    { value: "en", label: "EN" },
  ];

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-lg border border-border bg-surface p-0.5",
        className,
      )}
      role="group"
      aria-label={t.common.language}
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => setLocale(opt.value)}
          className={cn(
            "min-h-8 min-w-9 rounded-md px-2 text-xs font-bold transition",
            locale === opt.value
              ? "bg-brand text-white"
              : "text-muted hover:text-foreground",
          )}
          aria-pressed={locale === opt.value}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
