const envUrl = import.meta.env.VITE_VIDEO_URL as string | undefined
const envHls = import.meta.env.VITE_HLS_URL as string | undefined

export const MP4_FALLBACK =
  envUrl && envUrl.length > 0 ? envUrl : '/media/sample.mp4'

export const HLS_SRC =
  envHls && envHls.length > 0 ? envHls : '/media/hls/index.m3u8'

export const VIDEO_SRC = MP4_FALLBACK

export const APP_TITLE =
  (import.meta.env.VITE_APP_TITLE as string | undefined) ?? 'Cinema Stage'

export const SPEED_PRESETS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2] as const
