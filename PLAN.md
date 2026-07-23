# FactoTips — Plan de implementación

> **Producto:** FactoTips — hub de herramientas de utilidad  
> **Empresa:** Factosys Perú  
> **Primera herramienta:** Comparador de precios de medicamentos (DIGEMID / SNIPPF)  
> **Stack:** Next.js 16 (App Router) — front + back en el mismo proyecto  
> **Origen de la lógica:** `cpromed_peru_app` → Consulta de Precios  

Marca el progreso cambiando `- [ ]` por `- [x]` conforme avances.

---

## Decisiones de producto (cerradas)

- [x] Un solo proyecto Next.js (páginas + Route Handlers `app/api/*`)
- [x] Sin NestJS / monorepo API separado en v1
- [x] Acceso libre, sin login en v1
- [x] Rate limit: **1 consulta de precios por minuto por usuario**
- [x] Marca: **FactoTips**, propiedad de **Factosys Perú**
- [x] FactoTips = plataforma de varias herramientas; empezamos por precios DIGEMID

---

## Resumen de arquitectura

```
Browser
  ├── /                                 → Landing hub FactoTips (SEO)
  ├── /herramientas/precios            → Landing de la herramienta (SEO)
  ├── /herramientas/precios/consultar  → App del comparador (UI)
  └── /api/precios/*                    → Proxy DIGEMID + rate limit + caché
         └── https://ms-opm.minsa.gob.pe/msopmcovid
```

**Regla de negocio clave:** el “precio más económico” se ordena y destaca por **`precio2`** (precio unitario), no por `precio1` (precio de presentación).

---

## Estructura de carpetas objetivo

```
factotips-app/
├── PLAN.md                          ← este documento
├── app/
│   ├── (marketing)/
│   │   ├── page.tsx                 # Landing hub
│   │   └── layout.tsx               # (opcional)
│   ├── herramientas/
│   │   └── precios/
│   │       └── page.tsx             # Herramienta
│   ├── api/
│   │   ├── health/route.ts
│   │   └── precios/
│   │       ├── autocomplete/route.ts
│   │       ├── departamentos/route.ts
│   │       ├── provincias/route.ts
│   │       ├── distritos/route.ts
│   │       ├── buscar/route.ts      # rate limit 1/min
│   │       └── detalle/route.ts
│   ├── layout.tsx
│   ├── globals.css
│   └── favicon.ico
├── components/
│   ├── marketing/                   # Landing
│   ├── precios/                     # Tool UI
│   ├── layout/                      # Header, Footer
│   └── ui/                          # Primitivos reutilizables
├── lib/
│   ├── digemid/                     # Cliente HTTP + headers oficiales
│   ├── rate-limit.ts
│   ├── departamentos.ts
│   └── types/precios.ts
├── public/
├── .env.example
├── package.json
└── ...
```

---

## Referencia cpromed → FactoTips

| cpromed_peru_app | FactoTips |
|------------------|-----------|
| `ConsultaPreciosController.php` | `app/api/precios/*` + `lib/digemid/` |
| `resources/js/Pages/ConsultaPrecios/Index.vue` | `app/herramientas/precios/` + `components/precios/` |
| Middleware `auth` | Público + rate limit |
| `Cache::remember` | Caché en servidor (memory / Upstash) |
| Departamentos hardcoded PHP | `lib/departamentos.ts` |
| Inertia CSRF | N/A (mismo origen Next) |

**API DIGEMID (base):** `https://ms-opm.minsa.gob.pe/msopmcovid`  
**Headers:** `Origin` / `Referer` = `https://opm-digemid.minsa.gob.pe`

| Endpoint FactoTips | DIGEMID |
|--------------------|---------|
| `POST /api/precios/autocomplete` | `/producto/autocompleteciudadano` |
| `POST /api/precios/provincias` | `/parametro/provincias` |
| `POST /api/precios/distritos` | `/parametro/distritos` |
| `POST /api/precios/buscar` | `/preciovista/ciudadano` |
| `POST /api/precios/detalle` | `/precioproducto/obtener` |
| `GET /api/precios/departamentos` | Local (códigos 01–25) |

---

## Paquetes a agregar

### Dependencias de producción

