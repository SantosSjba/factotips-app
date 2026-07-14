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

### Variables de entorno

Ver `.env.example`:

| Variable | Uso |
|----------|-----|
| `DIGEMID_BASE_URL` | API OPM DIGEMID |
| `DIGEMID_ORIGIN` | Origin/Referer oficiales |
| `NEXT_PUBLIC_SITE_URL` | URL pública (Open Graph / metadata) |

Opcional (multi-instancia): `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` — aún no cableado; el rate limit v1 es en memoria.

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

Proyecto sugerido en Coolify: **FACTOSYS PERU**.

1. Nueva **Application** → recurso GitHub `SantosSjba/factotips-app` (branch `main`).
2. Build pack: **Dockerfile** (incluido en el repo).
3. Puerto: `3000`.
4. Healthcheck path: `/api/health`.
5. Variables de entorno de producción:

```bash
DIGEMID_BASE_URL=https://ms-opm.minsa.gob.pe/msopmcovid
DIGEMID_ORIGIN=https://opm-digemid.minsa.gob.pe
NEXT_PUBLIC_SITE_URL=https://TU-DOMINIO
NODE_ENV=production
```

6. Dominio HTTPS en Coolify (Let's Encrypt).

> Nota: con varias réplicas el rate limit en memoria no se comparte. Para eso, migrar a Upstash (opcional en `PLAN.md`).

### Alternativa: Vercel

Conectar el mismo repo en Vercel, definir las mismas env vars y desplegar. El `output: "standalone"` del `next.config` es compatible; Vercel usa su propio build.

## Stack

- Next.js 16 (App Router) — UI + Route Handlers
- React 19, TypeScript, Tailwind CSS 4
- Zod, Lucide, SheetJS (`xlsx`)
