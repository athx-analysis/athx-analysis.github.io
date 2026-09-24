import { useRef, useState } from 'react'
import { createPortal } from 'react-dom'

// Petit "i" d'info affichant un texte au survol/focus uniquement (voir .sim-info/.sim-info-
// tooltip dans index.css). Rendu via portal (document.body) plutot qu'en position absolute
// classique : contrairement a InfoIcon de WorkoutFormatCard.jsx (jamais dans un conteneur a
// defilement), celui-ci vit dans un <th> sticky a l'interieur d'un tableau a defilement
// interne (overflow-y: auto) -- une bulle en position absolute y serait decoupee. La position
// est calculee a partir du rectangle de l'icone au moment du survol, ancree sur son bord droit
// (la bulle s'ouvre vers la gauche) pour rester dans l'ecran meme pour une colonne tout a
// droite du tableau.
export default function InfoIconPortal({ text }) {
  const [pos, setPos] = useState(null)
  const ref = useRef(null)

  const show = () => {
    const r = ref.current?.getBoundingClientRect()
    if (!r) return
    const margin = 12
    const maxWidth = Math.min(320, window.innerWidth - margin * 2)
    setPos({
      top: r.bottom + 8,
      right: Math.max(margin, window.innerWidth - r.right),
      maxWidth,
    })
  }
  const hide = () => setPos(null)

  return (
    <span
      ref={ref}
      className="sim-info"
      tabIndex={0}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
        <circle cx="6" cy="6" r="5.25" stroke="currentColor" strokeWidth="1.2" />
        <path d="M6 5.5V8.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        <circle cx="6" cy="3.6" r="0.75" fill="currentColor" />
      </svg>
      {pos && createPortal(
        <div
          className="sim-info-tooltip"
          role="tooltip"
          style={{ top: pos.top, right: pos.right, maxWidth: pos.maxWidth }}
        >
          {text}
        </div>,
        document.body,
      )}
    </span>
  )
}