- [x] `zod` — validación de bodies API y forms
- [x] `@iconify/react` — iconos (Material Design Icons)
- [x] `xlsx` — exportar resultados a Excel
- [x] `clsx` — utilidades de clases
- [x] `tailwind-merge` — merge de clases Tailwind

### Opcionales (fase polish / prod)

- [ ] `framer-motion` — motion ligero en landing (2–3 animaciones)
- [ ] `@upstash/ratelimit` + `@upstash/redis` — rate limit en multi-instancia

### Persistencia / ORM

- [x] `prisma` + `@prisma/client` + `@prisma/adapter-pg` + `pg` — caché DIGEMID en PostgreSQL

### Ya presentes (scaffold)

- [x] `next` 16.2.10
- [x] `react` / `react-dom` 19
- [x] `tailwindcss` 4
- [x] `typescript`
- [x] `eslint` + `eslint-config-next`

---

## Variables de entorno

Archivo: `.env.example` (y `.env.local` en local)

```bash
# DIGEMID
DIGEMID_BASE_URL=https://ms-opm.minsa.gob.pe/msopmcovid
DIGEMID_ORIGIN=https://opm-digemid.minsa.gob.pe

# PostgreSQL (Coolify postgresql-db → factotips_db)
DATABASE_URL=postgresql://postgres:PASSWORD@HOST:5433/factotips_db

# URL pública
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Rate limit (opcional — prod multi-instancia)
# UPSTASH_REDIS_REST_URL=
# UPSTASH_REDIS_REST_TOKEN=
```

- [x] Crear `.env.example`
- [x] Crear `.env.local` para desarrollo
- [x] Documentar vars en este PLAN (hecho arriba)
- [x] Prisma + `DATABASE_URL` hacia `factotips_db`

---

# Fases

## Fase 0 — Fundamentos del proyecto ✅

**Objetivo:** base limpia, tipos, env y branding mínimo listos.

- [x] Actualizar metadata global (`title`, `description`) a FactoTips / Factosys Perú
- [x] Definir tokens CSS de marca en `globals.css` (evitar look genérico purple/AI)
- [x] Crear `lib/types/precios.ts` (autocomplete, precio row, ubigeo, filtros, detalle)
- [x] Crear `lib/departamentos.ts` (01 AMAZONAS … 25 UCAYALI)
- [x] Crear `.env.example` con vars DIGEMID
- [x] Instalar paquetes base: `zod`, `clsx`, `tailwind-merge`, `@iconify/react`
- [x] Estructura de carpetas `components/`, `lib/digemid/`
- [x] `GET /api/health` → `{ ok: true, service: "factotips" }`

**Criterio de hecho:** `pnpm dev` corre; `/api/health` responde; tipos y departamentos existen. ✅

---

## Fase 1 — Backend DIGEMID (API Routes) ✅

**Objetivo:** proxy completo a DIGEMID con caché y rate limit.

### 1.1 Cliente DIGEMID

- [x] `lib/digemid/client.ts` — `fetch` con base URL, timeout (~15–20s), headers Origin/Referer
- [x] Mapear éxito DIGEMID: `codigo === "00"`
- [x] Respuestas unificadas: `{ success, data?, total?, message? }`
- [x] Nunca exponer stack traces al cliente

### 1.2 Endpoints

- [x] `GET /api/precios/departamentos`
- [x] `POST /api/precios/autocomplete` — body: `{ query }`, min 2 chars, pedir ~15 items
- [x] `POST /api/precios/provincias` — body: `{ codigoDepartamento }`
- [x] `POST /api/precios/distritos` — body: `{ codigoDepartamento, codigoProvincia }`
- [x] `POST /api/precios/buscar` — filtro completo (ver abajo)
- [x] `POST /api/precios/detalle` — `{ codigoProducto, codEstablecimiento }`

### 1.3 Validación (Zod)

- [x] Schema autocomplete
- [x] Schema provincias / distritos
- [x] Schema buscar (producto + departamento requeridos)
- [x] Schema detalle
- [x] Responder `400` con mensaje claro si falla validación

### 1.4 Caché

