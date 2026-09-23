import { WORKOUT_LINE_FR } from '../data/workout_official'
import { useLanguage } from '../i18n/LanguageContext'

// Rendu d'UNE zone (Force/Endurance/MetCon X) du format officiel ATHX, verbatim (voir
// src/data/workout_official.js). Les chiffres/mots source ne sont jamais reformules -- mais,
// demande explicite de l'utilisateur, la categorie et le genre NON selectionnes sont retires
// de l'affichage plutot que simplement estompes (ex: un utilisateur qui regarde le format ATHX
// "normal" n'a pas a voir la distance PRO/LITE, ca embrouille) : la valeur gardee est toujours
// copiee mot pour mot depuis la source, seule la mise en page choisit laquelle montrer. Les
// lignes INSTRUCTIVES/de score sont traduites en FR (voir WORKOUT_LINE_FR) -- mouvements et
// chiffres restent en anglais (terminologie internationale du sport).
const CATEGORY_RE = /^(LITE|ATHX|PRO)\s*-\s*/i
// Variante "additive" (ex: "PRO+ - 3RM PULL UP..." en Force 2025 individuel) : un mouvement qui
// EXISTE UNIQUEMENT pour cette categorie, sans remplacer/etre un variant d'un mouvement commun
// -- contrairement aux lignes CATEGORY_RE normales (qui remplacent la ligne SANS tag juste
// au-dessus, cas MetCon), une ligne "+" n'efface jamais la ligne precedente : elle s'AJOUTE,
// point. Necessaire car l'heuristique "ligne sans tag suivie d'une ligne taguee = variante de
// cette meme ligne" ne tient pas ici (rien a voir entre "10 REP MAX" et "3RM PULL UP").
const CATEGORY_ADD_RE = /^(LITE|ATHX|PRO)\+\s*-\s*/i
const SCORE_RE = /^SCORE\b/i
const TIME_CAP_RE = /TIME CAP/i
// "0-6MIN", "0-8 MINS", "5-10 MIN", "12-20MIN"... -- ligne qui ne contient QUE une fenetre de
// temps, rien d'autre (donc jamais un faux positif sur une ligne de mouvement/protocole).
const TIME_WINDOW_ONLY_RE = /^\d{1,2}(-\d{1,2})?\s*MINS?$/i
// "M: 20KG / F: 12.5KG", "M 20KG / F 12.5KG" (format 2025, sans ":"), "M: 60 / F: 45 / MIX: 60"...
const GENDER_PAIR_RE = /M\s*:?\s*([\d.]+(?:KG|CAL|CM)?"?)\s*\/\s*F\s*:?\s*([\d.]+(?:KG|CAL|CM)?"?)(?:\s*\/\s*MIX\s*:?\s*[\d.]+(?:KG|CAL|CM)?"?)?/gi

// Etape 1 : "0-6MIN" + "1RM STRICT PRESS" (deux lignes consecutives) -> "1RM STRICT PRESS :
// 0-6MIN" (une ligne) -- style demande explicitement par l'utilisateur pour la zone Force.
function mergeTimeWindowLines(lines) {
  const out = []
  for (let i = 0; i < lines.length; i++) {
    if (TIME_WINDOW_ONLY_RE.test(lines[i]) && lines[i + 1] && !CATEGORY_RE.test(lines[i + 1]) && !CATEGORY_ADD_RE.test(lines[i + 1])) {
      out.push(`${lines[i + 1]} : ${lines[i]}`)
      i += 1
    } else {
      out.push(lines[i])
    }
  }
  return out
}

// Etape 2 : ne garde, pour chaque ligne taguee LITE-/ATHX-/PRO-, que celle qui correspond a la
// categorie selectionnee -- et, si une ligne SANS tag est immediatement suivie d'une variante
// taguee qui correspond a la selection (cas MetCon : ligne de base = ATHX implicite + override
// LITE/PRO), la ligne de base s'efface au profit de la variante choisie.
function filterByCategory(lines, categoryTag) {
  const out = []
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const addM = CATEGORY_ADD_RE.exec(line)
    if (addM) {
      if (addM[1].toUpperCase() === categoryTag) out.push(line.replace(CATEGORY_ADD_RE, ''))
      continue
    }
    const m = CATEGORY_RE.exec(line)
    if (m) {
      if (m[1].toUpperCase() === categoryTag) out.push(line.replace(CATEGORY_RE, ''))
      continue
    }
    let j = i + 1
    let overridden = false
    while (j < lines.length && CATEGORY_RE.test(lines[j])) {
      if (CATEGORY_RE.exec(lines[j])[1].toUpperCase() === categoryTag) overridden = true
      j += 1
    }
    if (!overridden) out.push(line)
  }
  return out
}

// Etape 3 : "M: 20KG / F: 12.5KG" -> "20KG" (ou "12.5KG") selon le genre selectionne -- le
// chiffre garde est toujours copie mot pour mot, seul celui qui ne concerne pas le genre choisi
// (et l'eventuelle valeur MIX) disparait de l'affichage.
function filterGenderInLine(line, gender) {
  return line.replace(GENDER_PAIR_RE, (_match, mVal, fVal) => (gender === 'Male' ? mVal : fVal))
}

// Petit "i" d'info a cote d'un mouvement concerne par une precision officielle (ex : regle
// specifique aux paires mixtes) -- affichee au survol/focus uniquement (tooltip CSS), plutot
// qu'en bloc de texte permanent sous la carte (demande explicite de l'utilisateur).
function InfoIcon({ text }) {
  return (
    <span className="wof-info" tabIndex={0}>
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
        <circle cx="6" cy="6" r="5.25" stroke="currentColor" strokeWidth="1.2" />
        <path d="M6 5.5V8.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        <circle cx="6" cy="3.6" r="0.75" fill="currentColor" />
      </svg>
      <span className="wof-info-tooltip" role="tooltip">{text}</span>
    </span>
  )
}

export default function WorkoutFormatCard({ zone, mode, gender, categoryTag }) {
  const { lang } = useLanguage()
  const data = mode === 'pairs' ? zone.pairs : zone.individual
  if (!data) return null

  const lines = filterByCategory(mergeTimeWindowLines(data.lines), categoryTag)
    .map((l) => filterGenderInLine(l, gender))

  return (
    <div className="wof-card">
      <div className="wof-card-head">
        {zone.number && <span className="wof-card-num">{zone.number}</span>}
        <h3>{zone.title}</h3>
        <span className="wof-card-duration">{zone.duration}</span>
      </div>
      <div className="wof-card-body">
        {lines.map((line, i) => {
          // Classification toujours sur le texte source anglais (stable quelle que soit la
          // langue) -- seul l'affichage change.
          const isScore = SCORE_RE.test(line)
          const isTimeCap = TIME_CAP_RE.test(line)
          const display = lang === 'fr' ? (WORKOUT_LINE_FR[line] || line) : line
          // lineNotes : cherche une precision rattachee a CE mouvement (sous-chaine stable,
          // survit aux variantes LITE/ATHX/PRO puisque les noms de mouvement ne sont jamais
          // reformules). data.lineNotes n'existe que sur les zones qui en ont besoin.
          const noteEntry = data.lineNotes?.find((n) => n.match.some((m) => line.includes(m)))
          let cls = 'wof-line'
          if (isScore) cls += ' wof-line-score'
          else if (isTimeCap) cls += ' wof-line-timecap'
          return (
            <div key={i} className={cls}>
              {display}
              {noteEntry && <InfoIcon text={lang === 'fr' ? noteEntry.note.fr : noteEntry.note.en} />}
            </div>
          )
        })}
      </div>
    </div>
  )
}
