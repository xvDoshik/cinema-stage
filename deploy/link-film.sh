#!/usr/bin/env bash
set -euo pipefail

MEDIA_ROOT="${MEDIA_ROOT:-/opt/cinema-stage/www/media}"
LINK="${MEDIA_ROOT}/film.mp4"
SOURCE_MP4="${SOURCE_MP4:-}"

mkdir -p "$MEDIA_ROOT"

if [[ -z "$SOURCE_MP4" ]]; then
  echo "Set SOURCE_MP4=/absolute/path/to/master.mp4" >&2
  exit 1
fi

if [[ ! -f "$SOURCE_MP4" ]]; then
  echo "File not found: $SOURCE_MP4" >&2
  exit 1
fi

if ! ffprobe -hide_banner -loglevel error -select_streams v:0 -show_entries stream=codec_type -of csv=p=0 "$SOURCE_MP4" 2>/dev/null | grep -q video; then
  echo "No video stream in $SOURCE_MP4" >&2
  exit 1
fi

if ! ffprobe -hide_banner -loglevel error -select_streams a:0 -show_entries stream=codec_type -of csv=p=0 "$SOURCE_MP4" 2>/dev/null | grep -q audio; then
  echo "No audio stream in $SOURCE_MP4" >&2
  exit 1
fi

rm -f "$LINK"
ln -sf "$SOURCE_MP4" "$LINK"
ls -lh "$LINK"
echo "Linked $SOURCE_MP4 -> $LINK"
