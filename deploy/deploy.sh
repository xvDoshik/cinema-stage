#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
HOST="${DEPLOY_HOST:-your-vps}"
REMOTE_WWW="${REMOTE_WWW:-/opt/cinema-stage/www}"

cd "$ROOT"
VITE_VIDEO_URL="${VITE_VIDEO_URL:-/media/film.mp4}" \
VITE_HLS_URL="${VITE_HLS_URL:-/media/hls/index.m3u8}" \
npm run build

ssh "$HOST" "sudo mkdir -p ${REMOTE_WWW}"
rsync -avz --delete \
  --filter 'P media/film.mp4' \
  --filter 'P media/hls/' \
  "$ROOT/dist/" "${HOST}:${REMOTE_WWW}/"

echo "Deployed static site to ${HOST}:${REMOTE_WWW}"
