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
| `FACTOTIPS_PY_URL` | Base URL del servicio PDF (`factotips-py`), ej. `http://127.0.0.1:8000` |
| `FACTOTIPS_PY_API_KEY` | Misma clave que `API_KEY` en factotips-py (opcional en local) |

Opcional (multi-instancia): `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` — aún no cableado; el rate limit v1 es en memoria.

**Kit PDF:** el browser llama a Next (`/api/pdf/*`); Next proxya a [factotips-py](../factotips-py) (no exponer py a internet).

Las respuestas DIGEMID se cachean en Postgres (`digemid_cache`) según TTL: buscar 6h, detalle 12h, autocomplete 24h, ubigeo 7d. Si la fila no ha expirado, no se vuelve a llamar a DIGEMID.

## Funcionalidad

| Ruta | Descripción |
|------|-------------|
| `/` | Landing hub FactoTips |
| `/herramientas/precios` | Landing SEO del comparador |
| `/herramientas/precios/consultar` | App del comparador DIGEMID |
| `/herramientas/pdf` | Hub del kit PDF |
| `/herramientas/pdf/unir` · `/usar` | Unir PDF (vía factotips-py) |
| `/api/health` | Healthcheck |
| `/api/precios/*` | Proxy DIGEMID + rate limit |
| `/api/pdf/merge` | Proxy merge → factotips-py |
| `/sitemap.xml` | Sitemap SEO |
| `/robots.txt` | Robots SEO |

**Límite:** 1 consulta de precios (`POST /api/precios/buscar`) por minuto y usuario (cookie `ft_uid` + IP).

**Importante:** FactoTips no vende medicamentos. Los precios provienen del [Observatorio DIGEMID](https://opm-digemid.minsa.gob.pe/#/consulta-producto).

## Deploy (Coolify)

**Patrón FactoFarm:** compilar en la Mac → `santossjba/factotips-app:latest` → Coolify solo hace pull (sin Nixpacks en el VPS).

Guía completa: [`docs/COOLIFY-DOCKER-DEPLOY.md`](./docs/COOLIFY-DOCKER-DEPLOY.md)

```bash
# Docker Desktop + login santossjba
./scripts/deploy-image.sh
# Luego en Coolify: Deploy (pull latest)
```

Runtime env en Coolify (ej. `DATABASE_URL` interno a `postgresql-db` / `factotips_db`). Migraciones: `pnpm db:deploy` desde tu Mac.

## Stack

- Next.js 16 (App Router) — UI + Route Handlers
- React 19, TypeScript, Tailwind CSS 4
- Prisma 7 + PostgreSQL (caché DIGEMID)
- Zod, Iconify (`@iconify/react`), SheetJS (`xlsx`)
