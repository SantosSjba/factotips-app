"use client";

import Link from "next/link";
import { HeroParticles } from "@/components/marketing/hero-particles";
import { RelatedTools } from "@/components/marketing/related-tools";
import { Icon } from "@/components/ui/icon";
import { useI18n } from "@/lib/i18n/provider";
import { PDF_HUB_PATH, pdfToolAppPath } from "@/lib/pdf/tools";

export function PdfDividirLanding() {
  const { t } = useI18n();
  const p = t.pdfDividirLanding;
  const appHref = pdfToolAppPath("dividir");

  const benefits = [
    { icon: "mdi:content-cut", title: p.benefit1Title, text: p.benefit1Text },
    {
      icon: "mdi:checkbox-multiple-marked-outline",
      title: p.benefit2Title,
      text: p.benefit2Text,
    },
    {
      icon: "mdi:shield-lock-outline",
      title: p.benefit3Title,
      text: p.benefit3Text,
    },
  ] as const;

  const steps = [
    { icon: "mdi:file-upload-outline", title: p.step1Title, text: p.step1Text },
    { icon: "mdi:call-split", title: p.step2Title, text: p.step2Text },
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
        <HeroParticles variant="hub" id="pdf-dividir-hero-particles" />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-32 bg-gradient-to-t from-background to-transparent"
          aria-hidden
        />

        <div className="mx-auto max-w-6xl px-4 pb-16 pt-14 sm:px-6 sm:pb-20 sm:pt-20">
          <Link
            href={PDF_HUB_PATH}
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

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href={appHref}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-brand px-6 text-base font-semibold text-white transition-colors hover:bg-brand-dark"
            >
              {p.ctaPrimary}
              <Icon icon="mdi:arrow-right" className="h-4 w-4" />
            </Link>
            <a
              href="#como-funciona"
              className="inline-flex h-12 items-center justify-center rounded-xl border border-border bg-surface/70 px-6 text-base font-semibold text-foreground backdrop-blur-sm transition-colors hover:border-brand/40 hover:bg-surface"
            >
              {p.ctaSecondary}
            </a>
          </div>
        </div>
      </section>

      <section className="border-t border-border/80 bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
          <h2 className="max-w-2xl font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {p.whyTitle}
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
            {p.whyText}
          </p>
          <ul className="mt-10 grid gap-8 sm:grid-cols-3">
            {benefits.map((item) => (
              <li key={item.title}>
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-brand">
                  <Icon icon={item.icon} className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-display text-xl font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {item.text}
                </p>
              </li>
            ))}
          </ul>
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
          <Link
            href={appHref}
            className="mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-brand px-6 text-base font-semibold text-white transition-colors hover:bg-brand-dark"
          >
            {p.finalCta}
            <Icon icon="mdi:arrow-right" className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <RelatedTools toolId="pdf" />
    </div>
  );
}
