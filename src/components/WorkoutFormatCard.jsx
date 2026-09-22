// Rendu d'UNE zone (Force/Endurance/MetCon X) du format officiel ATHX, verbatim (voir
// src/data/workout_official.js). Aucune ligne n'est jamais retiree ni reformulee : la
// categorie/le genre choisis ne font que mettre en valeur visuellement la portion du texte
// source qui s'applique (gras/surlignage), tout le reste reste visible (juste estompe).
//
// Regles de detection (simples et non-destructives, cf. commentaire en tete de
// workout_official.js) :
//   - ligne commencant par "SCORE" -> regle de score, mise en avant en bas de carte
//   - ligne commencant par "LITE -"/"ATHX -"/"PRO -" -> variante de categorie, activee/estompee
//     selon `categoryTag`
//   - portion "M: X" / "F: X" (ou "M X"/"F X", format 2025) dans une ligne -> poids Homme/Femme,
//     mis en avant selon `gender`
const CATEGORY_RE = /^(LITE|ATHX|PRO)\s*-\s*/i
const SCORE_RE = /^SCORE\b/i
// "M: 20KG", "M 20KG", "F: 12.5KG", "M: 45CAL"... -- jamais "MIX" (le M n'est alors pas suivi
// d'espace/":"/chiffre direct, donc ne matche pas).
const GENDER_TOKEN_RE = /([MF]\s*:?\s*[\d.]+(?:KG|CAL|CM)?"?)/g

function GenderEmphasisLine({ text, gender }) {
  const parts = text.split(GENDER_TOKEN_RE)
  return (
    <>
      {parts.map((part, i) => {
        if (!part) return null
        const isM = /^M\s*:?\s*[\d.]/.test(part)
        const isF = /^F\s*:?\s*[\d.]/.test(part)
        if (isM || isF) {
          const active = (isM && gender === 'Male') || (isF && gender === 'Female')
          return <span key={i} className={active ? 'wof-gender-active' : 'wof-gender-dim'}>{part}</span>
        }
        return <span key={i}>{part}</span>
      })}
    </>
  )
}

export default function WorkoutFormatCard({ zone, mode, gender, categoryTag }) {
  const data = mode === 'pairs' ? zone.pairs : zone.individual
  if (!data) return null
  return (
    <div className="wof-card">
      <div className="wof-card-head">
        {zone.number && <span className="wof-card-num">{zone.number}</span>}
        <h3>{zone.title}</h3>
        <span className="wof-card-duration">{zone.duration}</span>
      </div>
      <div className="wof-card-body">
        {data.lines.map((line, i) => {
          const catMatch = CATEGORY_RE.exec(line)
          const isScore = SCORE_RE.test(line)
          let cls = 'wof-line'
          if (isScore) cls += ' wof-line-score'
          else if (catMatch) cls += ' wof-line-cat'
          return (
            <div
              key={i}
              className={cls}
              data-cat-active={catMatch ? (catMatch[1].toUpperCase() === categoryTag ? '1' : '0') : undefined}
            >
              <GenderEmphasisLine text={line} gender={gender} />
            </div>
          )
        })}
      </div>
      {data.notes && (
        <div className="wof-notes">
          {data.notes.map((n, i) => <p key={i}>{n}</p>)}
        </div>
      )}
    </div>
  )
}
