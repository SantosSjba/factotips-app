"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { HUB_TOOLS } from "@/lib/hub-tools";
import { useI18n } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";

export function ToolsSection() {
  const { t } = useI18n();

  return (
    <section
      id="herramientas"
      className="scroll-mt-24 border-t border-border/80 bg-surface"
    >
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="max-w-2xl">
          <h2 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {t.landing.toolsTitle}
          </h2>
          <p className="mt-3 text-base leading-relaxed text-muted sm:text-lg">
            {t.landing.toolsSubtitle}
          </p>
        </div>

        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {HUB_TOOLS.map((tool) => {
            const className = cn(
              "group flex h-full flex-col rounded-2xl border border-border bg-background p-5 transition-colors hover:border-brand/50 hover:bg-brand-soft/40 sm:p-6",
            );

            return (
              <li key={tool.id}>
                <Link href={tool.landingPath} className={className}>
                  <div className="flex items-start justify-between gap-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand text-white">
                      <Icon icon={tool.icon} className="h-5 w-5" />
                    </span>
                    <Icon
                      icon="mdi:arrow-top-right"
                      className="h-5 w-5 text-muted transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-brand"
                    />
                  </div>
                  <h3 className="mt-4 font-display text-xl font-semibold tracking-tight text-foreground">
                    {t.landing[tool.titleKey]}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">
                    {t.landing[tool.descKey]}
                  </p>
                  <span className="mt-5 text-sm font-semibold text-brand">
                    {t.landing.openTool}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
