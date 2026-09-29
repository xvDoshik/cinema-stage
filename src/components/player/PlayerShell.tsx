import { useCallback, useMemo, useRef, useState } from 'react'
import { APP_TITLE } from '../../config/media'
import { useHotkeys } from '../../hooks/useHotkeys'
import { usePersistedSettings } from '../../hooks/usePersistedSettings'
import { useVideoEngine } from '../../hooks/useVideoEngine'
import { SettingsDrawer } from './SettingsDrawer'
import { ShortcutsModal } from './ShortcutsModal'
import { VideoStage } from './VideoStage'

export function PlayerShell() {
  const { settings, patch, reset } = usePersistedSettings()
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const engine = useVideoEngine(videoRef, settings, patch, containerRef)

  const [settingsOpen, setSettingsOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)

  const onShowHelp = useCallback(() => setHelpOpen(true), [])
  const onToggleSettings = useCallback(
    () => setSettingsOpen((v) => !v),
    [],
  )

  const hotkeyOpts = useMemo(
    () => ({
      enabled: !helpOpen && !settingsOpen,
      onShowHelp,
      onToggleSettings,
    }),
    [helpOpen, settingsOpen, onShowHelp, onToggleSettings],
  )

  useHotkeys(engine, settings, hotkeyOpts)

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>{APP_TITLE}</h1>
      </header>
      <div className="player-wrap">
        <VideoStage
          containerRef={containerRef}
          videoRef={videoRef}
          engine={engine}
          settings={settings}
          onOpenSettings={() => setSettingsOpen(true)}
          onOpenHelp={() => setHelpOpen(true)}
        />
      </div>
      <SettingsDrawer
        open={settingsOpen}
        settings={settings}
        engine={engine}
        onClose={() => setSettingsOpen(false)}
        onPatch={patch}
        onReset={reset}
      />
      <ShortcutsModal open={helpOpen} onClose={() => setHelpOpen(false)} />
    </div>
  )
}
