"use client";

import { useEffect, useMemo, useState } from "react";
import type { Engine, ISourceOptions } from "@tsparticles/engine";
import { NextParticles, NextParticlesProvider } from "@tsparticles/nextjs";
import { loadSlim } from "@tsparticles/slim";
import { cn } from "@/lib/utils";

type Variant = "hub" | "precios";

type Props = {
  variant?: Variant;
  className?: string;
  /** Unique canvas id (required if more than one instance could mount). */
  id?: string;
};

async function initParticles(engine: Engine) {
  await loadSlim(engine);
}

function buildOptions(variant: Variant, reduceMotion: boolean): ISourceOptions {
  const isPrecios = variant === "precios";

  return {
    fullScreen: { enable: false },
    background: { color: { value: "transparent" } },
    fpsLimit: 48,
    detectRetina: true,
    pauseOnBlur: true,
    particles: {
      number: {
        value: reduceMotion ? 18 : isPrecios ? 36 : 42,
        density: { enable: true, width: 1000, height: 800 },
      },
      color: {
        value: isPrecios
          ? ["#0d6e63", "#148f82", "#c45c26"]
          : ["#0d6e63", "#0a534b", "#1a8a7c"],
      },
      shape: {
        type: "polygon",
        options: {
          polygon: { sides: 6 },
        },
      },
      fill: false,
      stroke: {
        width: 1.15,
        color: {
          value: isPrecios
            ? ["#0d6e63", "#c45c26"]
            : ["#0d6e63", "#148f82"],
        },
      },
      opacity: {
        value: { min: 0.12, max: 0.38 },
        animation: reduceMotion
          ? { enable: false }
          : {
              enable: true,
              speed: 0.35,
              sync: false,
              startValue: "random",
            },
      },
      size: {
        value: { min: 14, max: isPrecios ? 40 : 36 },
      },
      links: {
        enable: true,
        distance: isPrecios ? 130 : 140,
        color: "#0d6e63",
        opacity: 0.14,
        width: 1,
      },
      move: {
        enable: !reduceMotion,
        speed: reduceMotion ? 0 : 0.35,
        direction: "none",
        random: true,
        straight: false,
        outModes: { default: "bounce" },
      },
    },
    interactivity: {
      detectsOn: "window",
      events: {
        onHover: {
          enable: !reduceMotion,
          mode: "grab",
        },
      },
      modes: {
        grab: {
          distance: 150,
          links: { opacity: 0.4 },
        },
      },
    },
  };
}

export function HeroParticles({
  variant = "hub",
  className,
  id = `hero-particles-${variant}`,
}: Props) {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduceMotion(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const options = useMemo(
    () => buildOptions(variant, reduceMotion),
    [variant, reduceMotion],
  );

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 -z-[1] overflow-hidden opacity-70 md:opacity-90",
        className,
      )}
      aria-hidden
    >
      <NextParticlesProvider init={initParticles}>
        <NextParticles
          id={id}
          options={options}
          className="!absolute inset-0 h-full w-full"
        />
      </NextParticlesProvider>
    </div>
  );
}
