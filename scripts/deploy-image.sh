#!/usr/bin/env bash
# Build linux/amd64 + push santossjba/factotips-app:latest
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

IMAGE="${IMAGE:-santossjba/factotips-app}"
TAG="${TAG:-latest}"
SITE_URL="${NEXT_PUBLIC_SITE_URL:-https://facto-tips.factosysperu.com}"

echo "→ Building ${IMAGE}:${TAG} (linux/amd64)"
echo "  NEXT_PUBLIC_SITE_URL=${SITE_URL}"

docker buildx build --platform linux/amd64 \
  --build-arg "NEXT_PUBLIC_SITE_URL=${SITE_URL}" \
  -t "${IMAGE}:${TAG}" \
  --push \
  .

echo "✓ Pushed ${IMAGE}:${TAG}"
echo "  Coolify → Deploy / Force rebuild (pull latest)"
