# syntax=docker/dockerfile:1

# Build en Mac (linux/amd64) → push Docker Hub → Coolify solo hace pull.
# Playbook: docs/COOLIFY-DOCKER-DEPLOY.md (mismo patrón FactoFarm).

FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app
# Placeholder solo para `prisma generate` durante el build
ENV DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:5432/factotips_db"
ENV NEXT_TELEMETRY_DISABLED=1

FROM base AS deps
RUN corepack enable && corepack prepare pnpm@latest --activate
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY prisma ./prisma
COPY prisma.config.ts ./
RUN pnpm install --frozen-lockfile

FROM base AS builder
ARG NEXT_PUBLIC_SITE_URL=https://facto-tips.factosysperu.com
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
RUN corepack enable && corepack prepare pnpm@latest --activate
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm exec prisma generate && pnpm exec next build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# curl: Coolify HEALTHCHECK lo necesita dentro del contenedor Alpine
RUN apk add --no-cache curl \
  && addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/lib/generated ./lib/generated

USER nextjs
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=5 \
  CMD curl -fsS "http://127.0.0.1:3000/api/health" || exit 1
CMD ["node", "server.js"]