- [x] Autocomplete: TTL **24 horas** (memoria + Postgres)
- [x] Provincias / distritos: TTL **7 días**
- [x] Buscar: TTL **6 horas** (precios) — evita repetir DIGEMID
- [x] Detalle: TTL **12 horas**
- [x] Persistencia: tabla `digemid_cache` vía Prisma (`expiresAt` / `fetchedAt`)
- [x] Si la fila no expiró → servir desde BD; si expiró → DIGEMID + upsert

### 1.5 Rate limit

- [x] Cookie opaca `ft_uid` (UUID, httpOnly, ~1 año) en primera visita / primer hit API
- [x] Clave: `ft_uid` + IP (fallback: solo IP)
- [x] **`POST /buscar`:** máximo **1 por minuto** por clave
- [x] Autocomplete / ubigeo / detalle: throttle suave (ej. 20/min) anti-abuso
- [x] Respuesta `429` con `{ success: false, message, retryAfter }`
- [x] Implementación v1: Map en memoria
- [ ] (Opcional prod) migrar a Upstash si hay varias instancias

### Body de búsqueda (paridad cpromed)

```ts
{
  codigoProducto: string;       // autocomplete.grupo
  codigoDepartamento: string;   // required
  codigoProvincia?: string | null;
  codigoUbigeo?: string | null;
  codTipoEstablecimiento?: "1" | "2" | null; // 1 Privado, 2 Público
  nombreEstablecimiento?: string | null;
  nombreLaboratorio?: string | null;
  codGrupoFF?: string | null;
  concent?: string | null;
  pagina?: number;
  // servidor envía a DIGEMID:
  // tamanio: 100, tokenGoogle: "", nombreProducto: null
}
```

**Criterio de hecho:** desde Postman/curl se puede autocomplete → buscar → detalle; rate limit bloquea 2.ª búsqueda dentro del mismo minuto. ✅

---

## Fase 2 — Landing hub FactoTips ✅

**Objetivo:** `/` presenta la marca y da acceso a herramientas.

### 2.1 Layout global

- [x] Header: logo/nombre **FactoTips**, nav (Inicio, Herramientas)
- [x] Footer: © Factosys Perú · aviso de que los precios provienen de DIGEMID/MINSA · “FactoTips no vende medicamentos”
- [x] Responsive (mobile menu si hace falta)

### 2.2 Hero (primera viewport)

- [x] Marca FactoTips como señal principal (no solo nav)
- [x] Un headline + una frase de apoyo
- [x] Un grupo de CTA (ej. “Ver herramientas” / “Comparar precios”)
- [x] Un ancla visual dominante (full-bleed o atmósfera), sin clutter de stats/cards en el hero
- [x] Full responsive

### 2.3 Sección herramientas

- [x] Título + frase corta (hub de utilidades)
- [x] Card/item activo: **Comparador de precios de medicamentos** → `/herramientas/precios`
- [x] Placeholders “Próximamente” para futuras herramientas
- [x] Responsive

### 2.4 Cómo funciona / confianza (sección secundaria)

- [x] 3 pasos breves: buscar medicamento → filtrar región → comparar precio unitario
- [x] Disclaimer DIGEMID + enlace a portal oficial OPM si aplica

### 2.5 SEO / metadata

- [x] `title` / `description` orientados a FactoTips
- [x] Open Graph básico

**Criterio de hecho:** landing legible en móvil y desktop; CTA lleva a la herramienta (aunque esta aún sea stub). ✅

---

## Fase 3 — Herramienta de precios (UI) ✅

**Objetivo:** portar UX de cpromed a React, full responsive.

### 3.1 Página y shell

- [x] Ruta `/herramientas/precios`
- [x] Breadcrumb / volver al hub
- [x] Título + breve explicación + disclaimer DIGEMID
- [x] Instalar `xlsx` para export

### 3.2 Formulario de búsqueda

- [x] Input producto con autocomplete (debounce **400 ms**, min **2** chars)
- [x] Lista de sugerencias (máx. ~12 en UI): nombre, concentración, forma farm.
- [x] Producto seleccionado obligatorio para consultar
- [x] Select departamento (requerido)
- [x] Select provincia (depende de dpto; carga vía API)
- [x] Select distrito (depende de provincia)
- [x] Filtro tipo: Todos / Privado / Público
- [x] Inputs opcionales: laboratorio, nombre farmacia/establecimiento
- [x] Botón “Consultar precios”
- [x] En móvil: filtros colapsables / drawer si hace falta
- [x] Sticky CTA en móvil (opcional, mejora UX)

