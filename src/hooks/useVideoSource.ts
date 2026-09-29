import Hls from 'hls.js'
import { useEffect, useState } from 'react'
import type { RefObject } from 'react'
import { HLS_SRC, MP4_FALLBACK } from '../config/media'

export type VideoSourceMode = 'pending' | 'hls' | 'mp4'

export function useVideoSource(
  videoRef: RefObject<HTMLVideoElement | null>,
): VideoSourceMode {
  const [mode, setMode] = useState<VideoSourceMode>('pending')

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    let hls: Hls | null = null
    let cancelled = false

    const attachMp4 = (src: string) => {
      if (hls) {
        hls.destroy()
        hls = null
      }
      video.src = src
      video.load()
      setMode('mp4')
    }

    const attachHls = (src: string) => {
      if (Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,
          maxBufferLength: 45,
          maxMaxBufferLength: 120,
          backBufferLength: 30,
        })
        hls.loadSource(src)
        hls.attachMedia(video)
        hls.on(Hls.Events.ERROR, (_, data) => {
          if (!data.fatal) return
          attachMp4(MP4_FALLBACK)
        })
        setMode('hls')
        return
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src
        video.load()
        setMode('hls')
        return
      }
      attachMp4(MP4_FALLBACK)
    }

    const run = async () => {
      if (HLS_SRC) {
        const ok = await fetch(HLS_SRC, { method: 'HEAD' })
          .then((r) => r.ok)
          .catch(() => false)
        if (cancelled) return
        if (ok) {
          attachHls(HLS_SRC)
          return
        }
      }
      attachMp4(MP4_FALLBACK)
    }

    void run()

    return () => {
      cancelled = true
      hls?.destroy()
    }
  }, [videoRef])

  return mode
}
