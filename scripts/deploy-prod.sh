#!/usr/bin/env bash
set -Eeuo pipefail

APP_DIR="${APP_DIR:-/var/www/mohaeng-server-core}"
DOCKER_IMAGE="${DOCKER_IMAGE:-}"
HEALTHCHECK_URL="${HEALTHCHECK_URL:-}"
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.prod.yml}"
GHCR_USERNAME="${GHCR_USERNAME:-}"
GHCR_TOKEN="${GHCR_TOKEN:-}"

if [ -z "$DOCKER_IMAGE" ]; then
  echo "DOCKER_IMAGE is required"
  exit 1
fi

mkdir -p "$APP_DIR"
cd "$APP_DIR"

if [ -n "$GHCR_USERNAME" ] && [ -n "$GHCR_TOKEN" ]; then
  echo "$GHCR_TOKEN" | docker login ghcr.io -u "$GHCR_USERNAME" --password-stdin
fi

echo "DOCKER_IMAGE=$DOCKER_IMAGE" > .deploy.env
docker compose --env-file .deploy.env -f "$COMPOSE_FILE" pull
docker compose --env-file .deploy.env -f "$COMPOSE_FILE" up -d --remove-orphans

if [ -n "$HEALTHCHECK_URL" ]; then
  curl -fsS "$HEALTHCHECK_URL" >/dev/null
fi

docker image prune -af --filter "until=168h" || true

echo "Deploy completed for image: $DOCKER_IMAGE"