### 3.3 Rate limit en UI

- [x] Si API devuelve `429`, mostrar mensaje + countdown `retryAfter`
- [x] Deshabilitar botón “Consultar” hasta que expire el minuto
- [x] Feedback claro sin errores técnicos

### 3.4 Resultados — resumen

- [x] Cards: cantidad de establecimientos, precio unitario mín / máx / promedio
- [x] Cálculo solo con `precio2 > 0`
- [x] Responsive (grid 1 col móvil / 3–4 desktop)

### 3.5 Resultados — listado

- [x] Orden por defecto: **menor `precio2` primero**
- [x] Highlight `esMejorPrecio` (coincide con mínimo ± 0.01)
- [x] Desktop: tabla (establecimiento, tipo, producto, lab, ubigeo, precio1, precio2, acciones)
- [x] Móvil: **cards** apiladas (no tabla horizontal forzada)
- [x] Filtros cliente: texto farmacia/lab, Privado/Público
- [x] Paginación cliente: 10 / 20 / 50
- [x] Acción “Ver” → modal detalle
- [x] Exportar Excel (`xlsx`)

### 3.6 Modal detalle

- [x] Cargar `POST /api/precios/detalle` con `codProdE` + `codEstab`
- [x] Mostrar dirección, teléfono, horarios, registro sanitario, precios, etc.
- [x] Estados loading / error
- [x] Cierre accesible (ESC, overlay, botón)

### 3.7 Estados UX

- [x] Loading (skeleton o spinner) en buscar / autocomplete / detalle
- [x] Empty state (sin resultados)
- [x] Error DIGEMID / red (mensaje humano)
- [x] Estado inicial (aún no se ha buscado)

**Criterio de hecho:** flujo completo usable en móvil y desktop; 2.ª consulta en <1 min queda bloqueada con countdown. ✅

---

## Fase 4 — Polish, calidad y deploy ✅

**Objetivo:** listo para publicar.

### 4.1 Calidad

- [x] Revisar tipografía/contraste/espaciado en landing y herramienta
- [x] Verificar touch targets ≥ ~44px en móvil
- [x] Probar en viewport angosto (~360px) y desktop
- [x] `pnpm lint` limpio
- [x] `pnpm build` exitoso
- [x] Smoke test real contra DIGEMID (autocomplete + buscar + detalle)

### 4.2 Contenido legal / confianza

- [x] Disclaimer visible: datos oficiales DIGEMID/MINSA; FactoTips no comercializa medicamentos
- [x] Crédito Factosys Perú en footer
- [x] Link al portal OPM DIGEMID (`https://opm-digemid.minsa.gob.pe/#/consulta-producto`)

### 4.3 Deploy

- [x] Definir hosting (Coolify / Vercel / otro) — **Coolify sugerido** (proyecto FACTOSYS PERU); Dockerfile listo
- [x] Configurar env de producción (`DIGEMID_*`) — documentado en README / `.env.example`
- [ ] Si multi-instancia: activar Upstash rate limit — opcional post-v1
- [x] Healthcheck `/api/health`
- [x] URL canónica y HTTPS — vía Coolify/dominio al desplegar (`NEXT_PUBLIC_SITE_URL`)

### 4.4 Documentación

- [x] Actualizar `README.md` (cómo correr local, env, scripts)
- [x] Marcar fases completadas en este `PLAN.md`

**Criterio de hecho:** build verde + herramienta usable en producción con rate limit activo. ✅ (pendiente solo crear la app en Coolify con el repo ya en GitHub)

---

## Fuera de alcance (v1)

No incluir en el MVP salvo decisión explícita:

- [ ] Login / registro / roles
- [x] Base de datos / historial de búsquedas — caché DIGEMID + historial anónimo (`ft_uid`); `userId`/`claimAnonymousHistory` listos para login
- [ ] Scraping de farmacias (solo API oficial DIGEMID)
- [ ] App móvil nativa
- [ ] Panel admin
- [ ] reCAPTCHA DIGEMID (cpromed envía `tokenGoogle: ''`; igual en v1)
- [ ] NestJS / monorepo multi-app

---

## Roadmap posterior (post-v1)

