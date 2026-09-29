import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from 'react'
import { clamp } from '../utils/time'
import type { ViewerSettings } from './usePersistedSettings'

export type VideoEngine = {
  playing: boolean
  currentTime: number
  duration: number
  bufferedEnd: number
  volume: number
  muted: boolean
  rate: number
  loading: boolean
  fullscreen: boolean
  pipActive: boolean
  pipSupported: boolean
  togglePlay: () => void
  play: () => void
  pause: () => void
  seek: (time: number) => void
  skip: (delta: number) => void
  setVolume: (v: number) => void
  nudgeVolume: (delta: number) => void
  setMuted: (m: boolean) => void
  toggleMute: () => void
  setRate: (r: number) => void
  toggleFullscreen: () => Promise<void>
  togglePiP: () => Promise<void>
}

export function useVideoEngine(
  videoRef: RefObject<HTMLVideoElement | null>,
  settings: ViewerSettings,
  patchSettings: (p: Partial<ViewerSettings>) => void,
  containerRef: RefObject<HTMLElement | null>,
): VideoEngine {
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [bufferedEnd, setBufferedEnd] = useState(0)
  const [loading, setLoading] = useState(true)
  const [fullscreen, setFullscreen] = useState(false)
  const [pipActive, setPipActive] = useState(false)
  const restoredRef = useRef(false)

  const pipSupported =
    typeof document !== 'undefined' &&
    'pictureInPictureEnabled' in document &&
    Boolean(document.pictureInPictureEnabled)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    video.volume = settings.volume
    video.muted = settings.muted
    video.playbackRate = settings.rate

    const onPlay = () => setPlaying(true)
    const onPause = () => setPlaying(false)
    const onEnded = () => {
      setPlaying(false)
      setLoading(false)
      video.pause()
    }
    const onTime = () => {
      setCurrentTime(video.currentTime)
      if (settings.rememberPosition) {
        patchSettings({ lastTime: video.currentTime })
      }
    }
    const onDuration = () => setDuration(video.duration || 0)
    const onProgress = () => {
      if (video.buffered.length > 0) {
        setBufferedEnd(video.buffered.end(video.buffered.length - 1))
      }
      setLoading(video.readyState < HTMLMediaElement.HAVE_FUTURE_DATA)
    }
    const onWaiting = () => setLoading(true)
    const onCanPlay = () => setLoading(false)
    const onLoaded = () => {
      onDuration()
      if (
        !restoredRef.current &&
        settings.rememberPosition &&
        settings.lastTime > 0 &&
        Number.isFinite(video.duration)
      ) {
        video.currentTime = clamp(
          settings.lastTime,
          0,
          Math.max(0, video.duration - 0.25),
        )
        restoredRef.current = true
      }
    }

    video.addEventListener('play', onPlay)
    video.addEventListener('pause', onPause)
    video.addEventListener('ended', onEnded)
    video.addEventListener('timeupdate', onTime)
    video.addEventListener('durationchange', onDuration)
    video.addEventListener('progress', onProgress)
    video.addEventListener('waiting', onWaiting)
    video.addEventListener('canplay', onCanPlay)
    video.addEventListener('loadedmetadata', onLoaded)

    setPlaying(!video.paused)
    setCurrentTime(video.currentTime)
    setDuration(video.duration || 0)
    onProgress()

    return () => {
      video.removeEventListener('play', onPlay)
      video.removeEventListener('pause', onPause)
      video.removeEventListener('ended', onEnded)
      video.removeEventListener('timeupdate', onTime)
      video.removeEventListener('durationchange', onDuration)
      video.removeEventListener('progress', onProgress)
      video.removeEventListener('waiting', onWaiting)
      video.removeEventListener('canplay', onCanPlay)
      video.removeEventListener('loadedmetadata', onLoaded)
    }
  }, [
    videoRef,
    settings.rememberPosition,
    settings.lastTime,
    settings.volume,
    settings.muted,
    settings.rate,
    patchSettings,
  ])

  useEffect(() => {
    const onFs = () => setFullscreen(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', onFs)
    return () => document.removeEventListener('fullscreenchange', onFs)
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    const onEnter = () => setPipActive(true)
    const onLeave = () => setPipActive(false)
    video.addEventListener('enterpictureinpicture', onEnter)
    video.addEventListener('leavepictureinpicture', onLeave)
    return () => {
      video.removeEventListener('enterpictureinpicture', onEnter)
      video.removeEventListener('leavepictureinpicture', onLeave)
    }
  }, [videoRef])

  const play = useCallback(() => {
    void videoRef.current?.play().catch(() => {})
  }, [videoRef])

  const pause = useCallback(() => {
    videoRef.current?.pause()
  }, [videoRef])

  const togglePlay = useCallback(() => {
    const v = videoRef.current
    if (!v) return
    if (v.paused) {
      if (v.ended || (v.duration && v.currentTime >= v.duration - 0.05)) {
        v.currentTime = 0
      }
      void v.play().catch(() => {})
    } else {
      v.pause()
    }
  }, [videoRef])

  const seek = useCallback(
    (time: number) => {
      const v = videoRef.current
      if (!v || !Number.isFinite(v.duration)) return
      v.currentTime = clamp(time, 0, Math.max(0, v.duration - 0.05))
    },
    [videoRef],
  )

  const skip = useCallback(
    (delta: number) => {
      const v = videoRef.current
      if (!v) return
      seek(v.currentTime + delta)
    },
    [videoRef, seek],
  )

  const setVolume = useCallback(
    (v: number) => {
      const vol = clamp(v, 0, 1)
      patchSettings({ volume: vol })
      if (videoRef.current) videoRef.current.volume = vol
      if (vol > 0) patchSettings({ muted: false })
    },
    [patchSettings, videoRef],
  )

  const nudgeVolume = useCallback(
    (delta: number) => {
      setVolume(settings.volume + delta)
    },
    [setVolume, settings.volume],
  )

  const setMuted = useCallback(
    (m: boolean) => {
      patchSettings({ muted: m })
      if (videoRef.current) videoRef.current.muted = m
    },
    [patchSettings, videoRef],
  )

  const toggleMute = useCallback(() => {
    setMuted(!settings.muted)
  }, [setMuted, settings.muted])

  const setRate = useCallback(
    (r: number) => {
      const rate = clamp(r, 0.25, 2)
      patchSettings({ rate })
      if (videoRef.current) videoRef.current.playbackRate = rate
    },
    [patchSettings, videoRef],
  )

  const toggleFullscreen = useCallback(async () => {
    const el = containerRef.current
    if (!el) return
    if (document.fullscreenElement) {
      await document.exitFullscreen()
    } else {
      await el.requestFullscreen()
    }
  }, [containerRef])

  const togglePiP = useCallback(async () => {
    const v = videoRef.current
    if (!v || !pipSupported) return
    if (document.pictureInPictureElement === v) {
      await document.exitPictureInPicture()
    } else {
      await v.requestPictureInPicture()
    }
  }, [videoRef, pipSupported])

  return useMemo(
    () => ({
      playing,
      currentTime,
      duration,
      bufferedEnd,
      volume: settings.volume,
      muted: settings.muted,
      rate: settings.rate,
      loading,
      fullscreen,
      pipActive,
      pipSupported,
      togglePlay,
      play,
      pause,
      seek,
      skip,
      setVolume,
      nudgeVolume,
      setMuted,
      toggleMute,
      setRate,
      toggleFullscreen,
      togglePiP,
    }),
    [
      playing,
      currentTime,
      duration,
      bufferedEnd,
      settings.volume,
      settings.muted,
      settings.rate,
      loading,
      fullscreen,
      pipActive,
      pipSupported,
      togglePlay,
      play,
      pause,
      seek,
      skip,
      setVolume,
      nudgeVolume,
      setMuted,
      toggleMute,
      setRate,
      toggleFullscreen,
      togglePiP,
    ],
  )
}
