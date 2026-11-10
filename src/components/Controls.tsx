type Props = {
  muted: boolean
  onToggleMute: () => void
  /** Absent pendant le chargement : seul le bouton son est affiché. */
  onReplay?: () => void
}

export function Controls({ muted, onToggleMute, onReplay }: Props) {
  return (
    <div className="controls">
      <button
        type="button"
        className="control"
        aria-label={muted ? 'Remettre le son' : 'Couper le son'}
        onClick={onToggleMute}
      >
        {muted ? '🔇' : '🔊'}
      </button>
      {onReplay && (
        <button type="button" className="control" aria-label="Rejouer" onClick={onReplay}>
          ↺
        </button>
      )}
    </div>
  )
}
