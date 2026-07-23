"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { getRelatedTools } from "@/lib/hub-tools";
import { useI18n } from "@/lib/i18n/provider";
import type { ToolId } from "@/lib/seo/tools";

export function RelatedTools({ toolId }: { toolId: ToolId }) {
  const { t } = useI18n();
  const related = getRelatedTools(toolId);

  if (related.length === 0) return null;

  return (
    <section className="border-t border-border/80 bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
        <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {t.landing.relatedTitle}
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
          {t.landing.relatedSubtitle}
        </p>

        <ul className="mt-8 grid gap-3 sm:grid-cols-3">
          {related.map((tool) => (
            <li key={tool.id}>
              <Link
                href={tool.landingPath}
                className="group flex h-full items-start gap-3 rounded-2xl border border-border bg-background px-4 py-4 transition-colors hover:border-brand/40 hover:bg-brand-soft/30"
              >
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand transition-colors group-hover:bg-brand group-hover:text-white">
                  <Icon icon={tool.icon} className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-base font-semibold text-foreground">
                    {t.landing[tool.shortKey]}
                  </span>
                  <span className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-brand">
                    {t.landing.openTool}
                    <Icon
                      icon="mdi:arrow-right"
                      className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                    />
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
