[EN](../README.md) | RU

## cinema-stage 🎬

![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)

**Self-hosted плеер** для длинного VOD: горячие клавиши, сохранение настроек, **HLS в приоритете**, чтобы перемотка не превращалась в лавину Range-запросов к одному гигантскому MP4.

| | |
|---|---|
| Стек | React 19, TypeScript, Vite 8 |
| Стриминг | **hls.js** + fallback на MP4 |
| Dev | короткий sample в `public/media/` |
| Тег | `v1.0.0` |

---

## ✨ Зачем HLS на длинных фильмах

Один MP4 на 8+ часов за CDN при каждом seek часто даёт **десятки HTTP 206**, медленный отклик и кривой кеш. Здесь основной путь — **HLS VOD** с короткими сегментами:

| Режим | Перемотка | CDN |
|-------|-----------|-----|
| MP4 + Range | Много чтений одного файла | Легко закешировать 404/206 не туда |
| **HLS (~6 с)** | Плеер тянет **1–2 сегмента** | Плейлист без кеша, `.ts` — immutable |

Клиент проверяет `VITE_HLS_URL`; если плейлиста нет — играет progressive MP4 из `VITE_VIDEO_URL`.

На сервере нарезка **ffmpeg -c copy** в `media/hls/` (без перекодирования). Nginx: отдельные правила для `.m3u8` и `.ts` — см. [deploy/](../deploy/).

---

## ✨ Возможности плеера

- Горячие клавиши (play/pause, seek, громкость, скорость, fullscreen, PiP, справка)
- Двойной клик по краям — skip на N секунд
- Полоска прогресса с буфером
- Drawer: громкость, скорость, «запомнить позицию», интервал skip
- Оверлей при ошибке медиа
- OG / meta для шаринга ссылки (через `.env` при сборке)

Архитектура: `useVideoEngine`, `useVideoSource`, `usePersistedSettings`, `useHotkeys`.

---

## 🚀 Быстрый старт

```bash
./scripts/generate-sample.sh
npm install
npm run dev
```

http://localhost:5173

---

## 🔧 Переменные окружения

```bash
cp .env.example .env
```

| Переменная | Назначение |
|------------|------------|
| `VITE_APP_TITLE` | Заголовок и OG |
| `VITE_OG_DESCRIPTION` | Описание для meta |
| `VITE_SITE_URL` | Канонический URL (без `/` в конце) |
| `VITE_VIDEO_URL` | Fallback MP4 |
| `VITE_HLS_URL` | Плейлист HLS |

Сборка:

```bash
npm run build
```

---

## 📦 Деплой (кратко)

1. Положить на сервер **готовый** MP4 (видео + аудио), symlink `media/film.mp4`.
2. Запустить нарезку HLS в `www/media/hls/`.
3. Собрать фронт с теми же путями, что отдаёт nginx.
4. `deploy/deploy.sh` — rsync с защитой живых `media/` от `--delete`.

Подробнее: [deploy/README.md](../deploy/README.md).

Переменные для скриптов: `DEPLOY_HOST`, `REMOTE_WWW`, `MEDIA_ROOT`, `SOURCE_MP4`.

---

## 🔒 Заметки

- `.env` не коммитить; контент с правами правообладателя — только на свой хостинг и на свой риск.
- HLS-плейлист — **no-store**; сегменты можно кешировать долго.

---

## 📜 Лицензия

| Часть | Лицензия |
|-------|----------|
| Исходники **cinema-stage** | [MIT](../LICENSE) — © 2026 xvDosha |
| Ваши медиафайлы | В репозиторий не входят |

---

## 🏷️ Теги

| Тег | Смысл |
|-----|--------|
| `v1.0.0` | Первый релиз: HLS-first, deploy, доки EN/RU |
