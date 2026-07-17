import { absoluteUrl, FACTOSYS_URL, SITE_BRAND, SITE_NAME } from "./site";
import { buildPageMetadata, type PageSeo } from "./metadata";

/** Rutas canónicas de cada herramienta (landing + app). */
export const TOOL_ROUTES = {
  precios: {
    id: "precios",
    landingPath: "/herramientas/precios",
    appPath: "/herramientas/precios/consultar",
  },
  igv: {
    id: "igv",
    landingPath: "/herramientas/igv",
    appPath: "/herramientas/igv/usar",
  },
  uit: {
    id: "uit",
    landingPath: "/herramientas/uit",
    appPath: "/herramientas/uit/usar",
  },
} as const;

export type ToolId = keyof typeof TOOL_ROUTES;

/** SEO ES — mercado principal Perú. */
export const TOOL_SEO = {
  precios: {
    landing: {
      title: "Comparar precios de medicamentos en el Perú",
      description:
        "Compara precios oficiales de medicamentos en todo el Perú con datos DIGEMID / MINSA. Encuentra el precio unitario más económico por departamento, provincia o distrito.",
      path: TOOL_ROUTES.precios.landingPath,
      keywords: [
        "comparar precios medicamentos",
        "precios medicamentos Perú",
        "DIGEMID precios",
        "observatorio precios medicamentos",
        "precio unitario medicamentos",
        "farmacias precios DIGEMID",
        "boticas más baratas Perú",
        "MINSA medicamentos",
      ],
      ogTitle: "Comparar precios de medicamentos en el Perú | FactoTips",
    } satisfies PageSeo,
    app: {
      title: "Consultar precios DIGEMID",
      description:
        "Consulta y compara precios unitarios de medicamentos publicados por DIGEMID. Filtra por región y exporta resultados.",
      path: TOOL_ROUTES.precios.appPath,
      keywords: [
        "consulta precios DIGEMID",
        "buscar precio medicamento",
        "comparador DIGEMID",
      ],
      ogTitle: "Consultar precios DIGEMID | FactoTips",
    } satisfies PageSeo,
  },
  igv: {
    landing: {
      title: "Calculadora de IGV Perú",
      description:
        "Calcula IGV al 18% o 10% (MYPE). Agrega o saca el impuesto de un precio en soles: base, IGV y total al instante.",
      path: TOOL_ROUTES.igv.landingPath,
      keywords: [
        "calcular IGV",
        "IGV 18% Perú",
        "precio con IGV",
        "sacar IGV",
        "IGV MYPE",
        "calculadora IGV",
        "cómo sacar el IGV",
      ],
      ogTitle: "Calculadora de IGV Perú | FactoTips",
    } satisfies PageSeo,
    app: {
      title: "Calcular IGV",
      description:
        "Herramienta para agregar o extraer IGV (18% o 10%). Obtén base imponible, impuesto y total en soles.",
      path: TOOL_ROUTES.igv.appPath,
      keywords: [
        "calcular IGV online",
        "agregar IGV",
        "extraer IGV",
        "IGV 18",
      ],
      ogTitle: "Calcular IGV | FactoTips",
    } satisfies PageSeo,
  },
  uit: {
    landing: {
      title: "Conversor UIT a soles 2026",
      description:
        "Convierte UIT a soles y soles a UIT con el valor vigente 2026 (S/ 5,500). Tabla rápida de fracciones para multas, rentas y trámites.",
      path: TOOL_ROUTES.uit.landingPath,
      keywords: [
        "UIT 2026",
        "cuánto es 1 UIT",
        "convertir UIT a soles",
        "UIT Perú",
        "valor UIT",
        "UIT en soles",
        "conversor UIT",
      ],
      ogTitle: "Conversor UIT a soles 2026 | FactoTips",
    } satisfies PageSeo,
    app: {
      title: "Convertir UIT",
      description:
        "Pasa de UIT a soles o de soles a UIT con el valor oficial vigente. Incluye tabla de fracciones frecuentes.",
      path: TOOL_ROUTES.uit.appPath,
      keywords: [
        "convertir UIT",
        "UIT a soles",
        "soles a UIT",
        "calculadora UIT",
      ],
      ogTitle: "Convertir UIT | FactoTips",
    } satisfies PageSeo,
  },
} as const;

export const HUB_SEO = {
  title: `Herramientas útiles — ${SITE_BRAND}`,
  description:
    "FactoTips es el hub de herramientas de utilidad de Factosys Perú. Calcula IGV, convierte UIT, compara precios DIGEMID y más utilidades.",
  path: "/",
  keywords: [
    "herramientas útiles",
    "FactoTips",
    "utilidades Perú",
    "calculadora IGV",
    "UIT 2026",
    "comparar precios medicamentos",
    "DIGEMID",
  ],
  ogTitle: `${SITE_NAME} | Herramientas útiles — ${SITE_BRAND}`,
} satisfies PageSeo;

export function toolLandingMetadata(tool: ToolId) {
  return buildPageMetadata(TOOL_SEO[tool].landing);
}

export function toolAppMetadata(tool: ToolId) {
  return buildPageMetadata(TOOL_SEO[tool].app);
}

export function hubMetadata() {
  return buildPageMetadata(HUB_SEO);
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_BRAND,
    url: FACTOSYS_URL,
    sameAs: [FACTOSYS_URL],
    brand: {
      "@type": "Brand",
      name: SITE_NAME,
      url: absoluteUrl("/"),
    },
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: absoluteUrl("/"),
    description: HUB_SEO.description,
    publisher: {
      "@type": "Organization",
      name: SITE_BRAND,
    },
    inLanguage: "es-PE",
  };
}

function softwareJsonLd(opts: {
  name: string;
  description: string;
  path: string;
  applicationCategory: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: opts.name,
    applicationCategory: opts.applicationCategory,
    operatingSystem: "Web",
    url: absoluteUrl(opts.path),
    description: opts.description,
    inLanguage: "es-PE",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "PEN",
    },
    provider: {
      "@type": "Organization",
      name: SITE_BRAND,
    },
    isAccessibleForFree: true,
  };
}

export function preciosSoftwareJsonLd() {
  const seo = TOOL_SEO.precios.landing;
  return softwareJsonLd({
    name: "Comparador de precios de medicamentos — FactoTips",
    description: seo.description,
    path: seo.path,
    applicationCategory: "HealthApplication",
  });
}

export function igvSoftwareJsonLd() {
  const seo = TOOL_SEO.igv.landing;
  return softwareJsonLd({
    name: "Calculadora de IGV — FactoTips",
    description: seo.description,
    path: seo.path,
    applicationCategory: "FinanceApplication",
  });
}

export function uitSoftwareJsonLd() {
  const seo = TOOL_SEO.uit.landing;
  return softwareJsonLd({
    name: "Conversor UIT — FactoTips",
    description: seo.description,
    path: seo.path,
    applicationCategory: "FinanceApplication",
  });
}

export function faqJsonLd(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

