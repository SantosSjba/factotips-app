"use client";

import Link from "next/link";
import { HeroParticles } from "@/components/marketing/hero-particles";
import { RelatedTools } from "@/components/marketing/related-tools";
import { Icon } from "@/components/ui/icon";
import { useI18n } from "@/lib/i18n/provider";
import {
  getPrimaryPdfCtaHref,
  getPrimaryPdfTool,
  PDF_CATEGORIES,
  pdfToolLandingPath,
  type PdfToolMeta,
} from "@/lib/pdf/tools";
import { cn } from "@/lib/utils";

function toolHref(tool: PdfToolMeta): string | null {
  if (!tool.available) return null;
  return pdfToolLandingPath(tool.slug);
}

export function PdfLanding() {
  const { t } = useI18n();
  const p = t.pdfLanding;
  const primaryHref = getPrimaryPdfCtaHref();
  const primaryTool = getPrimaryPdfTool();
  const primaryIsHash = primaryHref.startsWith("#");

  const steps = [
    { icon: "mdi:file-pdf-box", title: p.step1Title, text: p.step1Text },
    { icon: "mdi:laptop", title: p.step2Title, text: p.step2Text },
    { icon: "mdi:download", title: p.step3Title, text: p.step3Text },
  ] as const;

  const faqs = [
    { q: p.faq1Q, a: p.faq1A },
    { q: p.faq2Q, a: p.faq2A },
    { q: p.faq3Q, a: p.faq3A },
    { q: p.faq4Q, a: p.faq4A },
  ] as const;

  return (
    <div>
      <section className="relative isolate overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 -z-10 hero-atmosphere"
          aria-hidden
        />
        <HeroParticles variant="hub" id="pdf-hero-particles" />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-32 bg-gradient-to-t from-background to-transparent"
          aria-hidden
        />

        <div className="mx-auto max-w-6xl px-4 pb-16 pt-14 sm:px-6 sm:pb-20 sm:pt-20">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-brand"
          >
            <Icon icon="mdi:arrow-left" className="h-4 w-4" />
            {p.backHub}
          </Link>

          <p className="mt-8 text-sm font-semibold tracking-[0.18em] text-brand uppercase">
            {p.eyebrow}
          </p>
          <h1 className="mt-4 max-w-4xl font-display text-[clamp(2.25rem,6vw,4rem)] leading-[1.02] font-semibold tracking-tight text-foreground">
            {p.headline}
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted sm:text-xl">
            {p.subtitle}
          </p>

          <p className="mt-6 inline-flex max-w-2xl items-start gap-2 rounded-xl bg-brand-soft/80 px-4 py-3 text-sm leading-relaxed text-brand">
            <Icon icon="mdi:shield-lock" className="mt-0.5 h-4 w-4 shrink-0" />
            {p.privacyBanner}
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            {primaryIsHash ? (
              <a
                href={primaryHref}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-brand px-6 text-base font-semibold text-white transition-colors hover:bg-brand-dark"
              >
                {p.ctaPrimary}
                <Icon icon="mdi:arrow-right" className="h-4 w-4" />
              </a>
            ) : (
              <Link
                href={primaryHref}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-brand px-6 text-base font-semibold text-white transition-colors hover:bg-brand-dark"
              >
                {p.ctaPrimary}
                <Icon icon="mdi:arrow-right" className="h-4 w-4" />
              </Link>
            )}
            <a
              href="#catalogo"
              className="inline-flex h-12 items-center justify-center rounded-xl border border-border bg-surface/70 px-6 text-base font-semibold text-foreground backdrop-blur-sm transition-colors hover:border-brand/40 hover:bg-surface"
            >
              {p.ctaSecondary}
            </a>
          </div>
        </div>
      </section>

      <section
        id="catalogo"
        className="scroll-mt-24 border-t border-border/80 bg-surface"
      >
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
          <h2 className="max-w-2xl font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {p.catalogTitle}
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
            {p.catalogSubtitle}
          </p>

          <div className="mt-12 space-y-14">
            {PDF_CATEGORIES.map((category) => (
              <div
                key={category.id}
                id={`cat-${category.id}`}
                className="scroll-mt-24"
              >
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-brand">
                    <Icon icon={category.icon} className="h-5 w-5" />
                  </span>
                  <h3 className="font-display text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                    {p.categories[category.id]}
                  </h3>
                </div>

                <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {category.tools.map((tool) => {
                    const href = toolHref(tool);
                    const label = p.tools[tool.id];
                    const isPrimary = tool.id === primaryTool.id;
                    const badge = tool.available
                      ? p.available
                      : tool.featured
                        ? p.nextUp
                        : p.comingSoon;

                    const content = (
                      <>
                        <span
                          className={cn(
                            "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                            tool.available || tool.featured
                              ? "bg-brand-soft text-brand"
                              : "bg-border/60 text-muted",
                          )}
                        >
                          <Icon icon={tool.icon} className="h-5 w-5" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex flex-wrap items-center gap-2">
                            <span className="font-display text-base font-semibold text-foreground">
                              {label}
                            </span>
                            <span
                              className={cn(
                                "rounded-md px-2 py-0.5 text-[11px] font-semibold tracking-wide uppercase",
                                tool.available
                                  ? "bg-brand text-white"
                                  : tool.featured
                                    ? "bg-accent-soft text-accent"
                                    : "bg-border/70 text-muted",
                              )}
                            >
                              {badge}
                            </span>
                          </span>
                          {href ? (
                            <span className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-brand">
                              {p.openTool}
                              <Icon
                                icon="mdi:arrow-right"
                                className="h-3.5 w-3.5"
                              />
                            </span>
                          ) : null}
                        </span>
                      </>
                    );

                    return (
                      <li key={tool.id} id={tool.id} className="scroll-mt-24">
                        {href ? (
                          <Link
                            href={href}
                            className={cn(
                              "flex h-full items-start gap-3 rounded-2xl border bg-background px-4 py-4 transition-colors",
                              isPrimary
                                ? "border-brand/50 hover:border-brand hover:bg-brand-soft/30"
                                : "border-border hover:border-brand/40 hover:bg-brand-soft/30",
                            )}
                          >
                            {content}
                          </Link>
                        ) : (
                          <div
                            className={cn(
                              "flex h-full items-start gap-3 rounded-2xl border px-4 py-4",
                              isPrimary
                                ? "border-brand/40 bg-brand-soft/20"
                                : "border-border/80 bg-background/60",
                            )}
                            aria-disabled
                          >
                            {content}
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="como-funciona" className="scroll-mt-24 border-t border-border/80">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
          <h2 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {p.howTitle}
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
            {p.howSubtitle}
          </p>
          <ol className="mt-10 grid gap-8 sm:grid-cols-3">
            {steps.map((step, index) => (
              <li key={step.title}>
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand text-white">
                    <Icon icon={step.icon} className="h-5 w-5" />
                  </span>
                  <span className="text-xs font-semibold tracking-[0.14em] text-muted uppercase">
                    {t.landing.step} {index + 1}
                  </span>
                </div>
                <h3 className="mt-4 font-display text-xl font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {step.text}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-t border-border/80 bg-surface">
        <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-16">
          <h2 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {p.faqTitle}
          </h2>
          <dl className="mt-8 space-y-6">
            {faqs.map((item) => (
              <div key={item.q}>
                <dt className="font-display text-lg font-semibold text-foreground">
                  {item.q}
                </dt>
                <dd className="mt-2 text-sm leading-relaxed text-muted sm:text-base">
                  {item.a}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="border-t border-border/80">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
          <h2 className="max-w-2xl font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {p.finalTitle}
          </h2>
          <p className="mt-3 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
            {p.finalText}
          </p>
          {primaryIsHash ? (
            <a
              href={primaryHref}
              className="mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-brand px-6 text-base font-semibold text-white transition-colors hover:bg-brand-dark"
            >
              {p.finalCta}
              <Icon icon="mdi:arrow-right" className="h-4 w-4" />
            </a>
          ) : (
            <Link
              href={primaryHref}
              className="mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-brand px-6 text-base font-semibold text-white transition-colors hover:bg-brand-dark"
            >
              {p.finalCta}
              <Icon icon="mdi:arrow-right" className="h-4 w-4" />
            </Link>
          )}
        </div>
      </section>

      <RelatedTools toolId="pdf" />
    </div>
  );
}
