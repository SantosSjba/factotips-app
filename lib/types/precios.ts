/** Tipos compartidos — comparador de precios DIGEMID */

export type UbigeoItem = {
  codigo: string;
  descripcion: string;
};

export type AutocompleteItem = {
  nombreProducto: string;
  concent?: string | null;
  nombreFormaFarmaceutica?: string | null;
  /** Código de producto usado en la búsqueda (`grupo` en DIGEMID) */
  grupo: string | number;
  codGrupoFF?: string | null;
  [key: string]: unknown;
};

export type TipoEstablecimiento = "1" | "2";

export type BuscarPreciosFiltro = {
  codigoProducto: string;
  codigoDepartamento: string;
  codigoProvincia?: string | null;
  codigoUbigeo?: string | null;
  /** "1" Privado · "2" Público */
  codTipoEstablecimiento?: TipoEstablecimiento | null;
  nombreEstablecimiento?: string | null;
  nombreLaboratorio?: string | null;
  codGrupoFF?: string | null;
  concent?: string | null;
  pagina?: number;
};

export type PrecioRow = {
  setcodigo?: string | null;
  nombreComercial?: string | null;
  nombreProducto?: string | null;
  nombreSustancia?: string | null;
  concent?: string | null;
  nombreFormaFarmaceutica?: string | null;
  nombreLaboratorio?: string | null;
  departamento?: string | null;
  provincia?: string | null;
  distrito?: string | null;
  /** Precio de presentación (S/) */
  precio1?: number | string | null;
  /** Precio unitario (S/) — métrica de “más económico” */
  precio2?: number | string | null;
  codProdE?: string | null;
  codEstab?: string | null;
  [key: string]: unknown;
};

export type DetalleEstablecimiento = Record<string, unknown>;

export type ApiSuccess<T> = {
  success: true;
  data: T;
  total?: number;
  message?: string;
};

export type ApiFailure = {
  success: false;
  message: string;
  retryAfter?: number;
};

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;
