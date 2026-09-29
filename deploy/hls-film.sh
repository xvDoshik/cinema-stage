#!/usr/bin/env bash
set -euo pipefail

MEDIA_ROOT="${MEDIA_ROOT:-/opt/cinema-stage/www/media}"
HLS_DIR="${MEDIA_ROOT}/hls"
LOG="${HLS_LOG:-/var/log/hls-pack.log}"
SEG_TIME="${HLS_SEGMENT_SEC:-6}"

pick_source() {
  local link="${MEDIA_ROOT}/film.mp4"
  if [[ -L "$link" || -f "$link" ]]; then
    readlink -f "$link" 2>/dev/null || echo "$link"
    return
  fi
  if [[ -n "${SOURCE_MP4:-}" && -f "${SOURCE_MP4}" ]]; then
    echo "${SOURCE_MP4}"
    return
  fi
  echo ""
}

SRC="$(pick_source)"
if [[ -z "$SRC" || ! -f "$SRC" ]]; then
  echo "No source mp4 (set film.mp4 symlink or SOURCE_MP4)" >&2
  exit 1
fi

if pgrep -f "ffmpeg.*${HLS_DIR}/index.m3u8" >/dev/null 2>&1; then
  echo "HLS encode already running (see ${LOG})"
  exit 0
fi

mkdir -p "$HLS_DIR"
rm -f "${HLS_DIR}"/seg*.ts "${HLS_DIR}/index.m3u8"

nohup ffmpeg -y -i "$SRC" -c copy -f hls \
  -hls_time "$SEG_TIME" \
  -hls_list_size 0 \
  -hls_flags independent_segments \
  -hls_segment_filename "${HLS_DIR}/seg%05d.ts" \
  "${HLS_DIR}/index.m3u8" >>"$LOG" 2>&1 &

echo "HLS started from ${SRC} → ${HLS_DIR}/index.m3u8 (log: ${LOG})"
