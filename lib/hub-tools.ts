import { TOOL_ROUTES, type ToolId } from "@/lib/seo/tools";

export type HubToolMeta = {
  id: ToolId;
  icon: string;
  landingPath: string;
  appPath: string;
  /** Keys under `landing` for title / description */
  titleKey:
    | "toolPreciosTitle"
    | "toolIgvTitle"
    | "toolUitTitle"
    | "toolQrTitle"
    | "toolSueldoNetoTitle"
    | "toolHonorariosTitle"
    | "toolCtsTitle"
    | "toolGratificacionTitle";
  descKey:
    | "toolPreciosDesc"
    | "toolIgvDesc"
    | "toolUitDesc"
    | "toolQrDesc"
    | "toolSueldoNetoDesc"
    | "toolHonorariosDesc"
    | "toolCtsDesc"
    | "toolGratificacionDesc";
  shortKey:
    | "toolPreciosShort"
    | "toolIgvShort"
    | "toolUitShort"
    | "toolQrShort"
    | "toolSueldoNetoShort"
    | "toolHonorariosShort"
    | "toolCtsShort"
    | "toolGratificacionShort";
};

export const HUB_TOOLS: readonly HubToolMeta[] = [
  {
    id: "precios",
    icon: "mdi:pill",
    landingPath: TOOL_ROUTES.precios.landingPath,
    appPath: TOOL_ROUTES.precios.appPath,
    titleKey: "toolPreciosTitle",
    descKey: "toolPreciosDesc",
    shortKey: "toolPreciosShort",
  },
  {
    id: "igv",
    icon: "mdi:calculator-variant",
    landingPath: TOOL_ROUTES.igv.landingPath,
    appPath: TOOL_ROUTES.igv.appPath,
    titleKey: "toolIgvTitle",
    descKey: "toolIgvDesc",
    shortKey: "toolIgvShort",
  },
  {
    id: "uit",
    icon: "mdi:currency-usd",
    landingPath: TOOL_ROUTES.uit.landingPath,
    appPath: TOOL_ROUTES.uit.appPath,
    titleKey: "toolUitTitle",
    descKey: "toolUitDesc",
    shortKey: "toolUitShort",
  },
  {
    id: "qr",
    icon: "mdi:qrcode",
    landingPath: TOOL_ROUTES.qr.landingPath,
    appPath: TOOL_ROUTES.qr.appPath,
    titleKey: "toolQrTitle",
    descKey: "toolQrDesc",
    shortKey: "toolQrShort",
  },
  {
    id: "sueldo-neto",
    icon: "mdi:cash-check",
    landingPath: TOOL_ROUTES["sueldo-neto"].landingPath,
    appPath: TOOL_ROUTES["sueldo-neto"].appPath,
    titleKey: "toolSueldoNetoTitle",
    descKey: "toolSueldoNetoDesc",
    shortKey: "toolSueldoNetoShort",
  },
  {
    id: "honorarios",
    icon: "mdi:file-document-edit-outline",
    landingPath: TOOL_ROUTES.honorarios.landingPath,
    appPath: TOOL_ROUTES.honorarios.appPath,
    titleKey: "toolHonorariosTitle",
    descKey: "toolHonorariosDesc",
    shortKey: "toolHonorariosShort",
  },
  {
    id: "cts",
    icon: "mdi:piggy-bank-outline",
    landingPath: TOOL_ROUTES.cts.landingPath,
    appPath: TOOL_ROUTES.cts.appPath,
    titleKey: "toolCtsTitle",
    descKey: "toolCtsDesc",
    shortKey: "toolCtsShort",
  },
  {
    id: "gratificacion",
    icon: "mdi:gift-outline",
    landingPath: TOOL_ROUTES.gratificacion.landingPath,
    appPath: TOOL_ROUTES.gratificacion.appPath,
    titleKey: "toolGratificacionTitle",
    descKey: "toolGratificacionDesc",
    shortKey: "toolGratificacionShort",
  },
] as const;

/** Herramientas relacionadas por afinidad de uso. */
export const RELATED_TOOLS: Record<ToolId, readonly ToolId[]> = {
  precios: ["igv", "qr", "uit"],
  igv: ["uit", "honorarios", "sueldo-neto"],
  uit: ["igv", "sueldo-neto", "honorarios"],
  qr: ["precios", "igv", "uit"],
  "sueldo-neto": ["cts", "gratificacion", "honorarios"],
  honorarios: ["sueldo-neto", "igv", "uit"],
  cts: ["sueldo-neto", "gratificacion", "honorarios"],
  gratificacion: ["sueldo-neto", "cts", "honorarios"],
};

export function getHubTool(id: ToolId): HubToolMeta {
  const tool = HUB_TOOLS.find((t) => t.id === id);
  if (!tool) throw new Error(`Unknown hub tool: ${id}`);
  return tool;
}

export function getRelatedTools(id: ToolId): HubToolMeta[] {
  return RELATED_TOOLS[id].map(getHubTool);
}
