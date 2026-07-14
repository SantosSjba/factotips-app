export type ToolStatus = "ready" | "soon";

export type Tool = {
  id: string;
  title: string;
  description: string;
  href: string;
  status: ToolStatus;
};

export const TOOLS: Tool[] = [
  {
    id: "precios",
    title: "Comparador de precios de medicamentos",
    description:
      "Consulta precios publicados por DIGEMID y encuentra el precio unitario más económico por región.",
    href: "/herramientas/precios",
    status: "ready",
  },
  {
    id: "soon-1",
    title: "Más herramientas en camino",
    description:
      "FactoTips crecerá con nuevas utilidades prácticas para el día a día.",
    href: "#herramientas",
    status: "soon",
  },
  {
    id: "soon-2",
    title: "Próximamente",
    description: "Nueva herramienta de utilidad — anunciaremos pronto.",
    href: "#herramientas",
    status: "soon",
  },
];
