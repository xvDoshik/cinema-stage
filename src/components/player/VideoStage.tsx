import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent,
  type RefObject,
} from 'react'
import { useVideoSource } from '../../hooks/useVideoSource'
import type { ViewerSettings } from '../../hooks/usePersistedSettings'
import type { VideoEngine } from '../../hooks/useVideoEngine'
import { ControlsBar } from './ControlsBar'

type Props = {
  containerRef: RefObject<HTMLDivElement | null>
  videoRef: RefObject<HTMLVideoElement | null>
  engine: VideoEngine
  settings: ViewerSettings
  onOpenSettings: () => void
  onOpenHelp: () => void
}

export function VideoStage({
  containerRef,
  videoRef,
  engine,
  settings,
  onOpenSettings,
  onOpenHelp,
}: Props) {
  const hideTimer = useRef<number | null>(null)
  const lastClick = useRef<{ t: number; x: number } | null>(null)
  const [controlsVisible, setControlsVisible] = useState(true)
  const [skipHint, setSkipHint] = useState<'left' | 'right' | null>(null)
  const [mediaError, setMediaError] = useState(false)
  useVideoSource(videoRef)

  const bumpControls = useCallback(() => {
    setControlsVisible(true)
    if (hideTimer.current) window.clearTimeout(hideTimer.current)
    if (engine.playing) {
      hideTimer.current = window.setTimeout(() => {
        setControlsVisible(false)
      }, 2500)
    }
  }, [engine.playing])

  useEffect(() => {
    if (!engine.playing) {
      setControlsVisible(true)
      if (hideTimer.current) window.clearTimeout(hideTimer.current)
      return
    }
    bumpControls()
    return () => {
      if (hideTimer.current) window.clearTimeout(hideTimer.current)
    }
  }, [engine.playing, bumpControls])

  const onVideoClick = (e: MouseEvent<HTMLVideoElement>) => {
    const now = Date.now()
    const prev = lastClick.current
    if (
      prev &&
      now - prev.t < 350 &&
      Math.abs(e.clientX - prev.x) < 40
    ) {
      const rect = e.currentTarget.getBoundingClientRect()
      const leftHalf = e.clientX < rect.left + rect.width / 2
      const delta = leftHalf
        ? -settings.doubleClickSkipSec
        : settings.doubleClickSkipSec
      engine.skip(delta)
      setSkipHint(leftHalf ? 'left' : 'right')
      window.setTimeout(() => setSkipHint(null), 500)
      lastClick.current = null
      return
    }
    lastClick.current = { t: now, x: e.clientX }
    window.setTimeout(() => {
      if (lastClick.current?.t === now) {
        engine.togglePlay()
        lastClick.current = null
      }
    }, 320)
  }

  return (
    <div
      className="player"
      ref={containerRef}
      tabIndex={0}
      onMouseMove={bumpControls}
      onMouseLeave={() => engine.playing && setControlsVisible(false)}
    >
      <video
        ref={videoRef}
        playsInline
        preload="none"
        onClick={onVideoClick}
        onError={() => setMediaError(true)}
        onLoadedData={() => setMediaError(false)}
      />
      {mediaError && (
        <div className="player__media-error" role="alert">
          Видео недоступно. Обнови страницу позже — файл ещё заливается на
          сервер.
        </div>
      )}
      {engine.loading && (
        <div className="player__loading" aria-live="polite">
          <div className="player__spinner" />
        </div>
      )}
      <div
        className={`player__skip-hint left${skipHint === 'left' ? ' visible' : ''}`}
      >
        −{settings.doubleClickSkipSec}s
      </div>
      <div
        className={`player__skip-hint right${skipHint === 'right' ? ' visible' : ''}`}
      >
        +{settings.doubleClickSkipSec}s
      </div>
      <ControlsBar
        engine={engine}
        visible={controlsVisible}
        onOpenSettings={onOpenSettings}
        onOpenHelp={onOpenHelp}
      />
    </div>
  )
}
