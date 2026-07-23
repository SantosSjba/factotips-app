"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { HeroParticles } from "@/components/marketing/hero-particles";
import { Icon } from "@/components/ui/icon";
import { HUB_TOOLS } from "@/lib/hub-tools";
import { useI18n } from "@/lib/i18n/provider";
import { FACTOSYS_URL } from "@/lib/seo/site";
import { cn } from "@/lib/utils";

const SLIDE_MS = 5500;

export function Hero() {
  const { t } = useI18n();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  const tool = HUB_TOOLS[index] ?? HUB_TOOLS[0];
  const title = t.landing[tool.titleKey];
  const desc = t.landing[tool.descKey];
  const short = t.landing[tool.shortKey];

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduceMotion(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (paused || reduceMotion) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % HUB_TOOLS.length);
    }, SLIDE_MS);
    return () => window.clearInterval(id);
  }, [paused, reduceMotion, index]);

  function goTo(next: number) {
    setIndex((next + HUB_TOOLS.length) % HUB_TOOLS.length);
  }

  return (
    <section
      className="relative isolate min-h-[min(100svh,880px)] overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className="pointer-events-none absolute inset-0 -z-10 hero-atmosphere"
        aria-hidden
      />
      <HeroParticles variant="hub" />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-background to-transparent"
        aria-hidden
      />

      <div className="mx-auto grid min-h-[min(100svh,880px)] max-w-6xl items-center gap-10 px-4 pb-16 pt-14 sm:px-6 sm:pb-24 sm:pt-20 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-14">
        <div>
          <a
            href={FACTOSYS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="animate-fade-up inline-flex w-fit text-sm font-semibold tracking-[0.18em] text-brand uppercase transition-colors hover:text-brand-dark"
          >
            {t.landing.brandEyebrow}
          </a>

          <h1 className="animate-fade-up animation-delay-1 mt-4 max-w-3xl font-display text-[clamp(2.75rem,8vw,5.5rem)] leading-[0.95] font-semibold tracking-tight text-foreground">
            {t.landing.headline}
          </h1>

          <p className="animate-fade-up animation-delay-2 mt-5 max-w-xl text-lg leading-relaxed text-muted sm:text-xl">
            {t.landing.subtitle}
          </p>

          <div className="animate-fade-up animation-delay-3 mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href={tool.landingPath}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-brand px-6 text-base font-semibold text-white transition-colors hover:bg-brand-dark"
            >
              {t.landing.ctaOpenTool}
              <Icon icon="mdi:arrow-right" className="h-4 w-4" />
            </Link>
            <Link
              href="/#herramientas"
              className="inline-flex h-12 items-center justify-center rounded-xl border border-border bg-surface/70 px-6 text-base font-semibold text-foreground backdrop-blur-sm transition-colors hover:border-brand/40 hover:bg-surface"
            >
              {t.landing.ctaTools}
            </Link>
          </div>
        </div>

        <div
          className="animate-fade-up animation-delay-2 relative min-h-[280px] sm:min-h-[320px]"
          aria-roledescription="carousel"
          aria-label={t.landing.toolsTitle}
        >
          <div
            key={tool.id}
            className="animate-hero-slide absolute inset-0 flex flex-col justify-end"
          >
            <p className="text-xs font-semibold tracking-[0.16em] text-brand uppercase">
              {t.landing.heroFeaturedLabel}
            </p>
            <div className="mt-4 flex items-end gap-4">
              <span className="inline-flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-brand text-white sm:h-20 sm:w-20">
                <Icon icon={tool.icon} className="h-8 w-8 sm:h-10 sm:w-10" />
              </span>
              <div className="min-w-0">
                <p className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                  {short}
                </p>
                <p className="mt-1 text-sm font-medium text-muted sm:text-base">
                  {title}
                </p>
              </div>
            </div>
            <p className="mt-5 max-w-md text-base leading-relaxed text-muted">
              {desc}
            </p>
          </div>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-6 sm:bottom-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex flex-wrap items-center gap-1.5" role="tablist">
            {HUB_TOOLS.map((item, i) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={t.landing[item.shortKey]}
                onClick={() => goTo(i)}
                className={cn(
                  "h-2 rounded-full transition-all",
                  i === index
                    ? "w-7 bg-brand"
                    : "w-2 bg-border hover:bg-brand/40",
                )}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label={t.landing.heroPrev}
              onClick={() => goTo(index - 1)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface/80 text-foreground backdrop-blur-sm transition-colors hover:border-brand/40"
            >
              <Icon icon="mdi:chevron-left" className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label={t.landing.heroNext}
              onClick={() => goTo(index + 1)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface/80 text-foreground backdrop-blur-sm transition-colors hover:border-brand/40"
            >
              <Icon icon="mdi:chevron-right" className="h-5 w-5" />
            </button>
          </div>
        </div>

        {!reduceMotion && !paused ? (
          <div className="mx-auto mt-3 max-w-6xl px-4 sm:px-6">
            <div className="h-0.5 overflow-hidden rounded-full bg-border/70">
              <div
                key={tool.id}
                className="animate-hero-progress h-full bg-brand"
              />
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
