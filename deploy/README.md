# Deploy

## Layout (example)

```
/opt/cinema-stage/
  www/                 ← `dist/` from `npm run build`
    media/
      film.mp4         ← symlink to your source MP4 (video + audio)
      hls/
        index.m3u8
        seg00000.ts …
```

## Build & sync

```bash
cp .env.example .env
# set VITE_SITE_URL, titles, media paths

npm run build
DEPLOY_HOST=your-vps REMOTE_WWW=/opt/cinema-stage/www ./deploy/deploy.sh
```

`deploy.sh` uses rsync `--delete` but **preserves** `media/film.mp4` and `media/hls/` on the server.

## Media symlink

Point the public MP4 at your file on disk (must contain both video and audio):

```bash
SOURCE_MP4=/path/to/master.mp4 MEDIA_ROOT=/opt/cinema-stage/www/media ./deploy/link-film.sh
```

## HLS packaging

After `film.mp4` exists:

```bash
MEDIA_ROOT=/opt/cinema-stage/www/media ./deploy/hls-film.sh
```

Log default: `/var/log/hls-pack.log`. Tune segment length with `HLS_SEGMENT_SEC` (default `6`).

## Nginx

- Document root → `www`
- `/media/hls/*.m3u8` — `Cache-Control: no-store`
- `/media/hls/seg*.ts` — long-lived immutable cache
- `/media/*.mp4` — byte ranges, typically `no-store` if behind a CDN

See [nginx.example.conf](./nginx.example.conf).
