/** Departamentos del Perú (códigos ubigeo DIGEMID) — orden fijo 01–25 */

export const DEPARTAMENTOS_LIST = [
  { codigo: "01", nombre: "AMAZONAS" },
  { codigo: "02", nombre: "ANCASH" },
  { codigo: "03", nombre: "APURIMAC" },
  { codigo: "04", nombre: "AREQUIPA" },
  { codigo: "05", nombre: "AYACUCHO" },
  { codigo: "06", nombre: "CAJAMARCA" },
  { codigo: "07", nombre: "CALLAO" },
  { codigo: "08", nombre: "CUSCO" },
  { codigo: "09", nombre: "HUANCAVELICA" },
  { codigo: "10", nombre: "HUANUCO" },
  { codigo: "11", nombre: "ICA" },
  { codigo: "12", nombre: "JUNIN" },
  { codigo: "13", nombre: "LA LIBERTAD" },
  { codigo: "14", nombre: "LAMBAYEQUE" },
  { codigo: "15", nombre: "LIMA" },
  { codigo: "16", nombre: "LORETO" },
  { codigo: "17", nombre: "MADRE DE DIOS" },
  { codigo: "18", nombre: "MOQUEGUA" },
  { codigo: "19", nombre: "PASCO" },
  { codigo: "20", nombre: "PIURA" },
  { codigo: "21", nombre: "PUNO" },
  { codigo: "22", nombre: "SAN MARTIN" },
  { codigo: "23", nombre: "TACNA" },
  { codigo: "24", nombre: "TUMBES" },
  { codigo: "25", nombre: "UCAYALI" },
] as const;

export const DEPARTAMENTOS: Record<string, string> = Object.fromEntries(
  DEPARTAMENTOS_LIST.map(({ codigo, nombre }) => [codigo, nombre]),
);

export type DepartamentoOption = {
  codigo: string;
  nombre: string;
};

export function listDepartamentos(): DepartamentoOption[] {
  return DEPARTAMENTOS_LIST.map(({ codigo, nombre }) => ({ codigo, nombre }));
}
