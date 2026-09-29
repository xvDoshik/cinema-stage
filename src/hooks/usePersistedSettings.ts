import { useCallback, useEffect, useMemo, useState } from 'react'

const STORAGE_KEY = 'israel-enjoyer-viewer:v1'

export type ViewerSettings = {
  volume: number
  muted: boolean
  rate: number
  arrowSkipSec: number
  jlSkipSec: number
  doubleClickSkipSec: number
  rememberPosition: boolean
  lastTime: number
}

const DEFAULTS: ViewerSettings = {
  volume: 1,
  muted: false,
  rate: 1,
  arrowSkipSec: 5,
  jlSkipSec: 10,
  doubleClickSkipSec: 10,
  rememberPosition: true,
  lastTime: 0,
}

function load(): ViewerSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULTS }
    const parsed = JSON.parse(raw) as Partial<ViewerSettings>
    return { ...DEFAULTS, ...parsed }
  } catch {
    return { ...DEFAULTS }
  }
}

function save(next: ViewerSettings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    /* ignore quota */
  }
}

export function usePersistedSettings() {
  const [settings, setSettings] = useState<ViewerSettings>(() => load())

  useEffect(() => {
    save(settings)
  }, [settings])

  const patch = useCallback((partial: Partial<ViewerSettings>) => {
    setSettings((prev) => ({ ...prev, ...partial }))
  }, [])

  const reset = useCallback(() => {
    setSettings({ ...DEFAULTS })
  }, [])

  return useMemo(
    () => ({ settings, patch, reset }),
    [settings, patch, reset],
  )
}
