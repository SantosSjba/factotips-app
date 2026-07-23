/** Catálogo del Kit PDF — orden de producto (no reordenar). */

export type PdfCategoryId =
  | "ordenar"
  | "optimizar"
  | "convertir-a"
  | "convertir-desde"
  | "editar"
  | "seguridad"
  | "intelligence";

export type PdfToolId =
  | "unir"
  | "dividir"
  | "eliminar-paginas"
  | "extraer-paginas"
  | "ordenar"
  | "escanear"
  | "comprimir"
  | "reparar"
  | "ocr"
  | "jpg-a-pdf"
  | "word-a-pdf"
  | "powerpoint-a-pdf"
  | "excel-a-pdf"
  | "html-a-pdf"
  | "pdf-a-jpg"
  | "pdf-a-word"
  | "pdf-a-powerpoint"
  | "pdf-a-excel"
  | "pdf-a-pdfa"
  | "rotar"
  | "numeros-pagina"
  | "marca-agua"
  | "recortar"
  | "editar"
  | "formularios"
  | "desbloquear"
  | "proteger"
  | "firmar"
  | "censurar"
  | "comparar"
  | "resumir-ia"
  | "traducir"
  | "pdf-a-markdown";

export type PdfToolMeta = {
  id: PdfToolId;
  slug: PdfToolId;
  icon: string;
  /** Listo para usar en `/usar` */
  available: boolean;
  /** Destacada como siguiente a entregar (CTA del hub) */
  featured?: boolean;
};

export type PdfCategoryMeta = {
  id: PdfCategoryId;
  icon: string;
  tools: readonly PdfToolMeta[];
};

export const PDF_HUB_PATH = "/herramientas/pdf" as const;

export function pdfToolLandingPath(slug: PdfToolId): string {
  return `${PDF_HUB_PATH}/${slug}`;
}

export function pdfToolAppPath(slug: PdfToolId): string {
  return `${PDF_HUB_PATH}/${slug}/usar`;
}

