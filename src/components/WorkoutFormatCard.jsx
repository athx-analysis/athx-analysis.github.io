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
// (3e groupe capturant, valeur MIX -- utilisee pour les paires mixtes, voir filterGenderInLine).
const GENDER_PAIR_RE = /M\s*:?\s*([\d.]+(?:KG|CAL|CM)?"?)\s*\/\s*F\s*:?\s*([\d.]+(?:KG|CAL|CM)?"?)(?:\s*\/\s*MIX\s*:?\s*([\d.]+(?:KG|CAL|CM)?"?))?/gi

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
// categorie selectionnee.
//
// Deux motifs distincts dans la source, a ne SURTOUT PAS traiter pareil (bug reel corrige ici,
// signale par l'utilisateur -- "70KG"/"30"" affiches sans dire a quel mouvement ca correspond) :
//   1) "Vrai override" (ex: MetCon, mouvement de base = ATHX implicite, SANS tag, suivi d'une
//      ou deux variantes LITE-/PRO- explicites, jamais de tag "ATHX-" dans ce groupe) : la
//      ligne de base s'efface au profit de la variante choisie -- MAIS certaines variantes
//      officielles sont "nues" (juste un poids/une dimension, sans nom de mouvement, car sur
//      le site officiel la ligne de base reste toujours visible juste au-dessus). Des qu'on la
//      cache, il faut donc RECOMPOSER le nom du mouvement (copie verbatim depuis la ligne de
//      base) devant la valeur nue -- jamais la laisser seule.
//   2) "Groupe a plat" (ex: Endurance, distances LITE-/ATHX-/PRO- toutes les 3 explicitement
//      taguees, y compris "ATHX-") : la ligne SANS tag juste avant (ex: "Swap Every Time
//      Athlete Completes") n'est PAS une base a remplacer, c'est une ligne independante
//      (instruction) qui doit TOUJOURS rester visible, peu importe la categorie choisie -- le
//      groupe tague est filtre a cote, independamment.
function filterByCategory(lines, categoryTag) {
  const out = []
  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    const addM = CATEGORY_ADD_RE.exec(line)
    if (addM) {
      if (addM[1].toUpperCase() === categoryTag) out.push(line.replace(CATEGORY_ADD_RE, ''))
      i += 1
      continue
    }
    const m = CATEGORY_RE.exec(line)
    if (m) {
      // Ligne tagguee rencontree isolement (groupe "a plat", cf. motif 2 -- un vrai groupe
      // override, motif 1, saute directement par-dessus ses variantes plus bas).
      if (m[1].toUpperCase() === categoryTag) out.push(line.replace(CATEGORY_RE, ''))
      i += 1
      continue
    }
    let j = i + 1
    const siblings = []
    while (j < lines.length && CATEGORY_RE.test(lines[j])) {
      siblings.push(lines[j])
      j += 1
    }
    const siblingTags = siblings.map((s) => CATEGORY_RE.exec(s)[1].toUpperCase())
    const isTrueOverrideGroup = siblings.length > 0 && !siblingTags.includes('ATHX')
    if (!isTrueOverrideGroup) {
      // Motif 2 (ou pas de groupe du tout) : ligne independante, toujours gardee ; ses
      // eventuels voisins tagues seront traites individuellement aux prochains tours de boucle.
      out.push(line)
      i += 1
      continue
    }
    // Motif 1 : vrai override -- ne garde que la variante qui correspond a la categorie
    // choisie (ou la ligne de base si aucune variante ne correspond, categorie ATHX implicite).
    const matchLine = siblings.find((s) => CATEGORY_RE.exec(s)[1].toUpperCase() === categoryTag)
    if (!matchLine) {
      out.push(line)
    } else {
      const stripped = matchLine.replace(CATEGORY_RE, '')
      // "Nue" = aucun mot d'au moins 3 lettres UNE FOIS le motif poids H/F/MIX retire (sinon
      // "MIX" lui-meme, 3 lettres, faisait a tort croire a du texte descriptif reel sur les
      // lignes du style "M: 60 / F: 45 / MIX: 60") -- il faut alors recomposer le nom du
      // mouvement, copie verbatim depuis la ligne de base juste au-dessus.
      const isBare = !/[A-Za-z]{3,}/.test(stripped.replace(GENDER_PAIR_RE, ''))
      if (isBare) {
        const baseName = line.replace(GENDER_PAIR_RE, '').replace(/\s*-\s*$/, '').trim()
        out.push(`${baseName} - ${stripped}`)
      } else {
        out.push(stripped)
      }
    }
    i = j // saute les variantes du groupe, deja traitees ci-dessus
  }
  return out
}

// Etape 3 : "M: 20KG / F: 12.5KG" -> "20KG" (ou "12.5KG") selon le genre selectionne -- le
// chiffre garde est toujours copie mot pour mot, seul celui qui ne concerne pas le genre choisi
// (et l'eventuelle valeur MIX) disparait de l'affichage.
// Cas "Mixed" (paire mixte, Team uniquement) : si la source donne une valeur MIX explicite
// (ex: 2027 MetCon, "M: 60 / F: 45 / MIX: 60"), on l'affiche. Sinon -- la regle officielle pour
// la plupart des mouvements est que CHAQUE partenaire utilise le poids de son propre genre (cf.
// note "DB GTOH et Sandbag Carry utilisent les poids H/F prescrits", lineNotes MetCon Team) --
// on garde alors la ligne "M: X / F: Y" telle quelle plutot que de choisir arbitrairement.
function filterGenderInLine(line, gender) {
  return line.replace(GENDER_PAIR_RE, (match, mVal, fVal, mixVal) => {
    if (gender === 'Mixed') return mixVal || match
    return gender === 'Male' ? mVal : fVal
  })
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
