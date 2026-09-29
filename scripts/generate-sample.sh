#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/public/media/sample.mp4"
mkdir -p "$(dirname "$OUT")"
ffmpeg -y \
  -f lavfi -i color=c=0x1a1a2e:s=1280x720:d=5 \
  -f lavfi -i anullsrc=r=44100:cl=stereo \
  -t 5 \
  -c:v libx264 -pix_fmt yuv420p -c:a aac \
  "$OUT"
echo "Wrote $OUT"
