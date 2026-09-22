import { useState } from 'react'
import { OFFICIAL_WORKOUTS } from '../data/workout_official'
import WorkoutFormatCard from './WorkoutFormatCard'
import { useLanguage } from '../i18n/LanguageContext'

// Rappel repliable du format officiel EXACT (verbatim, voir workout_official.js) pour la
// saison/le genre/la categorie deja choisis dans le formulaire Simulation -- remplace
// l'ancienne version qui paraphrasait le format en prose (demande explicite : "le format
// demande a la lettre, pas de zones d'ombre"). Simulation ne modelise que le classement
// INDIVIDUEL (jamais Team/Pairs), donc mode toujours 'individual' ici.
export default function WorkoutReference({ year, gender, category }) {
  const [open, setOpen] = useState(false)
  const { lang } = useLanguage()
  const yearData = OFFICIAL_WORKOUTS[year]
  if (!yearData) return null
  const categoryTag = category === 'ATHX Pro' ? 'PRO' : 'ATHX'

  return (
    <div className="workout-ref">
      <button type="button" className="workout-ref-trigger" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" className={`evidence-caret${open ? ' open' : ''}`}>
          <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {open
          ? (lang === 'fr' ? 'Masquer le rappel des épreuves' : 'Hide event reminder')
          : (lang === 'fr' ? `Revoir ce qui est demandé, saison ${year}` : `Review what's required, ${year} season`)}
      </button>

      {open && (
        <div className="workout-ref-body">
          <div className="wof-cards-row wof-cards-row-compact">
            <WorkoutFormatCard zone={yearData.zones.strength} mode="individual" gender={gender} categoryTag={categoryTag} />
            <WorkoutFormatCard zone={yearData.zones.endurance} mode="individual" gender={gender} categoryTag={categoryTag} />
            <WorkoutFormatCard zone={yearData.zones.metconx} mode="individual" gender={gender} categoryTag={categoryTag} />
          </div>
          <p className="source-line">
            {lang === 'fr' ? (
              <>Format officiel : <a href={yearData.sourceUrl} target="_blank" rel="noreferrer">{yearData.sourceUrl}</a>.</>
            ) : (
              <>Official format: <a href={yearData.sourceUrl} target="_blank" rel="noreferrer">{yearData.sourceUrl}</a>.</>
            )}
          </p>
        </div>
      )}
    </div>
  )
}
