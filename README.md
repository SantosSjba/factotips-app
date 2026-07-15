# FactoTips

Hub de **herramientas de utilidad** de [Factosys Perú](https://github.com/SantosSjba).  
Primera herramienta: **comparador de precios de medicamentos** (datos oficiales DIGEMID / MINSA).

- Repo: https://github.com/SantosSjba/factotips-app  
- Plan de trabajo: [`PLAN.md`](./PLAN.md)

## Requisitos

- Node.js 22+
- pnpm 9+ (recomendado; el proyecto usa `pnpm-lock.yaml`)

## Arranque local

```bash
cp .env.example .env.local
pnpm install
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000).

### Scripts

| Comando | Descripción |
|---------|-------------|
| `pnpm dev` | Desarrollo (Turbopack) |
| `pnpm build` | Build de producción |
| `pnpm start` | Servir build |
| `pnpm lint` | ESLint |
| `pnpm db:generate` | Generar Prisma Client |
| `pnpm db:migrate` | Crear/aplicar migraciones (dev) |
| `pnpm db:deploy` | Aplicar migraciones (prod) |
| `pnpm db:studio` | Prisma Studio |

### Variables de entorno

Ver `.env.example`:

| Variable | Uso |
|----------|-----|
| `DIGEMID_BASE_URL` | API OPM DIGEMID |
| `DIGEMID_ORIGIN` | Origin/Referer oficiales |
| `NEXT_PUBLIC_SITE_URL` | URL pública (Open Graph / metadata) |
| `DATABASE_URL` | PostgreSQL Coolify FACTOSYS PERU (`postgresql-db:5433` → `factotips_db`) |

Opcional (multi-instancia): `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` — aún no cableado; el rate limit v1 es en memoria.

Las respuestas DIGEMID se cachean en Postgres (`digemid_cache`) según TTL: buscar 6h, detalle 12h, autocomplete 24h, ubigeo 7d. Si la fila no ha expirado, no se vuelve a llamar a DIGEMID.

## Funcionalidad

| Ruta | Descripción |
|------|-------------|
| `/` | Landing hub FactoTips |
| `/herramientas/precios` | Landing SEO del comparador |
| `/herramientas/precios/consultar` | App del comparador DIGEMID |
| `/api/health` | Healthcheck |
| `/api/precios/*` | Proxy DIGEMID + rate limit |
| `/sitemap.xml` | Sitemap SEO |
| `/robots.txt` | Robots SEO |

**Límite:** 1 consulta de precios (`POST /api/precios/buscar`) por minuto y usuario (cookie `ft_uid` + IP).

**Importante:** FactoTips no vende medicamentos. Los precios provienen del [Observatorio DIGEMID](https://opm-digemid.minsa.gob.pe/#/consulta-producto).

## Deploy (Coolify)

App en Coolify: **FACTOSYS TIPS → factotips-app** con **Nixpacks**.

### Requisitos

1. **Build Pack:** Nixpacks (puerto `3000`).
2. Variables de entorno (ya configurables por API Coolify):

```bash
HOSTNAME=0.0.0.0
PORT=3000
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
NEXT_PUBLIC_SITE_URL=https://facto-tips.factosysperu.com
DIGEMID_BASE_URL=https://ms-opm.minsa.gob.pe/msopmcovid
DIGEMID_ORIGIN=https://opm-digemid.minsa.gob.pe
# Hostname interno del postgresql-db (red Docker Coolify):
DATABASE_URL=postgresql://postgres:PASSWORD@e84y1cim7bbgl5g0627kxdba:5432/factotips_db
```

`nixpacks.toml` incluye un `DATABASE_URL` placeholder solo para `prisma generate` en build; en runtime Coolify inyecta el valor real.

3. Redeploy tras subir cambios a `main`.

### Alternativa: Vercel

Conectar el mismo repo en Vercel, definir las mismas env vars y desplegar.

## Stack

- Next.js 16 (App Router) — UI + Route Handlers
- React 19, TypeScript, Tailwind CSS 4
- Prisma 7 + PostgreSQL (caché DIGEMID)
- Zod, Iconify (`@iconify/react`), SheetJS (`xlsx`)