export const PDF_CATEGORIES: readonly PdfCategoryMeta[] = [
  {
    id: "ordenar",
    icon: "mdi:file-document-multiple-outline",
    tools: [
      {
        id: "unir",
        slug: "unir",
        icon: "mdi:call-merge",
        available: true,
        featured: true,
      },
      {
        id: "dividir",
        slug: "dividir",
        icon: "mdi:call-split",
        available: true,
      },
      {
        id: "eliminar-paginas",
        slug: "eliminar-paginas",
        icon: "mdi:file-remove-outline",
        available: false,
      },
      {
        id: "extraer-paginas",
        slug: "extraer-paginas",
        icon: "mdi:file-export-outline",
        available: false,
      },
      {
        id: "ordenar",
        slug: "ordenar",
        icon: "mdi:reorder-horizontal",
        available: false,
      },
      {
        id: "escanear",
        slug: "escanear",
        icon: "mdi:scanner",
        available: false,
      },
    ],
  },
  {
    id: "optimizar",
    icon: "mdi:tune-variant",
    tools: [
      {
        id: "comprimir",
        slug: "comprimir",
        icon: "mdi:zip-box-outline",
        available: false,
      },
      {
        id: "reparar",
        slug: "reparar",
        icon: "mdi:file-restore-outline",
        available: false,
      },
      {
        id: "ocr",
        slug: "ocr",
        icon: "mdi:text-recognition",
        available: false,
      },
    ],
  },
  {
    id: "convertir-a",
    icon: "mdi:file-pdf-box",
    tools: [
      {
        id: "jpg-a-pdf",
        slug: "jpg-a-pdf",
        icon: "mdi:file-image-outline",
        available: false,
      },
      {
        id: "word-a-pdf",
        slug: "word-a-pdf",
        icon: "mdi:file-word-outline",
        available: false,
      },
      {
        id: "powerpoint-a-pdf",
        slug: "powerpoint-a-pdf",
        icon: "mdi:file-powerpoint-outline",
        available: false,
      },
      {
        id: "excel-a-pdf",
        slug: "excel-a-pdf",
        icon: "mdi:file-excel-outline",
        available: false,
      },
      {
        id: "html-a-pdf",
        slug: "html-a-pdf",
        icon: "mdi:language-html5",
        available: false,
      },
    ],
  },
  {
    id: "convertir-desde",
    icon: "mdi:file-swap-outline",
    tools: [
      {
        id: "pdf-a-jpg",
        slug: "pdf-a-jpg",
        icon: "mdi:image-outline",
        available: false,
      },
      {
        id: "pdf-a-word",
        slug: "pdf-a-word",
        icon: "mdi:file-word-outline",
        available: false,
      },
      {
        id: "pdf-a-powerpoint",
        slug: "pdf-a-powerpoint",
        icon: "mdi:file-powerpoint-outline",
        available: false,
      },
      {
        id: "pdf-a-excel",
        slug: "pdf-a-excel",
        icon: "mdi:file-excel-outline",
        available: false,
      },
      {
        id: "pdf-a-pdfa",
        slug: "pdf-a-pdfa",
        icon: "mdi:archive-outline",
        available: false,
      },
    ],
  },
  {
    id: "editar",
    icon: "mdi:file-edit-outline",
    tools: [
      {
        id: "rotar",
        slug: "rotar",
        icon: "mdi:rotate-right",
        available: false,
      },
      {
        id: "numeros-pagina",
        slug: "numeros-pagina",
        icon: "mdi:numeric",
        available: false,
      },
      {
        id: "marca-agua",
        slug: "marca-agua",
        icon: "mdi:format-color-highlight",
        available: false,
      },
      {
        id: "recortar",
        slug: "recortar",
        icon: "mdi:crop",
        available: false,
      },
      {
        id: "editar",
        slug: "editar",
        icon: "mdi:pencil-outline",
        available: false,
      },
      {
        id: "formularios",
        slug: "formularios",
        icon: "mdi:form-select",
        available: false,
      },
    ],
  },
  {
    id: "seguridad",
    icon: "mdi:shield-lock-outline",
    tools: [
      {
        id: "desbloquear",
        slug: "desbloquear",
        icon: "mdi:lock-open-outline",
        available: false,
      },
      {
        id: "proteger",
        slug: "proteger",
        icon: "mdi:lock-outline",
        available: false,
      },
      {
        id: "firmar",
        slug: "firmar",
        icon: "mdi:draw",
        available: false,
      },
      {
        id: "censurar",
        slug: "censurar",
        icon: "mdi:eye-off-outline",
        available: false,
      },
      {
        id: "comparar",
        slug: "comparar",
        icon: "mdi:compare",
        available: false,
      },
    ],
  },
  {
    id: "intelligence",
    icon: "mdi:auto-fix",
    tools: [
      {
        id: "resumir-ia",
        slug: "resumir-ia",
        icon: "mdi:text-box-outline",
        available: false,
      },
      {
        id: "traducir",
        slug: "traducir",
        icon: "mdi:translate",
        available: false,
      },
      {
        id: "pdf-a-markdown",
        slug: "pdf-a-markdown",
        icon: "mdi:language-markdown-outline",
        available: false,
      },
    ],
  },
] as const;

export function getAllPdfTools(): PdfToolMeta[] {
  return PDF_CATEGORIES.flatMap((category) => [...category.tools]);
}

/** Primero disponible; si ninguna, la featured (Unir) para el CTA del hub. */
export function getPrimaryPdfTool(): PdfToolMeta {
  const all = getAllPdfTools();
  return (
    all.find((tool) => tool.available) ??
    all.find((tool) => tool.featured) ??
    all[0]
  );
}

export function getPrimaryPdfCtaHref(): string {
  const tool = getPrimaryPdfTool();
  if (tool.available) return pdfToolAppPath(tool.slug);
  return `#${tool.id}`;
}
