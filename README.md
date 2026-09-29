EN | [RU](docs/README_RU.md)

## cinema-stage 🎬

![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)
![HLS](https://img.shields.io/badge/Playback-HLS.js-0038b8?style=flat-square)

Self-hosted **long-form video** web player: keyboard-first UX, settings persistence, and **HLS-first delivery** so multi-hour sources seek without hammering the origin with giant MP4 byte-range storms.

| | |
|---|---|
| Stack | React 19, TypeScript, Vite 8 |
| Streaming | **hls.js** with automatic MP4 fallback |
| Dev sample | 5s generated MP4 in `public/media/` |
| Tag | `v1.0.0` — initial public tree |

---

## ✨ Why HLS for long VOD

Serving a single huge MP4 behind a CDN often means **dozens of HTTP 206** requests on every scrub, slow jumps, and cache edge cases. This project treats **segmented HLS** as the primary path:

| Approach | Seek behaviour | CDN |
|----------|------------------|-----|
| Raw MP4 + Range | Many range reads on one object | Easy to mis-cache |
| **HLS VOD (6s segments)** | Player loads **1–2 `.ts` files** near the playhead | Playlist `no-store`, segments `immutable` |

The client probes `VITE_HLS_URL` at runtime; if the playlist is missing, it falls back to progressive MP4 (`VITE_VIDEO_URL`).

Server-side packaging uses **ffmpeg stream copy** (no re-encode) into `media/hls/` — see [deploy/](deploy/) for nginx cache split and packaging helpers.

---

## ✨ Player highlights

| Feature | Detail |
|---------|--------|
| **Hotkeys** | Space, arrows, `M` mute, `F` fullscreen, `,` / `.` speed, `?` help |
| **Seek bar** | Buffered range + click/drag |
| **Double-click** | Left/right skip (configurable seconds) |
| **Settings drawer** | Volume, speed presets, remember position, skip interval |
| **PiP / fullscreen** | Where the browser allows |
| **Error surface** | Graceful overlay if media is not ready |
| **OG / PWA meta** | Title, description, preview image via env at build time |

Hooks are split for clarity: `useVideoEngine`, `useVideoSource`, `usePersistedSettings`, `useHotkeys`.

---

## 🚀 Quick start (development)

```bash
./scripts/generate-sample.sh
npm install
npm run dev
```

Open http://localhost:5173 — sample file is `public/media/sample.mp4`.

---

## 🔧 Configuration

Copy env template (not committed):

```bash
cp .env.example .env
```

| Variable | Purpose |
|----------|---------|
| `VITE_APP_TITLE` | Page title & OG site name |
| `VITE_OG_DESCRIPTION` | Meta / social description |
| `VITE_SITE_URL` | Canonical URL (no trailing slash) for link previews |
| `VITE_VIDEO_URL` | Progressive MP4 fallback path (default `/media/film.mp4`) |
| `VITE_HLS_URL` | HLS master playlist (default `/media/hls/index.m3u8`) |
| `VITE_OG_IMAGE` | Optional absolute OG image |
| `VITE_TWITTER_CARD` | Optional Twitter card type |

Production build loads `.env` automatically:

```bash
npm run build
npm run preview
```

Static assets land in `dist/` with `base: './'` (works on any path or subdomain).

---

## 📦 Deploy overview

1. Place your **merged** MP4 (video + audio) on the server and point `media/film.mp4` at it.
2. Run HLS packaging (ffmpeg copy) into `www/media/hls/`.
3. Build with the same `VITE_*` URLs you expose on nginx.
4. Rsync `dist/` — deploy script **protects** live `media/film.mp4` and `media/hls/` from `--delete`.

Details: [deploy/README.md](deploy/README.md), [deploy/nginx.example.conf](deploy/nginx.example.conf).

Environment overrides for scripts:

| Variable | Default |
|----------|---------|
| `DEPLOY_HOST` | SSH host from your `~/.ssh/config` |
| `REMOTE_WWW` | `/opt/cinema-stage/www` |
| `MEDIA_ROOT` | `$REMOTE_WWW/media` |
| `SOURCE_MP4` | Absolute path to source file for symlink / HLS |

---

## 📁 Structure

```
src/
  components/player/   UI shell, controls, seek, modals
  hooks/               engine, HLS attach, settings, hotkeys
  config/media.ts      env-backed URLs
deploy/                nginx example, rsync, HLS + media helpers
scripts/               local sample generator
public/                icons, OG SVG, dev sample media
```

---

## 🔒 Security & ops notes

- Keep `.env` out of git; never commit licensed studio masters to a public repo.
- Serve `/media/hls/*.m3u8` with **no-store**; segment `.ts` can be long-cache **immutable**.
- Prefer **HTTPS** end-to-end; byte-range MP4 remains supported for fallback only.

---

## 📜 License

| Component | License |
|-----------|---------|
| **cinema-stage** (this source tree) | [MIT](LICENSE) — © 2026 xvDosha |
| **Your media files** | Not included — you must have rights to stream what you host |

Third-party: [hls.js](https://github.com/video-dev/hls.js/) (Apache-2.0), React (MIT).

---

## 🏷️ Tags

| Tag | Meaning |
|-----|---------|
| `v1.0.0` | First release: HLS-first player, deploy helpers, bilingual docs |
