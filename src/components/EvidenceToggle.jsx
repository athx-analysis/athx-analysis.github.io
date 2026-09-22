import { useState } from 'react'
import { useLanguage } from '../i18n/LanguageContext'

// Section repliee par defaut contenant le detail/la preuve chiffree d'une affirmation
// (tableau croise, methodologie...) -- pour que la page reste lisible par un public non
// technique tout en donnant acces a qui veut verifier.
export default function EvidenceToggle({ label, children }) {
  const [open, setOpen] = useState(false)
  const { lang } = useLanguage()
  const defaultLabel = lang === 'fr' ? 'Voir le détail' : 'See details'
  const hideLabel = lang === 'fr' ? 'Masquer le détail' : 'Hide details'
  return (
    <div className="evidence">
      <button type="button" className="evidence-trigger" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" className={`evidence-caret${open ? ' open' : ''}`}>
          <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {open ? hideLabel : (label || defaultLabel)}
      </button>
      {open && <div className="evidence-body">{children}</div>}
    </div>
  )
}
