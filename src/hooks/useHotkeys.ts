import { useEffect } from 'react'
import { SPEED_PRESETS } from '../config/media'
import type { VideoEngine } from './useVideoEngine'
import type { ViewerSettings } from './usePersistedSettings'

type HotkeyOpts = {
  onShowHelp: () => void
  onToggleSettings: () => void
  enabled: boolean
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  const tag = target.tagName
  return (
    tag === 'INPUT' ||
    tag === 'TEXTAREA' ||
    tag === 'SELECT' ||
    target.isContentEditable
  )
}

function cycleRate(current: number, dir: 1 | -1): number {
  const idx = SPEED_PRESETS.findIndex((p) => Math.abs(p - current) < 0.001)
  const base = idx >= 0 ? idx : SPEED_PRESETS.indexOf(1)
  const next =
    (base + dir + SPEED_PRESETS.length) % SPEED_PRESETS.length
  return SPEED_PRESETS[next]
}

export function useHotkeys(
  engine: VideoEngine,
  settings: ViewerSettings,
  opts: HotkeyOpts,
) {
  useEffect(() => {
    if (!opts.enabled) return

    const onKey = (e: KeyboardEvent) => {
      if (isEditableTarget(e.target)) return

      const key = e.key.toLowerCase()
      const code = e.code

      if (key === '?' || (e.shiftKey && key === '/')) {
        e.preventDefault()
        opts.onShowHelp()
        return
      }

      if (key === ' ' || key === 'k') {
        e.preventDefault()
        engine.togglePlay()
        return
      }

      if (key === 'm') {
        e.preventDefault()
        engine.toggleMute()
        return
      }

      if (key === 'f') {
        e.preventDefault()
        void engine.toggleFullscreen()
        return
      }

      if (key === 'arrowleft') {
        e.preventDefault()
        engine.skip(-settings.arrowSkipSec)
        return
      }

      if (key === 'arrowright') {
        e.preventDefault()
        engine.skip(settings.arrowSkipSec)
        return
      }

      if (key === 'j') {
        e.preventDefault()
        engine.skip(-settings.jlSkipSec)
        return
      }

      if (key === 'l') {
        e.preventDefault()
        engine.skip(settings.jlSkipSec)
        return
      }

      if (key === 'arrowup') {
        e.preventDefault()
        engine.nudgeVolume(0.05)
        return
      }

      if (key === 'arrowdown') {
        e.preventDefault()
        engine.nudgeVolume(-0.05)
        return
      }

      if (key === ',' && e.shiftKey) {
        e.preventDefault()
        engine.setRate(cycleRate(engine.rate, -1))
        return
      }

      if (key === '.' && e.shiftKey) {
        e.preventDefault()
        engine.setRate(cycleRate(engine.rate, 1))
        return
      }

      if (code === 'Comma' && !e.shiftKey) {
        e.preventDefault()
        engine.setRate(cycleRate(engine.rate, -1))
        return
      }

      if (code === 'Period' && !e.shiftKey) {
        e.preventDefault()
        engine.setRate(cycleRate(engine.rate, 1))
        return
      }

      if (key === 's' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault()
        opts.onToggleSettings()
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [
    engine,
    settings.arrowSkipSec,
    settings.jlSkipSec,
    opts.enabled,
    opts.onShowHelp,
    opts.onToggleSettings,
  ])
}
