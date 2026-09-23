import { useState } from 'react'
import { useLanguage } from '../i18n/LanguageContext'

// Devoilement progressif d'une question Analyses -- prototype UX (voir UX_PRINCIPLES.txt,
// regle 5 : donner l'impression de chercher soi-meme, sans priver l'utilisateur presse d'une
// reponse immediate). Titre + Reponse restent TOUJOURS visibles d'un bloc (quelqu'un qui veut
// juste la conclusion l'a tout de suite) ; le detail (texte explicatif + picker + graphiques,
// passes en children) se devoile via un clic sur "Voir pourquoi" plutot que d'etre affiche
// d'emblee -- donne l'impression de "trouver" la suite. Le contenu ne monte dans le DOM
// qu'a l'ouverture (pas juste cache en CSS) : les graphiques recharts a l'interieur se
// dimensionnent alors sur un vrai layout, jamais sur un conteneur a hauteur nulle.
export default function RevealQuestion({ title, answer, children, nextId, nextLabel }) {
  const { lang } = useLanguage()
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  function handleOpen() {
    setOpen(true)
    // Monte d'abord a opacite 0 (etat de depart de .reveal), puis bascule sur .reveal-visible
    // au frame suivant pour que la transition CSS existante (voir Reveal.jsx) se joue vraiment,
    // au lieu d'apparaitre instantanement.
    requestAnimationFrame(() => requestAnimationFrame(() => setMounted(true)))
  }

  function scrollToNext() {
    document.getElementById(nextId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <>
      {title}
      {answer}

      {!open && (
        <button type="button" className="btn-pill reveal-question-cta" onClick={handleOpen}>
          {lang === 'fr' ? 'Voir pourquoi' : 'See why'}
          <span className="btn-pill-icon">
            <svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </span>
        </button>
      )}

      {open && (
        <div className={`reveal${mounted ? ' reveal-visible' : ''}`}>
          {children}
          {nextId && (
            <button type="button" className="closing-text-link reveal-question-next" onClick={scrollToNext}>
              {nextLabel || (lang === 'fr' ? 'Question suivante' : 'Next question')}
              <span className="btn-pill-icon">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1V13M7 13L1 7M7 13L13 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </span>
            </button>
          )}
        </div>
      )}
    </>
  )
}
