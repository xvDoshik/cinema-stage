type Props = {
  open: boolean
  onClose: () => void
}

const ROWS: [string, string][] = [
  ['Play / Pause', 'Space, K'],
  ['Mute', 'M'],
  ['Volume', '↑ / ↓ (+5%)'],
  ['Seek', '← / → (arrow skip)'],
  ['Seek', 'J / L (long skip)'],
  ['Speed', ', / . (cycle presets)'],
  ['Speed', 'Shift+, / Shift+.'],
  ['Fullscreen', 'F'],
  ['Settings', 'S'],
  ['Shortcuts', '?'],
  ['Double-click', 'Left − / Right + skip'],
]

export function ShortcutsModal({ open, onClose }: Props) {
  if (!open) return null

  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal" role="dialog" aria-label="Keyboard shortcuts">
        <h2>Keyboard shortcuts</h2>
        <table>
          <tbody>
            {ROWS.map(([action, keys]) => (
              <tr key={`${action}-${keys}`}>
                <td>{action}</td>
                <td>
                  {keys.split(', ').map((k) => (
                    <kbd key={k} style={{ marginRight: 6 }}>
                      {k}
                    </kbd>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="modal-actions">
          <button type="button" className="btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
