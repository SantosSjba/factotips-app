# Playbook FactoTips — mismo patrón que FactoFarm
# Compila en la Mac → Docker Hub :latest → Coolify solo pull + run

> Guía general: `SISTEMA FARMACIA/api-factofarm/docs/COOLIFY-DOCKER-DEPLOY.md`

## Idea

| Problema | Decisión |
|----------|----------|
| VPS pequeño: Nixpacks satura CPU | **No construir en el VPS** |
| Coolify git/Nixpacks = build pesado | Pack **Docker Image**: solo `pull` + `run` |
| Tags de prueba | Solo **`santossjba/factotips-app:latest`** |

```mermaid
flowchart LR
  A[Código en Mac] --> B[docker buildx linux/amd64]
  B --> C[Docker Hub :latest]
  C --> D[Coolify pull]
  D --> E[Contenedor VPS]
  E --> F[facto-tips.factosysperu.com]
```

## Imagen

| Campo | Valor |
|-------|--------|
| Imagen | `santossjba/factotips-app:latest` |
| Coolify app | `factotips-app-img` (`i3ez3ybflsa0vc6q0dbg6vco`) — pack **Docker Image** |
| URL | https://facto-tips.factosysperu.com |
| Puerto | `3000` |
| Postgres | Coolify `postgresql-db` → `factotips_db` |
| Healthcheck | `GET /api/health` |

## Build + push (Mac, amd64)

```bash
cd /ruta/a/factotips-app

# Requiere: Docker Desktop + `docker login` como santossjba
./scripts/deploy-image.sh
```

O manual:

```bash
docker buildx build --platform linux/amd64 \
  --build-arg NEXT_PUBLIC_SITE_URL=https://facto-tips.factosysperu.com \
  -t santossjba/factotips-app:latest \
  --push .
```

## Coolify

1. App **FACTOSYS TIPS → factotips-app-img** (pack **Docker Image**; la app Nixpacks antigua quedó detenida).
2. Image: `santossjba/factotips-app`, tag: `latest`.
3. Ports exposes: `3000`.
4. Domain: `https://facto-tips.factosysperu.com`.
5. Healthcheck: path `/api/health`, port `3000`, enabled.
6. Env runtime (secretos **no** van en la imagen):

```bash
HOSTNAME=0.0.0.0
PORT=3000
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
NEXT_PUBLIC_SITE_URL=https://facto-tips.factosysperu.com
DIGEMID_BASE_URL=https://ms-opm.minsa.gob.pe/msopmcovid
DIGEMID_ORIGIN=https://opm-digemid.minsa.gob.pe
DATABASE_URL=postgresql://postgres:PASSWORD@e84y1cim7bbgl5g0627kxdba:5432/factotips_db
```

> `DATABASE_URL` usa el **hostname interno** del contenedor Postgres (red `coolify`), no `:5433` público.

7. Deploy / Force rebuild (pull `latest`).

## Migraciones Prisma (desde Mac)

```bash
# .env.local con DATABASE_URL al puerto público 5433
pnpm db:deploy
```

## Qué no hacer

- Compilar con Nixpacks en el VPS.
- Acumular tags `fix1`, `2026-...` en Docker Hub.
- Meter `.env` / secretos en la imagen.
