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
  qr: {
    id: "qr",
    landingPath: "/herramientas/qr",
    appPath: "/herramientas/qr/usar",
  },
  "sueldo-neto": {
    id: "sueldo-neto",
    landingPath: "/herramientas/sueldo-neto",
    appPath: "/herramientas/sueldo-neto/usar",
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
  qr: {
    landing: {
      title: "Generador de código QR gratis",
      description:
        "Crea QR personalizados con tu logo, colores y estilos. URL, WhatsApp, WiFi o texto. Se genera en tu dispositivo; descarga PNG o SVG.",
      path: TOOL_ROUTES.qr.landingPath,
      keywords: [
        "generar código QR",
        "QR gratis",
        "crear QR WhatsApp",
        "QR para negocio",
        "QR con logo",
        "generador QR Perú",
        "QR personalizado",
      ],
      ogTitle: "Generador de código QR gratis | FactoTips",
    } satisfies PageSeo,
    app: {
      title: "Crear código QR",
      description:
        "Personaliza tu QR con logo, colores y forma. Exporta PNG o SVG sin subir archivos a un servidor.",
      path: TOOL_ROUTES.qr.appPath,
      keywords: [
        "crear QR online",
        "QR con logo",
        "descargar QR PNG",
        "QR WiFi",
      ],
      ogTitle: "Crear código QR | FactoTips",
    } satisfies PageSeo,
  },
  "sueldo-neto": {
    landing: {
      title: "Calculadora de sueldo neto Perú 2026",
      description:
        "Calcula tu sueldo neto en Perú: AFP u ONP, quinta categoría, asignación familiar y gratificaciones. Desglose claro de descuentos.",
      path: TOOL_ROUTES["sueldo-neto"].landingPath,
      keywords: [
        "sueldo neto Perú",
        "calcular quinta categoría",
        "descuento AFP sueldo",
        "bruto a neto",
        "calculadora sueldo neto",
        "retención quinta",
        "ONP descuento sueldo",
        "neto mensual Perú",
      ],
      ogTitle: "Calculadora de sueldo neto Perú 2026 | FactoTips",
    } satisfies PageSeo,
    app: {
      title: "Calcular sueldo neto",
      description:
        "De bruto a neto con AFP/ONP, quinta categoría, 7 UIT y gastos deducibles. Estimación orientativa para Perú 2026.",
      path: TOOL_ROUTES["sueldo-neto"].appPath,
      keywords: [
        "calcular sueldo neto",
        "quinta categoría online",
        "AFP ONP descuento",
        "retención IR 5ta",
      ],
      ogTitle: "Calcular sueldo neto | FactoTips",
    } satisfies PageSeo,
  },
} as const;

export const HUB_SEO = {
  title: `Herramientas útiles — ${SITE_BRAND}`,
  description:
    "FactoTips es el hub de herramientas de utilidad de Factosys Perú. Calcula IGV, sueldo neto, convierte UIT, genera QR y compara precios DIGEMID.",
  path: "/",
  keywords: [
    "herramientas útiles",
    "FactoTips",
    "utilidades Perú",
    "calculadora IGV",
    "sueldo neto Perú",
    "UIT 2026",
    "generador QR",
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

export function qrSoftwareJsonLd() {
  const seo = TOOL_SEO.qr.landing;
  return softwareJsonLd({
    name: "Generador de código QR — FactoTips",
    description: seo.description,
    path: seo.path,
    applicationCategory: "UtilitiesApplication",
  });
}

export function sueldoNetoSoftwareJsonLd() {
  const seo = TOOL_SEO["sueldo-neto"].landing;
  return softwareJsonLd({
    name: "Calculadora de sueldo neto — FactoTips",
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

