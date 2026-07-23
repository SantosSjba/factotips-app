export const TOOL_IDS = [
  "precios",
  "igv",
  "uit",
  "qr",
  "sueldo-neto",
  "honorarios",
  "cts",
  "gratificacion",
  "pdf",
] as const;
export type ToolAnalyticsId = (typeof TOOL_IDS)[number];

export function isToolAnalyticsId(value: string): value is ToolAnalyticsId {
  return (TOOL_IDS as readonly string[]).includes(value);
}
