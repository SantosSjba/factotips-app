"use client";

import { Icon } from "@/components/ui/icon";
import { useI18n } from "@/lib/i18n/provider";

export function HowItWorks() {
  const { t } = useI18n();

  const steps = [
    {
      icon: "mdi:magnify",
      title: t.landing.step1Title,
      text: t.landing.step1Text,
    },
    {
      icon: "mdi:map-marker-radius",
      title: t.landing.step2Title,
      text: t.landing.step2Text,
    },
    {
      icon: "mdi:scale-balance",
      title: t.landing.step3Title,
      text: t.landing.step3Text,
    },
  ] as const;

  return (
    <section className="border-t border-border/80">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="max-w-2xl">
          <h2 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {t.landing.howTitle}
          </h2>
          <p className="mt-3 text-base leading-relaxed text-muted sm:text-lg">
            {t.landing.howSubtitle}
          </p>
        </div>

        <ol className="mt-10 grid gap-8 sm:grid-cols-3 sm:gap-6">
          {steps.map((step, index) => (
            <li key={step.title} className="relative">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-brand">
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

        <p className="mt-12 max-w-3xl text-sm leading-relaxed text-muted">
          {t.landing.disclaimerPrefix}{" "}
          <a
            href="https://opm-digemid.minsa.gob.pe/#/consulta-producto"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-brand underline-offset-2 hover:underline"
          >
            {t.landing.disclaimerObs}
          </a>
          {t.landing.disclaimerSuffix}
        </p>
      </div>
    </section>
  );
}
