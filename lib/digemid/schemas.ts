import { z } from "zod";

const emptyToNull = (v: unknown) =>
  v === "" || v === undefined ? null : v;

export const autocompleteSchema = z.object({
  query: z.string().trim().min(2, "Escribe al menos 2 caracteres."),
});

export const provinciasSchema = z.object({
  codigoDepartamento: z
    .string()
    .trim()
    .min(1, "Departamento requerido.")
    .max(2),
});

export const distritosSchema = z.object({
  codigoDepartamento: z
    .string()
    .trim()
    .min(1, "Departamento requerido.")
    .max(2),
  codigoProvincia: z.string().trim().min(1, "Provincia requerida.").max(4),
});

export const buscarSchema = z.object({
  codigoProducto: z.union([
    z.string().trim().min(1, "Producto requerido."),
    z.number(),
  ]),
  codigoDepartamento: z
    .string()
    .trim()
    .min(1, "Departamento requerido.")
    .max(2),
  codigoProvincia: z.preprocess(emptyToNull, z.string().nullish()),
  codigoUbigeo: z.preprocess(emptyToNull, z.string().nullish()),
  codTipoEstablecimiento: z.preprocess(
    emptyToNull,
    z.enum(["1", "2"]).nullish(),
  ),
  nombreEstablecimiento: z.preprocess(emptyToNull, z.string().nullish()),
  nombreLaboratorio: z.preprocess(emptyToNull, z.string().nullish()),
  codGrupoFF: z.preprocess(emptyToNull, z.string().nullish()),
  concent: z.preprocess(emptyToNull, z.string().nullish()),
  pagina: z.coerce.number().int().positive().optional().default(1),
});

export const detalleSchema = z.object({
  codigoProducto: z.union([
    z.string().trim().min(1, "Producto requerido."),
    z.number(),
  ]),
  codEstablecimiento: z
    .string()
    .trim()
    .min(1, "Establecimiento requerido.")
    .max(20),
});

export type AutocompleteInput = z.infer<typeof autocompleteSchema>;
export type ProvinciasInput = z.infer<typeof provinciasSchema>;
export type DistritosInput = z.infer<typeof distritosSchema>;
export type BuscarInput = z.infer<typeof buscarSchema>;
export type DetalleInput = z.infer<typeof detalleSchema>;
