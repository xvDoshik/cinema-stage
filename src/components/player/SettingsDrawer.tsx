import { SPEED_PRESETS } from '../../config/media'
import type { ViewerSettings } from '../../hooks/usePersistedSettings'
import type { VideoEngine } from '../../hooks/useVideoEngine'

type Props = {
  open: boolean
  settings: ViewerSettings
  engine: VideoEngine
  onClose: () => void
  onPatch: (p: Partial<ViewerSettings>) => void
  onReset: () => void
}

export function SettingsDrawer({
  open,
  settings,
  engine,
  onClose,
  onPatch,
  onReset,
}: Props) {
  if (!open) return null

  return (
    <>
      <div className="drawer-backdrop" onClick={onClose} aria-hidden />
      <aside className="drawer" role="dialog" aria-label="Player settings">
        <h2>Settings</h2>

        <div className="field">
          <label>
            Playback speed
            <span className="value">{settings.rate.toFixed(2)}×</span>
          </label>
          <input
            type="range"
            min={0.25}
            max={2}
            step={0.05}
            value={settings.rate}
            onChange={(e) => engine.setRate(Number(e.target.value))}
          />
          <div className="preset-grid" style={{ marginTop: 10 }}>
            {SPEED_PRESETS.map((p) => (
              <button
                key={p}
                type="button"
                className={`chip${Math.abs(settings.rate - p) < 0.001 ? ' active' : ''}`}
                onClick={() => engine.setRate(p)}
              >
                {p}×
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <label>
            Arrow skip (← →)
            <span className="value">{settings.arrowSkipSec}s</span>
          </label>
          <input
            type="range"
            min={1}
            max={30}
            step={1}
            value={settings.arrowSkipSec}
            onChange={(e) =>
              onPatch({ arrowSkipSec: Number(e.target.value) })
            }
          />
        </div>

        <div className="field">
          <label>
            J / L skip
            <span className="value">{settings.jlSkipSec}s</span>
          </label>
          <input
            type="range"
            min={1}
            max={60}
            step={1}
            value={settings.jlSkipSec}
            onChange={(e) => onPatch({ jlSkipSec: Number(e.target.value) })}
          />
        </div>

        <div className="field">
          <label>
            Double-click skip
            <span className="value">{settings.doubleClickSkipSec}s</span>
          </label>
          <input
            type="range"
            min={3}
            max={60}
            step={1}
            value={settings.doubleClickSkipSec}
            onChange={(e) =>
              onPatch({ doubleClickSkipSec: Number(e.target.value) })
            }
          />
        </div>

        <div className="field">
          <div className="field-row">
            <span style={{ flex: 1, fontSize: '0.875rem' }}>
              Remember playback position
            </span>
            <button
              type="button"
              className={`toggle${settings.rememberPosition ? ' on' : ''}`}
              aria-pressed={settings.rememberPosition}
              aria-label="Remember playback position"
              onClick={() =>
                onPatch({ rememberPosition: !settings.rememberPosition })
              }
            />
          </div>
        </div>

        <div className="modal-actions">
          <button type="button" className="btn ghost" onClick={onReset}>
            Reset defaults
          </button>
          <button type="button" className="btn" onClick={onClose}>
            Done
          </button>
        </div>
      </aside>
    </>
  )
}
