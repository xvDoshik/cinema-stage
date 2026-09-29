import { useCallback, useRef, useState, type PointerEvent } from 'react'
import { clamp, formatTime } from '../../utils/time'

type Props = {
  currentTime: number
  duration: number
  bufferedEnd: number
  onSeek: (time: number) => void
}

export function SeekBar({ currentTime, duration, bufferedEnd, onSeek }: Props) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [dragging, setDragging] = useState(false)
  const [hoverTime, setHoverTime] = useState<number | null>(null)
  const [hoverX, setHoverX] = useState(0)

  const ratio = duration > 0 ? currentTime / duration : 0
  const bufferRatio = duration > 0 ? bufferedEnd / duration : 0

  const timeFromClientX = useCallback(
    (clientX: number) => {
      const track = trackRef.current
      if (!track || duration <= 0) return 0
      const rect = track.getBoundingClientRect()
      const x = clamp(clientX - rect.left, 0, rect.width)
      return (x / rect.width) * duration
    },
    [duration],
  )

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    setDragging(true)
    onSeek(timeFromClientX(e.clientX))
  }

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const t = timeFromClientX(e.clientX)
    const track = trackRef.current
    if (track) {
      const rect = track.getBoundingClientRect()
      setHoverX(clamp(e.clientX - rect.left, 0, rect.width))
    }
    setHoverTime(t)
    if (dragging) onSeek(t)
  }

  const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    setDragging(false)
    e.currentTarget.releasePointerCapture(e.pointerId)
  }

  const onPointerLeave = () => {
    if (!dragging) setHoverTime(null)
  }

  return (
    <div
      className={`seek-bar${dragging ? ' dragging' : ''}`}
      ref={trackRef}
      role="slider"
      aria-valuemin={0}
      aria-valuemax={duration || 0}
      aria-valuenow={currentTime}
      aria-label="Playback position"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerLeave}
    >
      <div className="seek-bar__track">
        <div
          className="seek-bar__buffer"
          style={{ width: `${bufferRatio * 100}%` }}
        />
        <div
          className="seek-bar__progress"
          style={{ width: `${ratio * 100}%` }}
        />
        <div
          className="seek-bar__thumb"
          style={{ left: `${ratio * 100}%` }}
        />
      </div>
      {hoverTime !== null && duration > 0 && (
        <div className="seek-bar__tooltip" style={{ left: hoverX }}>
          {formatTime(hoverTime)}
        </div>
      )}
    </div>
  )
}
