"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  ArrowLeft,
  ChevronDown,
  Download,
  ExternalLink,
  Loader2,
  Search,
  Tag,
  X,
} from "lucide-react";
import type { DepartamentoOption } from "@/lib/departamentos";
import {
  buscarPrecios,
  fetchAutocomplete,
  fetchDepartamentos,
  fetchDetalle,
  fetchDistritos,
  fetchProvincias,
} from "@/lib/precios/api";
import {
  computePriceStats,
  exportPreciosXlsx,
  filterPriceRows,
  formatSol,
  isBestUnitPrice,
  sortByUnitPrice,
} from "@/lib/precios/utils";
import type {
  AutocompleteItem,
  DetalleEstablecimiento,
  PrecioRow,
  UbigeoItem,
} from "@/lib/types/precios";
import { cn } from "@/lib/utils";
import { DetailModal } from "./detail-modal";

const fieldClass =
  "w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-foreground outline-none transition placeholder:text-muted/70 focus:border-brand focus:ring-2 focus:ring-brand/20 disabled:opacity-60";

const labelClass = "mb-1.5 block text-xs font-medium text-foreground/80";

export function PreciosTool() {
  const productRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [departamentos, setDepartamentos] = useState<DepartamentoOption[]>([]);
  const [productoQuery, setProductoQuery] = useState("");
  const [producto, setProducto] = useState<AutocompleteItem | null>(null);
  const [sugerencias, setSugerencias] = useState<AutocompleteItem[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [sinResultadosProducto, setSinResultadosProducto] = useState(false);
  const [loadingProducto, setLoadingProducto] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);

  const [codigoDepartamento, setCodigoDepartamento] = useState("");
  const [codigoProvincia, setCodigoProvincia] = useState("");
  const [codigoUbigeo, setCodigoUbigeo] = useState("");
  const [codTipoEstablecimiento, setCodTipoEstablecimiento] = useState("");
  const [nombreEstablecimiento, setNombreEstablecimiento] = useState("");
  const [nombreLaboratorio, setNombreLaboratorio] = useState("");
  const [provincias, setProvincias] = useState<UbigeoItem[]>([]);
  const [distritos, setDistritos] = useState<UbigeoItem[]>([]);
  const [loadingProvincias, setLoadingProvincias] = useState(false);
  const [loadingDistritos, setLoadingDistritos] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(true);

  const [resultados, setResultados] = useState<PrecioRow[]>([]);
  const [buscado, setBuscado] = useState(false);
  const [loadingPrecios, setLoadingPrecios] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [retryAfter, setRetryAfter] = useState(0);

  const [busquedaTabla, setBusquedaTabla] = useState("");
  const [filtroTabla, setFiltroTabla] = useState("");
  const [ordenPrecio, setOrdenPrecio] = useState<"asc" | "desc">("asc");
  const [paginaActual, setPaginaActual] = useState(1);
  const [porPagina, setPorPagina] = useState(20);

  const [modalOpen, setModalOpen] = useState(false);
  const [detalle, setDetalle] = useState<DetalleEstablecimiento | null>(null);
  const [loadingDetalle, setLoadingDetalle] = useState(false);
  const [errorDetalle, setErrorDetalle] = useState("");

  const puedeConsultar = Boolean(producto && codigoDepartamento);
  const rateLimited = retryAfter > 0;

  useEffect(() => {
    fetchDepartamentos().then(setDepartamentos).catch(() => setDepartamentos([]));
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (
        productRef.current &&
        !productRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
        setSinResultadosProducto(false);
      }
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  const startCountdown = useCallback((seconds: number) => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    setRetryAfter(seconds);
    countdownRef.current = setInterval(() => {
      setRetryAfter((prev) => {
        if (prev <= 1) {
          if (countdownRef.current) clearInterval(countdownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const runAutocomplete = useCallback(async (q: string) => {
    if (q.length < 2) return;
    setLoadingProducto(true);
    setSinResultadosProducto(false);
    try {
      const data = await fetchAutocomplete(q);
      setSugerencias(data);
      setShowSuggestions(data.length > 0);
      setSinResultadosProducto(data.length === 0);
      setActiveSuggestion(-1);
    } catch {
      setSugerencias([]);
      setSinResultadosProducto(true);
    } finally {
      setLoadingProducto(false);
    }
  }, []);

  const onProductoInput = (value: string) => {
    setProductoQuery(value);
    if (producto) setProducto(null);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const q = value.trim();
    if (q.length < 2) {
      setSugerencias([]);
      setShowSuggestions(false);
      setSinResultadosProducto(false);
      return;
    }
    debounceRef.current = setTimeout(() => runAutocomplete(q), 400);
  };

  const seleccionarProducto = (item: AutocompleteItem) => {
    setProducto(item);
    setProductoQuery(
      `${item.nombreProducto ?? ""} ${item.concent ?? ""}`.trim(),
    );
    setSugerencias([]);
    setShowSuggestions(false);
    setSinResultadosProducto(false);
  };

  const limpiarProducto = () => {
    setProducto(null);
    setProductoQuery("");
    setSugerencias([]);
    setSinResultadosProducto(false);
  };

  const onDepartamentoChange = async (codigo: string) => {
    setCodigoDepartamento(codigo);
    setCodigoProvincia("");
    setCodigoUbigeo("");
    setProvincias([]);
    setDistritos([]);
    if (!codigo) return;
    setLoadingProvincias(true);
    try {
      setProvincias(await fetchProvincias(codigo));
    } finally {
      setLoadingProvincias(false);
    }
  };

  const onProvinciaChange = async (codigo: string) => {
    setCodigoProvincia(codigo);
    setCodigoUbigeo("");
    setDistritos([]);
    if (!codigo || !codigoDepartamento) return;
    setLoadingDistritos(true);
    try {
      setDistritos(await fetchDistritos(codigoDepartamento, codigo));
    } finally {
      setLoadingDistritos(false);
    }
  };

  const onConsultar = async () => {
    if (!producto || !codigoDepartamento || rateLimited) return;
    setLoadingPrecios(true);
    setErrorMsg("");
    setBuscado(false);
    setResultados([]);
    setPaginaActual(1);
    setBusquedaTabla("");
    setOrdenPrecio("asc");

    try {
      const { status, payload } = await buscarPrecios({
        codigoProducto: String(producto.grupo),
        codigoDepartamento,
        codigoProvincia: codigoProvincia || null,
        codigoUbigeo: codigoUbigeo || null,
        codTipoEstablecimiento: (codTipoEstablecimiento as "1" | "2") || null,
        nombreEstablecimiento: nombreEstablecimiento || null,
        nombreLaboratorio: nombreLaboratorio || null,
        codGrupoFF: producto.codGrupoFF ?? null,
        concent: producto.concent ?? null,
        pagina: 1,
      });

      if (status === 429) {
        const wait =
          !payload.success && payload.retryAfter != null
            ? payload.retryAfter
            : 60;
        startCountdown(wait);
        setErrorMsg(
          !payload.success
            ? (payload.message ??
                `Puedes hacer 1 consulta por minuto. Intenta de nuevo en ${wait}s.`)
            : `Puedes hacer 1 consulta por minuto. Intenta de nuevo en ${wait}s.`,
        );
        return;
      }

      if (payload.success) {
        setResultados((payload.data ?? []).filter(Boolean));
      } else {
        setErrorMsg(payload.message ?? "Error al consultar DIGEMID.");
      }
    } catch {
      setErrorMsg("Error de conexión. Intenta nuevamente.");
    } finally {
      setLoadingPrecios(false);
      setBuscado(true);
    }
  };

  const limpiarFiltros = () => {
    limpiarProducto();
    setCodigoDepartamento("");
    setCodigoProvincia("");
    setCodigoUbigeo("");
    setCodTipoEstablecimiento("");
    setNombreEstablecimiento("");
    setNombreLaboratorio("");
    setProvincias([]);
    setDistritos([]);
    setResultados([]);
    setBuscado(false);
    setErrorMsg("");
    setBusquedaTabla("");
    setOrdenPrecio("asc");
    setPaginaActual(1);
  };

  const resultadosFiltrados = useMemo(() => {
    const filtered = filterPriceRows(resultados, {
      query: busquedaTabla,
      tipo: filtroTabla,
    });
    return sortByUnitPrice(filtered, ordenPrecio);
  }, [resultados, busquedaTabla, filtroTabla, ordenPrecio]);

  const stats = useMemo(
    () => computePriceStats(resultadosFiltrados),
    [resultadosFiltrados],
  );

  const totalPaginas = Math.max(
    1,
    Math.ceil(resultadosFiltrados.length / porPagina),
  );
  const paginados = resultadosFiltrados.slice(
    (paginaActual - 1) * porPagina,
    paginaActual * porPagina,
  );

  useEffect(() => {
    setPaginaActual(1);
  }, [busquedaTabla, filtroTabla, ordenPrecio, porPagina]);

  const verDetalle = async (item: PrecioRow) => {
    if (item.codProdE == null || item.codEstab == null) return;
    setModalOpen(true);
    setLoadingDetalle(true);
    setDetalle(null);
    setErrorDetalle("");
    try {
      const payload = await fetchDetalle(
        item.codProdE as string | number,
        String(item.codEstab),
      );
      if (payload.success && payload.data) setDetalle(payload.data);
      else setErrorDetalle(payload.message ?? "No se pudo obtener el detalle.");
    } catch {
      setErrorDetalle("Error de conexión al obtener el detalle.");
    } finally {
      setLoadingDetalle(false);
    }
  };

  const onExport = async () => {
    const label = producto
      ? `${producto.nombreProducto}_${producto.concent ?? ""}`
      : "precios";
    await exportPreciosXlsx(resultadosFiltrados, label);
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <Link
        href="/#herramientas"
        className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-brand"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Volver a herramientas
      </Link>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Comparador de precios
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
            Compara precios unitarios de medicamentos publicados por DIGEMID.
            El mejor precio se destaca automáticamente.
          </p>
        </div>
        <a
          href="https://opm-digemid.minsa.gob.pe/#/consulta-producto"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center gap-1.5 self-start rounded-xl border border-border bg-surface px-4 text-xs font-medium text-foreground hover:bg-brand-soft sm:self-auto"
        >
          Ver en DIGEMID
          <ExternalLink className="h-3.5 w-3.5" aria-hidden />
        </a>
      </div>

      <p className="mt-4 rounded-xl border border-border bg-surface px-4 py-3 text-xs leading-relaxed text-muted sm:text-sm">
        Fuente oficial DIGEMID / MINSA. FactoTips no vende medicamentos. Límite:{" "}
        <strong className="font-semibold text-foreground">
          1 consulta por minuto
        </strong>
        .
      </p>

      {/* Formulario */}
      <section className="mt-6 rounded-2xl border border-border bg-surface p-4 sm:p-6">
        <button
          type="button"
          className="flex w-full items-center justify-between gap-3 text-left md:pointer-events-none"
          onClick={() => setFiltersOpen((v) => !v)}
        >
          <h2 className="font-display text-lg font-semibold text-foreground">
            Filtros de búsqueda
          </h2>
          <ChevronDown
            className={cn(
              "h-5 w-5 text-muted transition-transform md:hidden",
              filtersOpen && "rotate-180",
            )}
          />
        </button>

        <div
          className={cn(
            "mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3",
            !filtersOpen && "hidden md:grid",
          )}
        >
          <div ref={productRef} className="relative lg:col-span-2">
            <label className={labelClass} htmlFor="producto">
              Producto / principio activo <span className="text-danger">*</span>
            </label>
            <div className="relative">
              <input
                id="producto"
                value={productoQuery}
                onChange={(e) => onProductoInput(e.target.value)}
                onFocus={() => {
                  if (sugerencias.length) setShowSuggestions(true);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setShowSuggestions(false);
                    return;
                  }
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setActiveSuggestion((i) =>
                      Math.min(sugerencias.length - 1, i + 1),
                    );
                  } else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setActiveSuggestion((i) => Math.max(-1, i - 1));
                  } else if (e.key === "Enter" && activeSuggestion >= 0) {
                    e.preventDefault();
                    const item = sugerencias[activeSuggestion];
                    if (item) seleccionarProducto(item);
                  }
                }}
                placeholder="Ej: PARACETAMOL, IBUPROFENO..."
                className={cn(fieldClass, "pr-10")}
                autoComplete="off"
              />
              <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                {loadingProducto ? (
                  <Loader2 className="h-4 w-4 animate-spin text-brand" />
                ) : (
                  <Search className="h-4 w-4 text-muted" />
                )}
              </span>
            </div>

            {showSuggestions && sugerencias.length > 0 ? (
              <ul className="absolute z-30 mt-1 max-h-[280px] w-full overflow-y-auto rounded-xl border border-border bg-surface shadow-xl">
                {sugerencias.map((item, idx) => (
                  <li key={`${item.grupo}-${idx}`}>
                    <button
                      type="button"
                      className={cn(
                        "flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm transition",
                        idx === activeSuggestion
                          ? "bg-brand-soft"
                          : "hover:bg-background",
                      )}
                      onClick={() => seleccionarProducto(item)}
                    >
                      <span className="font-medium text-foreground">
                        {item.nombreProducto} {item.concent ?? ""}
                      </span>
                      <span className="text-xs text-muted">
                        {item.nombreFormaFarmaceutica ?? ""}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}

            {sinResultadosProducto ? (
              <div className="absolute z-30 mt-1 w-full rounded-xl border border-amber-200 bg-amber-50 p-4">
                <p className="text-sm font-semibold text-amber-800">
                  No se encontró &quot;{productoQuery}&quot;
                </p>
                <p className="mt-1 text-xs text-amber-700">
                  Intenta con el nombre genérico.
                </p>
              </div>
            ) : null}

            {producto ? (
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-lg bg-brand-soft px-3 py-1 text-xs font-medium text-brand-dark">
                  {producto.nombreProducto} {producto.concent ?? ""}
                </span>
                <button
                  type="button"
                  onClick={limpiarProducto}
                  className="inline-flex min-h-9 items-center gap-1 text-xs text-muted hover:text-danger"
                >
                  <X className="h-3.5 w-3.5" />
                  Cambiar
                </button>
              </div>
            ) : null}
          </div>

          <FieldSelect
            id="tipo"
            label="Tipo establecimiento"
            value={codTipoEstablecimiento}
            onChange={setCodTipoEstablecimiento}
          >
            <option value="">Todos</option>
            <option value="1">Privado</option>
            <option value="2">Público</option>
          </FieldSelect>

          <FieldSelect
            id="departamento"
            label="Departamento *"
            value={codigoDepartamento}
            onChange={(v) => void onDepartamentoChange(v)}
            required
          >
            <option value="">— Seleccionar —</option>
            {departamentos.map((d) => (
              <option key={d.codigo} value={d.codigo}>
                {d.nombre}
              </option>
            ))}
          </FieldSelect>

          <FieldSelect
            id="provincia"
            label="Provincia"
            value={codigoProvincia}
            onChange={(v) => void onProvinciaChange(v)}
            disabled={!codigoDepartamento || loadingProvincias}
          >
            <option value="">— Seleccionar —</option>
            {provincias.map((p) => (
              <option key={p.codigo} value={p.codigo}>
                {p.descripcion}
              </option>
            ))}
          </FieldSelect>

          <FieldSelect
            id="distrito"
            label="Distrito"
            value={codigoUbigeo}
            onChange={setCodigoUbigeo}
            disabled={!codigoProvincia || loadingDistritos}
          >
            <option value="">— Todos —</option>
            {distritos.map((d) => (
              <option key={d.codigo} value={d.codigo}>
                {d.descripcion}
              </option>
            ))}
          </FieldSelect>

          <div>
            <label className={labelClass} htmlFor="laboratorio">
              Laboratorio
            </label>
            <input
              id="laboratorio"
              className={fieldClass}
              value={nombreLaboratorio}
              onChange={(e) => setNombreLaboratorio(e.target.value)}
              placeholder="Nombre laboratorio..."
            />
          </div>

          <div>
            <label className={labelClass} htmlFor="farmacia">
              Farmacia / Botica
            </label>
            <input
              id="farmacia"
              className={fieldClass}
              value={nombreEstablecimiento}
              onChange={(e) => setNombreEstablecimiento(e.target.value)}
              placeholder="Nombre establecimiento..."
            />
          </div>
        </div>

        <div
          className={cn(
            "mt-5 flex flex-wrap items-center gap-3",
            !filtersOpen && "hidden md:flex",
          )}
        >
          <button
            type="button"
            onClick={() => void onConsultar()}
            disabled={!puedeConsultar || loadingPrecios || rateLimited}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-brand px-5 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-55"
          >
            {loadingPrecios ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            {loadingPrecios
              ? "Consultando..."
              : rateLimited
                ? `Espera ${retryAfter}s`
                : "Consultar precios"}
          </button>
          <button
            type="button"
            onClick={limpiarFiltros}
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-border bg-background px-5 text-sm font-semibold text-foreground hover:bg-brand-soft"
          >
            Limpiar
          </button>
        </div>

        {!puedeConsultar ? (
          <p className="mt-3 text-xs text-amber-700">
            Selecciona un producto del autocomplete y un departamento.
          </p>
        ) : null}
      </section>

      {/* Sticky CTA móvil */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 p-3 backdrop-blur md:hidden">
        <button
          type="button"
          onClick={() => void onConsultar()}
          disabled={!puedeConsultar || loadingPrecios || rateLimited}
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand text-sm font-semibold text-white disabled:opacity-55"
        >
          {loadingPrecios ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
          {rateLimited
            ? `Espera ${retryAfter}s`
            : loadingPrecios
              ? "Consultando..."
              : "Consultar precios"}
        </button>
      </div>

      {errorMsg ? (
        <div
          className="mt-4 rounded-xl border border-danger/30 bg-red-50 px-4 py-3 text-sm text-danger"
          role="alert"
        >
          {errorMsg}
        </div>
      ) : null}

      {/* Resultados */}
      {resultados.length > 0 || (buscado && resultados.length === 0) ? (
        <div className="mt-6 pb-24 md:pb-6">
          {resultados.length > 0 ? (
            <>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <StatCard label="Total registros" value={String(stats.count)} />
                <StatCard
                  label="Precio mínimo"
                  value={formatSol(stats.min)}
                  tone="good"
                />
                <StatCard
                  label="Precio máximo"
                  value={formatSol(stats.max)}
                  tone="warn"
                />
                <StatCard
                  label="Precio promedio"
                  value={formatSol(stats.avg)}
                  tone="info"
                />
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2 rounded-xl border border-border bg-surface p-3">
                <input
                  className={cn(fieldClass, "sm:min-w-[180px] sm:flex-1")}
                  value={busquedaTabla}
                  onChange={(e) => setBusquedaTabla(e.target.value)}
                  placeholder="Filtrar por farmacia o laboratorio..."
                  aria-label="Filtrar tabla"
                />
                <select
                  className={cn(fieldClass, "w-auto min-w-[8rem]")}
                  value={filtroTabla}
                  onChange={(e) => setFiltroTabla(e.target.value)}
                  aria-label="Tipo"
                >
                  <option value="">Todos los tipos</option>
                  <option value="Privado">Privado</option>
                  <option value="Público">Público</option>
                </select>
                <select
                  className={cn(fieldClass, "w-auto min-w-[10rem]")}
                  value={ordenPrecio}
                  onChange={(e) =>
                    setOrdenPrecio(e.target.value as "asc" | "desc")
                  }
                  aria-label="Ordenar"
                >
                  <option value="asc">Menor precio primero</option>
                  <option value="desc">Mayor precio primero</option>
                </select>
                <select
                  className={cn(fieldClass, "w-auto min-w-[8rem]")}
                  value={porPagina}
                  onChange={(e) => setPorPagina(Number(e.target.value))}
                  aria-label="Por página"
                >
                  <option value={10}>10 por página</option>
                  <option value={20}>20 por página</option>
                  <option value={50}>50 por página</option>
                </select>
                <button
                  type="button"
                  onClick={() => void onExport()}
                  className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-3 text-xs font-semibold text-emerald-800 hover:bg-emerald-100"
                >
                  <Download className="h-3.5 w-3.5" />
                  Exportar Excel
                </button>
                <span className="w-full text-xs text-muted sm:ml-auto sm:w-auto">
                  <strong className="text-foreground">
                    {resultadosFiltrados.length}
                  </strong>{" "}
                  de {resultados.length} resultados
                </span>
              </div>

              {/* Mobile cards */}
              <ul className="mt-4 space-y-3 md:hidden">
                {paginados.map((item, idx) => {
                  const best = isBestUnitPrice(item, stats.min);
                  return (
                    <li
                      key={`${item.codEstab}-${item.codProdE}-${idx}`}
                      className={cn(
                        "rounded-2xl border p-4",
                        best
                          ? "border-emerald-300 bg-emerald-50/70"
                          : "border-border bg-surface",
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-foreground">
                            {item.nombreComercial ?? "—"}
                          </p>
                          <p className="mt-0.5 text-xs text-muted">
                            {[item.distrito, item.provincia]
                              .filter(Boolean)
                              .join(", ") || "—"}
                          </p>
                        </div>
                        <TipoBadge tipo={item.setcodigo} />
                      </div>
                      <p className="mt-2 text-sm text-foreground">
                        {item.nombreProducto ?? item.nombreSustancia ?? "—"}
                      </p>
                      <p className="text-xs text-muted">
                        {item.concent ?? ""}
                        {item.nombreFormaFarmaceutica
                          ? ` · ${item.nombreFormaFarmaceutica}`
                          : ""}
                      </p>
                      <div className="mt-3 flex items-end justify-between gap-3">
                        <div>
                          <p className="text-[11px] tracking-wide text-muted uppercase">
                            Unitario
                          </p>
                          <p
                            className={cn(
                              "inline-flex items-center gap-1 text-lg font-bold",
                              best ? "text-success" : "text-foreground",
                            )}
                          >
                            {best ? <Tag className="h-4 w-4" /> : null}
                            {formatSol(item.precio2)}
                          </p>
                          <p className="text-xs text-muted">
                            Pack {formatSol(item.precio1)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => void verDetalle(item)}
                          className="inline-flex min-h-11 items-center rounded-xl border border-border px-4 text-sm font-semibold"
                        >
                          Ver
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>

              {/* Desktop table */}
              <div className="mt-4 hidden overflow-hidden rounded-2xl border border-border bg-surface md:block">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-border bg-background text-xs font-semibold tracking-wide text-muted uppercase">
                        <th className="px-4 py-3">Tipo</th>
                        <th className="px-4 py-3">Establecimiento</th>
                        <th className="px-4 py-3">Producto</th>
                        <th className="px-4 py-3">Laboratorio</th>
                        <th className="px-4 py-3">Ubicación</th>
                        <th className="px-4 py-3 text-center">P. unitario</th>
                        <th className="px-4 py-3 text-center">P. pack</th>
                        <th className="px-4 py-3 text-center">Detalle</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {paginados.map((item, idx) => {
                        const best = isBestUnitPrice(item, stats.min);
                        return (
                          <tr
                            key={`${item.codEstab}-${item.codProdE}-${idx}`}
                            className={cn(
                              "transition hover:bg-brand-soft/40",
                              best && "bg-emerald-50/70",
                            )}
                          >
                            <td className="px-4 py-3">
                              <TipoBadge tipo={item.setcodigo} />
                            </td>
                            <td className="px-4 py-3 font-medium text-foreground">
                              {item.nombreComercial ?? "—"}
                            </td>
                            <td className="px-4 py-3">
                              <p className="font-medium text-foreground">
                                {item.nombreProducto ??
                                  item.nombreSustancia ??
                                  "—"}
                              </p>
                              <p className="mt-0.5 text-xs text-muted">
                                {item.concent ?? ""}
                                {item.nombreFormaFarmaceutica
                                  ? ` · ${item.nombreFormaFarmaceutica}`
                                  : ""}
                              </p>
                            </td>
                            <td className="px-4 py-3 text-xs text-muted">
                              {item.nombreLaboratorio ?? "—"}
                            </td>
                            <td className="px-4 py-3 text-xs text-foreground/80">
                              {[item.distrito, item.provincia]
                                .filter(Boolean)
                                .join(", ") || "—"}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span
                                className={cn(
                                  "inline-flex items-center gap-1 rounded-lg px-2.5 py-1 font-bold",
                                  best
                                    ? "bg-emerald-100 text-emerald-800"
                                    : "text-foreground",
                                )}
                              >
                                {best ? <Tag className="h-4 w-4" /> : null}
                                {formatSol(item.precio2)}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center font-semibold text-foreground/80">
                              {formatSol(item.precio1)}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <button
                                type="button"
                                onClick={() => void verDetalle(item)}
                                className="inline-flex min-h-9 items-center rounded-lg border border-border px-3 text-xs font-semibold hover:bg-background"
                              >
                                Ver
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <Pagination
                  page={paginaActual}
                  totalPages={totalPaginas}
                  totalItems={resultadosFiltrados.length}
                  perPage={porPagina}
                  onPage={setPaginaActual}
                />
              </div>

              <div className="mt-3 md:hidden">
                <Pagination
                  page={paginaActual}
                  totalPages={totalPaginas}
                  totalItems={resultadosFiltrados.length}
                  perPage={porPagina}
                  onPage={setPaginaActual}
                />
              </div>
            </>
          ) : (
            <div className="rounded-2xl border border-dashed border-amber-300 bg-amber-50/50 p-8 text-center">
              <p className="text-sm font-medium text-amber-800">
                No se encontraron precios con los filtros seleccionados.
              </p>
            </div>
          )}
        </div>
      ) : null}

      {!buscado && !loadingPrecios ? (
        <div className="mt-6 rounded-2xl border border-dashed border-border bg-background/60 p-12 text-center md:mb-0 mb-20">
          <p className="text-sm font-medium text-muted">
            Busca un medicamento para ver precios en farmacias y boticas del
            Perú
          </p>
        </div>
      ) : null}

      {loadingPrecios ? (
        <div className="mt-6 flex flex-col items-center gap-3 py-10">
          <Loader2 className="h-8 w-8 animate-spin text-brand" />
          <p className="text-sm text-muted">Consultando precios en DIGEMID...</p>
        </div>
      ) : null}

      <DetailModal
        open={modalOpen}
        loading={loadingDetalle}
        error={errorDetalle}
        detalle={detalle}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}

function FieldSelect({
  id,
  label,
  value,
  onChange,
  children,
  disabled,
  required,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  children: ReactNode;
  disabled?: boolean;
  required?: boolean;
}) {
  return (
    <div>
      <label className={labelClass} htmlFor={id}>
        {label}
      </label>
      <select
        id={id}
        className={fieldClass}
        value={value}
        disabled={disabled}
        required={required}
        onChange={(e) => onChange(e.target.value)}
      >
        {children}
      </select>
    </div>
  );
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "good" | "warn" | "info";
}) {
  return (
    <div
      className={cn(
        "rounded-xl border p-3 shadow-sm",
        tone === "good" && "border-emerald-200 bg-emerald-50",
        tone === "warn" && "border-red-200 bg-red-50",
        tone === "info" && "border-sky-200 bg-sky-50",
        !tone && "border-border bg-surface",
      )}
    >
      <p
        className={cn(
          "text-xs",
          tone === "good" && "text-emerald-700",
          tone === "warn" && "text-red-700",
          tone === "info" && "text-sky-700",
          !tone && "text-muted",
        )}
      >
        {label}
      </p>
      <p
        className={cn(
          "mt-0.5 text-xl font-bold",
          tone === "good" && "text-emerald-800",
          tone === "warn" && "text-red-800",
          tone === "info" && "text-sky-800",
          !tone && "text-foreground",
        )}
      >
        {value}
      </p>
    </div>
  );
}

function TipoBadge({ tipo }: { tipo?: string | null }) {
  const privado = tipo === "Privado";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
        privado
          ? "bg-sky-100 text-sky-800"
          : "bg-emerald-100 text-emerald-800",
      )}
    >
      {tipo ?? "—"}
    </span>
  );
}

function Pagination({
  page,
  totalPages,
  totalItems,
  perPage,
  onPage,
}: {
  page: number;
  totalPages: number;
  totalItems: number;
  perPage: number;
  onPage: (p: number) => void;
}) {
  const from = totalItems === 0 ? 0 : (page - 1) * perPage + 1;
  const to = Math.min(page * perPage, totalItems);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3 text-xs text-muted">
      <p>
        Mostrando {from}–{to} de {totalItems} resultados
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPage(page - 1)}
          className="inline-flex min-h-10 items-center rounded-lg border border-border px-3 font-semibold disabled:opacity-40"
        >
          Anterior
        </button>
        <span className="font-medium text-foreground">
          {page} / {totalPages}
        </span>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPage(page + 1)}
          className="inline-flex min-h-10 items-center rounded-lg border border-border px-3 font-semibold disabled:opacity-40"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}
