import { useState } from 'react'
import { WORKOUT_REFERENCE } from '../data/workout_reference'
import { useLanguage } from '../i18n/LanguageContext'

const ZONE_COLOR = { strength: 'var(--accent)', endurance: 'var(--blue)', metcon: 'var(--accent-2)' }

// Rappel repliable de ce qui est demande a chaque epreuve, pour la saison selectionnee --
// reprend la structure "zone / duree / description" des pages officielles athxgames.com/workouts.
export default function WorkoutReference({ year, movements }) {
  const [open, setOpen] = useState(false)
  const { lang, t } = useLanguage()
  const ref = WORKOUT_REFERENCE[lang]?.[year]
  if (!ref) return null

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
          {[
            { key: 'strength', label: t('discipline_force'), movs: movements.strength },
            { key: 'endurance', label: t('discipline_endurance'), movs: movements.endurance },
            { key: 'metcon', label: 'MetCon X', movs: null },
          ].map(({ key, label, movs }) => {
            const z = ref[key]
            return (
              <div key={key} className="workout-zone-card" style={{ '--zone-color': ZONE_COLOR[key] }}>
                <div className="workout-zone-head">
                  <span className="workout-zone-name">{z.zone}</span>
                  <span className="workout-zone-duration">{z.duration}</span>
                </div>
                <p className="workout-zone-desc">{z.description}</p>
                {movs && (
                  <p className="workout-zone-movements">
                    {movs.map((m, i) => <span key={m}>{i > 0 && ' · '}{m}</span>)}
                  </p>
                )}
              </div>
            )
          })}
          <p className="source-line">
            {lang === 'fr' ? (
              <>Paraphrase du format officiel, <a href={ref.sourceUrl} target="_blank" rel="noreferrer">source : {ref.sourceUrl}</a>. En cas de doute sur le format exact, se référer à la page officielle.</>
            ) : (
              <>Paraphrased from the official format, <a href={ref.sourceUrl} target="_blank" rel="noreferrer">source: {ref.sourceUrl}</a>. When in doubt about the exact format, refer to the official page.</>
            )}
          </p>
        </div>
      )}
    </div>
  )
}
