import { absoluteUrl, SITE_BRAND, SITE_NAME } from "./site";
import { buildPageMetadata, type PageSeo } from "./metadata";

/** Rutas canónicas de cada herramienta (landing + app). */
export const TOOL_ROUTES = {
  precios: {
    id: "precios",
    landingPath: "/herramientas/precios",
    appPath: "/herramientas/precios/consultar",
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
} as const;

export const HUB_SEO = {
  title: `Herramientas útiles — ${SITE_BRAND}`,
  description:
    "FactoTips es el hub de herramientas de utilidad de Factosys Perú. Compara precios oficiales de medicamentos DIGEMID y descubre más utilidades prácticas.",
  path: "/",
  keywords: [
    "herramientas útiles",
    "FactoTips",
    "utilidades Perú",
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
    url: absoluteUrl("/"),
    brand: {
      "@type": "Brand",
      name: SITE_NAME,
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

export function preciosSoftwareJsonLd() {
  const seo = TOOL_SEO.precios.landing;
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Comparador de precios de medicamentos — FactoTips",
    applicationCategory: "HealthApplication",
    operatingSystem: "Web",
    url: absoluteUrl(seo.path),
    description: seo.description,
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

export function preciosFaqJsonLd(
  faqs: { question: string; answer: string }[],
) {
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
