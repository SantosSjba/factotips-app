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
  Clock3,
  Download,
  ExternalLink,
  Loader2,
  MapPin,
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
  loadNextSearchAt,
  loadSavedLocation,
  matchDepartamento,
  matchUbigeoItem,
  normalizePlace,
  saveLocation,
  saveNextSearchAt,
  secondsUntil,
  type ReverseGeoResult,
} from "@/lib/precios/location";
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
import { findEmail } from "@/lib/contact/phone";
import { useI18n } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";
import { DetailModal } from "./detail-modal";
import { LocationPickerModal } from "./location-picker-modal";
import {
  ResultContactInfo,
  type CachedContact,
} from "./result-contact-info";
import { Select, fieldControlClass } from "@/components/ui/select";

const fieldClass = fieldControlClass;

const labelClass = "mb-1.5 block text-xs font-medium text-foreground/80";

export function PreciosTool() {
  const { t } = useI18n();
  const productRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [contactByEstab, setContactByEstab] = useState<
    Record<string, CachedContact>
  >({});
  const knownContactKeysRef = useRef(new Set<string>());

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
  const [locationLabel, setLocationLabel] = useState("");
  const [locationMsg, setLocationMsg] = useState("");
  const [locationHydrated, setLocationHydrated] = useState(false);
  const [locationModalOpen, setLocationModalOpen] = useState(false);

  const [resultados, setResultados] = useState<PrecioRow[]>([]);
  const [buscado, setBuscado] = useState(false);
  const [loadingPrecios, setLoadingPrecios] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [retryAfter, setRetryAfter] = useState(() => {
    if (typeof window === "undefined") return 0;
    return secondsUntil(loadNextSearchAt());
  });

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

  const applyUbigeoCodes = useCallback(
    async (
      deptCode: string,
      provCode: string,
      distCode: string,
      label?: string,
      deptList?: DepartamentoOption[],
    ) => {
      const depts = deptList ?? departamentos;
      setCodigoDepartamento(deptCode);
      setCodigoProvincia("");
      setCodigoUbigeo("");
      setProvincias([]);
      setDistritos([]);

      let provs: UbigeoItem[] = [];
      if (deptCode) {
        setLoadingProvincias(true);
        try {
          provs = await fetchProvincias(deptCode);
          setProvincias(provs);
        } finally {
          setLoadingProvincias(false);
        }
      }

      let resolvedProv = provCode;
      if (resolvedProv && !provs.some((p) => p.codigo === resolvedProv)) {
        resolvedProv = "";
      }
      setCodigoProvincia(resolvedProv);

      let dists: UbigeoItem[] = [];
      if (deptCode && resolvedProv) {
        setLoadingDistritos(true);
        try {
          dists = await fetchDistritos(deptCode, resolvedProv);
          setDistritos(dists);
        } finally {
          setLoadingDistritos(false);
        }
      }

      let resolvedDist = distCode;
      if (resolvedDist && !dists.some((d) => d.codigo === resolvedDist)) {
        resolvedDist = "";
      }
      setCodigoUbigeo(resolvedDist);

      const autoLabel =
        label ||
        [
          depts.find((d) => d.codigo === deptCode)?.nombre,
          provs.find((p) => p.codigo === resolvedProv)?.descripcion,
          dists.find((d) => d.codigo === resolvedDist)?.descripcion,
        ]
          .filter(Boolean)
          .join(" · ");

      if (autoLabel) setLocationLabel(autoLabel);
      saveLocation({
        codigoDepartamento: deptCode,
        codigoProvincia: resolvedProv,
        codigoUbigeo: resolvedDist,
        label: autoLabel || undefined,
      });
    },
    [departamentos],
  );

  useEffect(() => {
    fetchDepartamentos()
      .then(async (list) => {
        setDepartamentos(list);
        const saved = loadSavedLocation();
        if (saved?.codigoDepartamento) {
          await applyUbigeoCodes(
            saved.codigoDepartamento,
            saved.codigoProvincia || "",
            saved.codigoUbigeo || "",
            saved.label,
            list,
          );
        }
        setLocationHydrated(true);
      })
      .catch(() => {
        setDepartamentos([]);
        setLocationHydrated(true);
      });
    // Solo al montar
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const remaining = secondsUntil(loadNextSearchAt());
    if (remaining <= 0) return;
    countdownRef.current = setInterval(() => {
      const left = secondsUntil(loadNextSearchAt());
      setRetryAfter(left);
      if (left <= 0 && countdownRef.current) {
        clearInterval(countdownRef.current);
      }
    }, 1000);
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
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
    const nextAt = Date.now() + seconds * 1000;
    saveNextSearchAt(nextAt);
    setRetryAfter(seconds);
    countdownRef.current = setInterval(() => {
      const left = secondsUntil(loadNextSearchAt());
      if (left <= 0) {
        if (countdownRef.current) clearInterval(countdownRef.current);
        setRetryAfter(0);
        return;
      }
      setRetryAfter(left);
    }, 1000);
  }, []);

  const onUsarMiUbicacion = () => {
    setLocationMsg("");
    setLocationModalOpen(true);
  };

  const applyGeoResult = async (geo: ReverseGeoResult) => {
    const dept =
      matchDepartamento(geo.departamento, departamentos) ||
      matchDepartamento(geo.provincia || geo.distrito, departamentos);

    if (!dept) {
      setLocationMsg(
        `Detectamos “${geo.departamento || "ubicación"}”, pero no pudimos mapearlo. Selecciona el departamento manualmente.`,
      );
      return;
    }

    await applyResolvedPlaces(dept, geo.provincia, geo.distrito);
    setLocationMsg(
      "Ubicación aplicada. Puedes ajustar provincia o distrito si hace falta.",
    );
  };

  const applyResolvedPlaces = async (
    dept: DepartamentoOption,
    provinciaRaw: string,
    distritoRaw: string,
  ) => {
    setLoadingProvincias(true);
    let provs: UbigeoItem[] = [];
    try {
      provs = await fetchProvincias(dept.codigo);
      setProvincias(provs);
    } finally {
      setLoadingProvincias(false);
    }

    let provincia =
      matchUbigeoItem(provinciaRaw, provs) ||
      matchUbigeoItem(distritoRaw, provs) ||
      // Lima / Callao: a menudo la primera provincia coincide con el dpto
      provs.find(
        (p) =>
          normalizePlace(p.descripcion) === normalizePlace(dept.nombre),
      ) ||
      null;

    // Si no hay match de provincia pero solo hay una, úsala
    if (!provincia && provs.length === 1) provincia = provs[0] ?? null;

    let dists: UbigeoItem[] = [];
    let distrito: UbigeoItem | null = null;
    if (provincia) {
      setLoadingDistritos(true);
      try {
        dists = await fetchDistritos(dept.codigo, provincia.codigo);
        setDistritos(dists);
      } finally {
        setLoadingDistritos(false);
      }
      distrito =
        matchUbigeoItem(distritoRaw, dists) ||
        matchUbigeoItem(provinciaRaw, dists);
    }

    await applyUbigeoCodes(
      dept.codigo,
      provincia?.codigo ?? "",
      distrito?.codigo ?? "",
      undefined,
      departamentos,
    );
  };

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
    setLocationMsg("");
    if (!codigo) {
      setLocationLabel("");
      return;
    }
    setLoadingProvincias(true);
    try {
      const provs = await fetchProvincias(codigo);
      setProvincias(provs);
      const nombre = departamentos.find((d) => d.codigo === codigo)?.nombre;
      setLocationLabel(nombre ?? "");
      saveLocation({
        codigoDepartamento: codigo,
        codigoProvincia: "",
        codigoUbigeo: "",
        label: nombre,
      });
    } finally {
      setLoadingProvincias(false);
    }
  };

  const onProvinciaChange = async (codigo: string) => {
    setCodigoProvincia(codigo);
    setCodigoUbigeo("");
    setDistritos([]);
    if (!codigo || !codigoDepartamento) {
      saveLocation({
        codigoDepartamento,
        codigoProvincia: "",
        codigoUbigeo: "",
        label:
          departamentos.find((d) => d.codigo === codigoDepartamento)?.nombre,
      });
      return;
    }
    setLoadingDistritos(true);
    try {
      const dists = await fetchDistritos(codigoDepartamento, codigo);
      setDistritos(dists);
      const label = [
        departamentos.find((d) => d.codigo === codigoDepartamento)?.nombre,
        provincias.find((p) => p.codigo === codigo)?.descripcion,
      ]
        .filter(Boolean)
        .join(" · ");
      setLocationLabel(label);
      saveLocation({
        codigoDepartamento,
        codigoProvincia: codigo,
        codigoUbigeo: "",
        label,
      });
    } finally {
      setLoadingDistritos(false);
    }
  };

  const onDistritoChange = (codigo: string) => {
    setCodigoUbigeo(codigo);
    const label = [
      departamentos.find((d) => d.codigo === codigoDepartamento)?.nombre,
      provincias.find((p) => p.codigo === codigoProvincia)?.descripcion,
      distritos.find((d) => d.codigo === codigo)?.descripcion,
    ]
      .filter(Boolean)
      .join(" · ");
    setLocationLabel(label);
    saveLocation({
      codigoDepartamento,
      codigoProvincia,
      codigoUbigeo: codigo,
      label,
    });
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
    knownContactKeysRef.current.clear();
    setContactByEstab({});

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
        // 1 consulta / min: arranca contador también tras éxito
        startCountdown(60);
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
    setCodTipoEstablecimiento("");
    setNombreEstablecimiento("");
    setNombreLaboratorio("");
    setResultados([]);
    setBuscado(false);
    setErrorMsg("");
    setBusquedaTabla("");
    setOrdenPrecio("asc");
    setPaginaActual(1);
    // Conserva la ubicación (departamento / provincia / distrito)
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

  const cacheContact = useCallback(
    (codEstab: string, data: DetalleEstablecimiento) => {
      knownContactKeysRef.current.add(codEstab);
      setContactByEstab((prev) => ({
        ...prev,
        [codEstab]: {
          telefono: data.telefono,
          horarioAtencion: data.horarioAtencion,
          email: findEmail(data),
        },
      }));
    },
    [],
  );

  const markContactTried = useCallback((codEstab: string) => {
    knownContactKeysRef.current.add(codEstab);
    setContactByEstab((prev) => {
      if (Object.prototype.hasOwnProperty.call(prev, codEstab)) return prev;
      return { ...prev, [codEstab]: {} };
    });
  }, []);

  // Prefetch contacto/horario de la página visible (DIGEMID detalle; cache por establecimiento).
  useEffect(() => {
    const pageItems = resultadosFiltrados.slice(
      (paginaActual - 1) * porPagina,
      paginaActual * porPagina,
    );
    if (!pageItems.length) return;
    let cancelled = false;

    const run = async () => {
      const pending = pageItems
        .filter((item) => {
          if (item.codEstab == null || item.codProdE == null) return false;
          const key = String(item.codEstab);
          if (knownContactKeysRef.current.has(key)) return false;
          if (item.telefono || item.horarioAtencion) return false;
          return true;
        })
        .slice(0, 12);

      // Reserve keys so concurrent effect restarts don't duplicate.
      for (const item of pending) {
        if (item.codEstab != null) {
          knownContactKeysRef.current.add(String(item.codEstab));
        }
      }

      const concurrency = 3;
      let index = 0;

      const worker = async () => {
        while (index < pending.length && !cancelled) {
          const item = pending[index++];
          if (!item?.codEstab || item.codProdE == null) continue;
          const key = String(item.codEstab);
          try {
            const payload = await fetchDetalle(
              item.codProdE as string | number,
              key,
            );
            if (cancelled) return;
            if (payload.success && payload.data) {
              cacheContact(key, payload.data);
            } else {
              markContactTried(key);
            }
          } catch {
            markContactTried(key);
          }
        }
      };

      await Promise.all(
        Array.from({ length: Math.min(concurrency, pending.length) }, () =>
          worker(),
        ),
      );
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [
    paginaActual,
    porPagina,
    resultadosFiltrados,
    cacheContact,
    markContactTried,
  ]);

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
      if (payload.success && payload.data) {
        setDetalle(payload.data);
        cacheContact(String(item.codEstab), payload.data);
      } else {
        setErrorDetalle(payload.message ?? "No se pudo obtener el detalle.");
      }
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
        {t.precios.back}
      </Link>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {t.precios.title}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
            {t.precios.subtitle}
          </p>
        </div>
        <a
          href="https://opm-digemid.minsa.gob.pe/#/consulta-producto"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center gap-1.5 self-start rounded-xl border border-border bg-surface px-4 text-xs font-medium text-foreground hover:bg-brand-soft sm:self-auto"
        >
          {t.precios.viewDigemid}
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

      {rateLimited ? (
        <div
          className="mt-4 flex items-center gap-3 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-4 text-amber-950"
          role="status"
          aria-live="polite"
        >
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
            <Clock3 className="h-6 w-6" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">Próxima consulta disponible en</p>
            <p className="mt-0.5 font-display text-3xl font-semibold tabular-nums tracking-tight">
              {String(Math.floor(retryAfter / 60)).padStart(2, "0")}:
              {String(retryAfter % 60).padStart(2, "0")}
            </p>
            <p className="mt-1 text-xs text-amber-800/80">
              Tras cada búsqueda hay que esperar 1 minuto.
            </p>
          </div>
        </div>
      ) : null}

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
            "mt-4 space-y-4",
            !filtersOpen && "hidden md:block",
          )}
        >
          <div className="rounded-2xl border border-brand/20 bg-brand-soft/50 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">
                  Tu ubicación
                </p>
                <p className="mt-1 text-sm text-muted">
                  {locationLabel ? (
                    <>
                      <span className="font-medium text-brand-dark">
                        {locationLabel}
                      </span>
                      <span className="text-muted">
                        {" "}
                        — puedes ajustar provincia o distrito abajo
                      </span>
                    </>
                  ) : locationHydrated ? (
                    "Usa tu GPS o elige departamento / provincia / distrito."
                  ) : (
                    "Cargando ubicación guardada..."
                  )}
                </p>
              </div>
              <button
                type="button"
                onClick={onUsarMiUbicacion}
                disabled={!departamentos.length}
                className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-brand/30 bg-surface px-4 text-sm font-semibold text-brand-dark transition hover:bg-brand-soft disabled:opacity-55"
              >
                <MapPin className="h-4 w-4" />
                Usar mi ubicación
              </button>
            </div>
            {locationMsg ? (
              <p className="mt-3 text-xs text-brand-dark/90">{locationMsg}</p>
            ) : null}
          </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
            onChange={onDistritoChange}
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
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur md:hidden">
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
                  onChange={(e) => {
                    setBusquedaTabla(e.target.value);
                    setPaginaActual(1);
                  }}
                  placeholder="Filtrar por farmacia o laboratorio..."
                  aria-label="Filtrar tabla"
                />
                <Select
                  wrapperClassName="w-full min-w-[8rem] sm:w-auto"
                  className="w-full"
                  value={filtroTabla}
                  onChange={(e) => {
                    setFiltroTabla(e.target.value);
                    setPaginaActual(1);
                  }}
                  aria-label="Tipo"
                >
                  <option value="">Todos los tipos</option>
                  <option value="Privado">Privado</option>
                  <option value="Público">Público</option>
                </Select>
                <Select
                  wrapperClassName="w-full min-w-[10rem] sm:w-auto"
                  className="w-full"
                  value={ordenPrecio}
                  onChange={(e) => {
                    setOrdenPrecio(e.target.value as "asc" | "desc");
                    setPaginaActual(1);
                  }}
                  aria-label="Ordenar"
                >
                  <option value="asc">Menor precio primero</option>
                  <option value="desc">Mayor precio primero</option>
                </Select>
                <Select
                  wrapperClassName="w-full min-w-[8rem] sm:w-auto"
                  className="w-full"
                  value={porPagina}
                  onChange={(e) => {
                    setPorPagina(Number(e.target.value));
                    setPaginaActual(1);
                  }}
                  aria-label="Por página"
                >
                  <option value={10}>10 por página</option>
                  <option value={20}>20 por página</option>
                  <option value={50}>50 por página</option>
                </Select>
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
                      <ResultContactInfo
                        item={item}
                        contact={
                          item.codEstab != null
                            ? (contactByEstab[String(item.codEstab)] ?? null)
                            : null
                        }
                        size="sm"
                      />
                      <div className="mt-3 flex items-end justify-between gap-3">
                        <div>
                          <p className="text-[11px] tracking-wide text-muted uppercase">
                            {t.precios.unit}
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
                            {t.precios.pack} {formatSol(item.precio1)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => void verDetalle(item)}
                          className="inline-flex min-h-11 items-center rounded-xl border border-border px-4 text-sm font-semibold"
                        >
                          {t.precios.view}
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
                        <th className="px-4 py-3">{t.precios.type}</th>
                        <th className="px-4 py-3">{t.precios.establishment}</th>
                        <th className="px-4 py-3">{t.precios.productCol}</th>
                        <th className="px-4 py-3">{t.precios.location}</th>
                        <th className="px-4 py-3">{t.precios.contactCol}</th>
                        <th className="px-4 py-3 text-center">
                          {t.precios.unitPrice}
                        </th>
                        <th className="px-4 py-3 text-center">
                          {t.precios.packPrice}
                        </th>
                        <th className="px-4 py-3 text-center">
                          {t.precios.detail}
                        </th>
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
                              <p className="mt-0.5 text-xs font-normal text-muted">
                                {item.nombreLaboratorio ?? ""}
                              </p>
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
                            <td className="px-4 py-3 text-xs text-foreground/80">
                              {[item.distrito, item.provincia]
                                .filter(Boolean)
                                .join(", ") || "—"}
                            </td>
                            <td className="max-w-[14rem] px-4 py-3">
                              <ResultContactInfo
                                item={item}
                                contact={
                                  item.codEstab != null
                                    ? (contactByEstab[String(item.codEstab)] ??
                                      null)
                                    : null
                                }
                                size="sm"
                                layout="inline"
                              />
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
                                {t.precios.view}
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
                {t.precios.emptyResults}
              </p>
            </div>
          )}
        </div>
      ) : null}

      {!buscado && !loadingPrecios ? (
        <div className="mt-6 rounded-2xl border border-dashed border-border bg-background/60 p-12 text-center md:mb-0 mb-20">
          <p className="text-sm font-medium text-muted">
            {t.precios.initialHint}
          </p>
        </div>
      ) : null}

      {loadingPrecios ? (
        <div className="mt-6 flex flex-col items-center gap-3 py-10">
          <Loader2 className="h-8 w-8 animate-spin text-brand" />
          <p className="text-sm text-muted">{t.precios.querying}</p>
        </div>
      ) : null}

      <DetailModal
        open={modalOpen}
        loading={loadingDetalle}
        error={errorDetalle}
        detalle={detalle}
        onClose={() => setModalOpen(false)}
      />

      <LocationPickerModal
        open={locationModalOpen}
        onClose={() => setLocationModalOpen(false)}
        onConfirm={async ({ geo }) => {
          await applyGeoResult(geo);
        }}
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
      <Select
        id={id}
        value={value}
        disabled={disabled}
        required={required}
        onChange={(e) => onChange(e.target.value)}
      >
        {children}
      </Select>
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
