import type { VideoEngine } from '../../hooks/useVideoEngine'
import { formatTime } from '../../utils/time'
import { SeekBar } from './SeekBar'

type Props = {
  engine: VideoEngine
  visible: boolean
  onOpenSettings: () => void
  onOpenHelp: () => void
}

function IconPlay() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M8 5v14l11-7z" />
    </svg>
  )
}

function IconPause() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M6 5h4v14H6zm8 0h4v14h-4z" />
    </svg>
  )
}

function IconVolume({ muted, low }: { muted: boolean; low: boolean }) {
  if (muted) {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3 3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4 9.91 6.09 12 8.18V4z" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      {low ? (
        <path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z" />
      ) : (
        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
      )}
    </svg>
  )
}

function IconFullscreen() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
    </svg>
  )
}

function IconPiP() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M19 7h-8v6h8V7zm0 8h-8v6h8v-6zM9 19H5V5h4v2H7v10h2v2z" />
    </svg>
  )
}

function IconSettings() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M19.14 12.94c.04-.31.06-.63.06-.94 0-.31-.02-.63-.06-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.488.488 0 0 0-.59-.22l-2.39.96a7.02 7.02 0 0 0-1.63-.94l-.36-2.54A.484.484 0 0 0 14.06 2h-3.12c-.24 0-.44.17-.48.41l-.36 2.54c-.59.24-1.13.56-1.63.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.04.7 1.63.94l.36 2.54c.05.24.24.41.48.41h3.12c.24 0 .44-.17.48-.41l.36-2.54c.59-.24 1.13-.56 1.63-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.21.08-.47-.12-.61l-2.01-1.58zM12 15.6A3.6 3.6 0 1 1 12 8.4a3.6 3.6 0 0 1 0 7.2z" />
    </svg>
  )
}

export function ControlsBar({
  engine,
  visible,
  onOpenSettings,
  onOpenHelp,
}: Props) {
  const volPct = Math.round(engine.volume * 100)

  return (
    <div className={`player__controls${visible ? '' : ' hidden'}`}>
      <div className="controls-row">
        <SeekBar
          currentTime={engine.currentTime}
          duration={engine.duration}
          bufferedEnd={engine.bufferedEnd}
          onSeek={engine.seek}
        />
      </div>
      <div className="controls-row">
        <button
          type="button"
          className="icon-btn"
          aria-label={engine.playing ? 'Pause' : 'Play'}
          onClick={engine.togglePlay}
        >
          {engine.playing ? <IconPause /> : <IconPlay />}
        </button>
        <span className="time-label">
          {formatTime(engine.currentTime)} / {formatTime(engine.duration)}
        </span>
        <div className="volume-group">
          <button
            type="button"
            className="icon-btn"
            aria-label={engine.muted ? 'Unmute' : 'Mute'}
            onClick={engine.toggleMute}
          >
            <IconVolume muted={engine.muted} low={engine.volume < 0.35} />
          </button>
          <input
            type="range"
            min={0}
            max={100}
            value={engine.muted ? 0 : volPct}
            aria-label="Volume"
            onChange={(e) => engine.setVolume(Number(e.target.value) / 100)}
          />
        </div>
        <div className="spacer" />
        {engine.pipSupported && (
          <button
            type="button"
            className="icon-btn"
            aria-label="Picture in picture"
            onClick={() => void engine.togglePiP()}
          >
            <IconPiP />
          </button>
        )}
        <button
          type="button"
          className="icon-btn"
          aria-label="Settings"
          onClick={onOpenSettings}
        >
          <IconSettings />
        </button>
        <button
          type="button"
          className="icon-btn"
          aria-label="Keyboard shortcuts"
          onClick={onOpenHelp}
        >
          <span style={{ fontWeight: 700, fontSize: 18 }}>?</span>
        </button>
        <button
          type="button"
          className="icon-btn"
          aria-label="Fullscreen"
          onClick={() => void engine.toggleFullscreen()}
        >
          <IconFullscreen />
        </button>
      </div>
    </div>
  )
}