Ideas para el hub (detalle y sprints en [`PLAN-HERRAMIENTAS.md`](./PLAN-HERRAMIENTAS.md)):

- [x] Calculadoras PE: IGV, UIT, sueldo neto, honorarios, CTS, gratificación
- [x] Generador QR (client-side)
- [ ] Kit PDF (Sprint D): hub D0 ✅ · Unir ✅ (factotips-py) · resto Ordenar → Optimizar → Convertir → Editar → Seguridad → Intelligence — ver [`PLAN-HERRAMIENTAS.md`](./PLAN-HERRAMIENTAS.md)
- [ ] Liquidación / vacaciones, horas extras, AFP vs ONP — Sprint E
- [ ] Calendario SUNAT, utilidades laborales — Sprint F
- [ ] Analytics anónimas de uso (qué se busca más)
- [ ] Rate limit Redis/Upstash por defecto
- [ ] Guardar búsquedas favoritas (requeriría auth) — historial anónimo ya existe; favoritos pinneados + cross-device con login
- [ ] PWA / share de resultados
- [ ] Login: asociar `search_history` anónimo vía `claimAnonymousHistory(ft_uid, userId)`

**Fuera de alcance:** consulta RUC (SUNAT ya la ofrece al público).

---

## Riesgos y mitigaciones

| Riesgo | Mitigación | Estado |
|--------|------------|--------|
| DIGEMID cambia API o bloquea IP | Headers oficiales; timeouts; caché Postgres; mensajes claros; no scrapear HTML | [x] Caché BD + monitorear |
| Abuso del proxy público | 1 busca/min + throttle suave en resto | [x] Implementado en Fase 1 |
| Rate limit en memoria no sirve en N réplicas | Upstash en Fase 4 si aplica | [ ] Evaluar en deploy |
| Latencia DIGEMID alta | Skeletons; cachear buscar/detalle con TTL | [x] Caché 6h/12h |
| reCAPTCHA vacío rechazado por DIGEMID | Igual que cpromed; monitorear errores | [ ] Observar |

---

## Orden de trabajo recomendado

1. Fase 0 → fundamentos  
2. Fase 1 → APIs + rate limit  
3. Fase 2 → landing (puede ir en paralelo parcial con 1)  
4. Fase 3 → herramienta UI  
5. Fase 4 → polish + deploy  

**Estimación total:** ~4–6 días hábiles.

---

## Registro de avances

| Fecha | Nota |
|-------|------|
| 2026-07-14 | Plan creado. Decisiones de producto cerradas. |
| 2026-07-14 | **Fase 0 completada:** metadata, tokens marca (teal), tipos, departamentos, env, paquetes base, `/api/health`, stub home. Build OK. |
| 2026-07-14 | **Fase 1 completada:** proxy DIGEMID, 6 endpoints, Zod, caché autocomplete/ubigeo, rate limit 1/min en `/buscar` (cookie `ft_uid` + IP). Smoke test OK (PARACETAMOL Lima → 270 filas; 2.ª busca → 429). |
| 2026-07-14 | **Fase 2 completada:** landing hub (hero FactoTips, herramientas, cómo funciona), header/footer responsive, OG metadata, stub `/herramientas/precios`. |
| 2026-07-14 | **Fase 3 completada:** herramienta completa (autocomplete, filtros, resultados tabla/cards, highlight precio unitario, modal detalle, Excel, countdown 429). |
| 2026-07-14 | Repo en GitHub: https://github.com/SantosSjba/factotips-app. **Fase 4:** lint/build OK, README, Dockerfile (Coolify FACTOSYS PERU), polish safe-area. Pendiente crear Application en Coolify. |
| 2026-07-14 | **Postgres + Prisma:** `factotips_db` en Coolify, tabla `digemid_cache`, TTLs (buscar 6h / detalle 12h / autocomplete 24h / ubigeo 7d). Endpoints precios leen/escriben caché antes de llamar DIGEMID. |
| 2026-07-14 | **Historial anónimo:** tabla `search_history` (`anonymousId` = `ft_uid`, `userId` nullable). API GET/DELETE `/api/precios/historial` + UI “Búsquedas recientes”. Listo para claim al login. |

<!-- Añadir filas aquí conforme se complete cada fase -->
`)