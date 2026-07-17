"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { useI18n } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";

export function ToolsSection() {
  const { t } = useI18n();

  const tools = [
    {
      id: "precios",
      title: t.landing.toolPreciosTitle,
      description: t.landing.toolPreciosDesc,
      href: "/herramientas/precios",
      status: "ready" as const,
      icon: "mdi:pill",
    },
    {
      id: "igv",
      title: t.landing.toolIgvTitle,
      description: t.landing.toolIgvDesc,
      href: "/herramientas/igv",
      status: "ready" as const,
      icon: "mdi:calculator-variant",
    },
    {
      id: "uit",
      title: t.landing.toolUitTitle,
      description: t.landing.toolUitDesc,
      href: "/herramientas/uit",
      status: "ready" as const,
      icon: "mdi:currency-usd",
    },
  ];

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
          {tools.map((tool) => {
            const ready = tool.status === "ready";
            const className = cn(
              "group flex h-full flex-col rounded-2xl border border-border p-5 transition-colors sm:p-6",
              ready
                ? "bg-background hover:border-brand/50 hover:bg-brand-soft/40"
                : "cursor-default bg-background/60 opacity-80",
            );

            const body = (
              <>
                <div className="flex items-start justify-between gap-3">
                  <span
                    className={cn(
                      "inline-flex h-10 w-10 items-center justify-center rounded-xl",
                      ready ? "bg-brand text-white" : "bg-border/60 text-muted",
                    )}
                  >
                    <Icon icon={tool.icon} className="h-5 w-5" />
                  </span>
                  {ready ? (
                    <Icon
                      icon="mdi:arrow-top-right"
                      className="h-5 w-5 text-muted transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-brand"
                    />
                  ) : (
                    <span className="rounded-full bg-border/70 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-muted uppercase">
                      {t.landing.comingSoon}
                    </span>
                  )}
                </div>
                <h3 className="mt-4 font-display text-xl font-semibold tracking-tight text-foreground">
                  {tool.title}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">
                  {tool.description}
                </p>
                {ready ? (
                  <span className="mt-5 text-sm font-semibold text-brand">
                    {t.landing.openTool}
                  </span>
                ) : null}
              </>
            );

            return (
              <li key={tool.id}>
                {ready ? (
                  <Link href={tool.href} className={className}>
                    {body}
                  </Link>
                ) : (
                  <div className={className} aria-disabled>
                    {body}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
