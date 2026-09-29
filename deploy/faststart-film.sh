#!/usr/bin/env bash
set -euo pipefail

MEDIA_ROOT="${MEDIA_ROOT:-/opt/cinema-stage/www/media}"
SRC="${1:-$(readlink -f "${MEDIA_ROOT}/film.mp4" 2>/dev/null || echo "${MEDIA_ROOT}/film.mp4")}"
OUT="${2:-${MEDIA_ROOT}/film-faststart.mp4}"
LINK="${MEDIA_ROOT}/film.mp4"

if [[ ! -f "$SRC" ]]; then
  echo "Missing source: $SRC"
  exit 1
fi

if [[ -f "$OUT" ]]; then
  sz=$(stat -c%s "$OUT" 2>/dev/null || stat -f%z "$OUT")
  if [[ "$sz" -gt 1000000000 ]]; then
    echo "Already have $OUT"
    ln -sf "$OUT" "$LINK"
    exit 0
  fi
fi

echo "Remux faststart: $SRC -> $OUT"
ffmpeg -y -i "$SRC" -c copy -movflags +faststart "$OUT"
ln -sf "$OUT" "$LINK"
ls -lh "$LINK" "$OUT"
echo "Done"
