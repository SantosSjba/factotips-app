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
    id: "igv",
    title: "Calculadora de IGV",
    description:
      "Agrega o saca el IGV (18% o 10% MYPE) de un precio en soles. Base, impuesto y total al instante.",
    href: "/herramientas/igv",
    status: "ready",
  },
  {
    id: "uit",
    title: "Conversor UIT",
    description:
      "Convierte UIT a soles y soles a UIT con el valor vigente 2026 (S/ 5,500).",
    href: "/herramientas/uit",
    status: "ready",
  },
  {
    id: "qr",
    title: "Generador de código QR",
    description:
      "Crea QR con tu logo, colores y estilos. URL, WhatsApp o WiFi. Descarga PNG o SVG en tu dispositivo.",
    href: "/herramientas/qr",
    status: "ready",
  },
  {
    id: "sueldo-neto",
    title: "Calculadora de sueldo neto",
    description:
      "Bruto a neto con AFP u ONP, quinta categoría, asignación familiar y gratificaciones.",
    href: "/herramientas/sueldo-neto",
    status: "ready",
  },
  {
    id: "honorarios",
    title: "Recibo por honorarios",
    description:
      "Retención 8% en renta 4ta, neto a cobrar y orientación sobre suspensión SUNAT.",
    href: "/herramientas/honorarios",
    status: "ready",
  },
  {
    id: "cts",
    title: "Calculadora de CTS",
    description:
      "Estima el depósito de mayo o noviembre con remuneración computable y tiempo trabajado.",
    href: "/herramientas/cts",
    status: "ready",
  },
  {
    id: "gratificacion",
    title: "Calculadora de gratificación",
    description:
      "Julio o diciembre más bonificación Essalud 9% o EPS 6.75%.",
    href: "/herramientas/gratificacion",
    status: "ready",
  },
];
