import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import simData from '../data/simulation_data.json'
import AthxLogo from '../components/AthxLogo'
import WorkoutReference from '../components/WorkoutReference'
import AthxCard from '../components/charts/AthxCard'
import { simulateField, simulateWithMargin, bestImprovementTarget, rankMovements, bestMovementImprovement, MARGIN_PCT, IMPROVEMENT_PCT } from '../lib/simulate'
import { useLanguage } from '../i18n/LanguageContext'
import { usePageMeta } from '../hooks/usePageMeta'
import InfoIconPortal from '../components/InfoIconPortal'

// Plateau qualificatif (invitations uniquement) -- non representatif pour un visiteur random,
// exclu du classement par competition hypothetique (meme logique que la page Analyses).
const EXCLUDED_EVENTS = new Set(['ATHX INVITATIONAL MIAMI BEACH'])

// Precision au centieme, jamais arrondie a l'entier (demande explicite) -- 2 decimales fixes.
const fmtPct = (p) => `${Math.min(Math.max(p, 0.01), 100).toFixed(2)}%`

// Bornes de validation des champs de perf -- empechent de taper n'importe quoi (texte, formats
// farfelus, valeurs impossibles). Calees sur les valeurs reellement observees dans les donnees
// scrapees (2025+2026, tous segments), avec une marge de securite :
//   Force par mouvement : max reel observe 265KG (5RM Deadlift 2026) -> plafond 300KG.
//   Endurance Solo (distance totale) : max reel observe 10.6KM (2025) -> plafond 15KM.
//   MetCon (temps total) : max reel observe 29:50 (1790s) -> plafond 30:00.
const STRENGTH_MAX_KG = 300
const METCON_MAX_SECONDS = 30 * 60

// Bornes d'endurance Team -- demande explicite utilisateur (24/09/2026), verifiees contre les
// vraies donnees : en 2026 l'endurance Team va reellement de 2.4 a 11.2KM -> 1-14KM colle bien.
// En 2025 en revanche, le format demande aux DEUX coequipiers de faire Course+Velo chacun (pas
// une relance partagee comme en 2026), donc le total Team fait ~2x un total Solo -- vrais
// totaux observes jusqu'a 20.3KM. Une borne 1-14 y rejetterait a tort de vrais resultats :
// plafond adapte a 21KM (marge au-dessus du max reel observe), min reste 1 comme demande.
const ENDURANCE_BOUNDS = {
  individual: { min: 0, max: 15 },
  team: { 2026: { min: 1, max: 14 }, 2025: { min: 1, max: 21 } },
}
function enduranceBoundsFor(mode, year) {
  return mode === 'team' ? ENDURANCE_BOUNDS.team[year] : ENDURANCE_BOUNDS.individual
}

// Parse un temps STRICTEMENT au format "MM:SS" (pas d'autre format accepte -- demande
// explicite). Secondes doivent etre < 60 (sinon "5:99" serait accepte a tort).
function parseClockToSeconds(str) {
  if (!str) return NaN
  const m = /^(\d{1,2}):([0-5]\d)$/.exec(str.trim())
  if (!m) return NaN
  return parseInt(m[1], 10) * 60 + parseInt(m[2], 10)
}

function secondsToClock(s) {
  if (!Number.isFinite(s) || s <= 0) return '—'
  const m = Math.floor(s / 60)
  const sec = Math.round(s % 60)
  return `${m}:${String(sec).padStart(2, '0')}`
}

function validateStrengthField(raw, lang) {
  if (raw === '') return null
  if (!/^\d{1,3}([.,]\d{1,2})?$/.test(raw.trim())) return lang === 'fr' ? 'Nombre uniquement (ex : 120 ou 120.5)' : 'Numbers only (e.g. 120 or 120.5)'
  const v = parseFloat(raw.replace(',', '.'))
  if (v < 0 || v > STRENGTH_MAX_KG) return lang === 'fr' ? `Entre 0 et ${STRENGTH_MAX_KG} kg` : `Between 0 and ${STRENGTH_MAX_KG} kg`
  return null
}

function validateEnduranceField(raw, lang, bounds) {
  if (raw === '') return null
  const norm = raw.trim().replace(',', '.')
  if (!/^\d{1,2}(\.\d{1,3})?$/.test(norm)) return lang === 'fr' ? 'Nombre uniquement (ex : 4.2)' : 'Numbers only (e.g. 4.2)'
  const v = parseFloat(norm)
  if (v < bounds.min || v > bounds.max) return lang === 'fr' ? `Entre ${bounds.min} et ${bounds.max} km` : `Between ${bounds.min} and ${bounds.max} km`
  return null
}

function validateMetconField(raw, lang) {
  if (raw === '') return null
  if (!/^\d{1,2}:[0-5]\d$/.test(raw.trim())) return lang === 'fr' ? 'Format MM:SS uniquement (ex : 14:30)' : 'MM:SS format only (e.g. 14:30)'
  const total = parseClockToSeconds(raw)
  if (total > METCON_MAX_SECONDS) return lang === 'fr' ? 'Entre 00:00 et 30:00' : 'Between 00:00 and 30:00'
  return null
}

function RangeBadge({ base, n, topLabel }) {
  if (!base) return null
  const fmtInt = (v) => Math.round(v).toLocaleString()
  return (
    <div className="sim-range">
      <div className="sim-range-main">
        <span className="sim-rank-num">{fmtInt(base.rank)}</span>
        <span className="sim-rank-sub">/ {fmtInt(n)}</span>
        <span className="sim-rank-pct">{topLabel(base.pctOverall)}</span>
      </div>
    </div>
  )
}

// strengthA0/1/2, strengthB0/1/2 : saisie Team, un mouvement par coequipier (demande
// explicite : pouvoir situer chaque athlete individuellement, pas seulement le total
// d'equipe) -- inutilises en Solo, qui garde strength0/1/2 comme avant.
const EMPTY_INPUTS = {
  strength0: '', strength1: '', strength2: '',
  strengthA0: '', strengthA1: '', strengthA2: '',
  strengthB0: '', strengthB1: '', strengthB2: '',
  endurance: '', metcon: '',
}

function Field({ label, error, children }) {
  return (
    <label className="sim-field">
      <span>{label}</span>
      {children}
      {error && <span className="sim-field-error">{error}</span>}
    </label>
  )
}

export default function Simulation() {
  const { lang, t } = useLanguage()
  usePageMeta({
    path: '/simulation',
    title: lang === 'fr'
      ? 'Simulateur de classement ATHX — Estimez votre place | ATHX Analysis'
      : 'ATHX Ranking Simulator — Estimate Your Placing | ATHX Analysis',
    description: lang === 'fr'
      ? 'Entrez vos performances (Force, Endurance, MetCon X) et estimez votre classement face aux résultats réels de la saison ATHX Games.'
      : 'Enter your performance (Strength, Endurance, MetCon X) and estimate your ranking against the real results of the ATHX Games season.',
  })
  const fmtInt = (n) => Math.round(n).toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US')
  const topLabel = (pct) => `Top ${fmtPct(pct)}`
  const DISCIPLINE_LABEL = { strength: t('discipline_force'), endurance: t('discipline_endurance'), metcon: t('discipline_metcon') }
  // Formate une valeur brute de performance selon l'épreuve, pour l'affichage "de X à Y".
  const formatDisciplineValue = (key, value) => {
    if (key === 'strength') return lang === 'fr' ? `${Math.round(value)} kg` : `${Math.round(value)} kg`
    if (key === 'endurance') return `${value.toFixed(2)} km`
    return secondsToClock(value)
  }

  const [year, setYear] = useState(simData.default_year)
  const [mode, setMode] = useState('individual') // 'individual' (Solo) | 'team' (paire)
  const [gender, setGender] = useState(null)
  const [category, setCategory] = useState(null)
  const [inputs, setInputs] = useState(EMPTY_INPUTS)
  const [submitted, setSubmitted] = useState(false)
  const [justSubmitted, setJustSubmitted] = useState(false)
  const resultsRef = useRef(null)

  // Defile doucement jusqu'aux resultats une fois la section montee dans le DOM (elle
  // n'existe pas encore au moment du clic, `submitted` doit d'abord declencher le rendu) --
  // retour visuel clair : sans ca, cliquer "Voir mon classement" pouvait donner l'impression
  // de n'avoir rien fait si les resultats etaient deja hors ecran plus bas.
  useEffect(() => {
    if (justSubmitted && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setJustSubmitted(false)
    }
  }, [justSubmitted])

  function handleSubmit() {
    setSubmitted(true)
    setJustSubmitted(true)
  }

  const yearData = simData.by_year[String(year)][mode]
  const genders = simData.genders_by_mode[mode]
  // strength_movements differe par CATEGORIE en 2025 (ATHX Pro a un 3e mouvement, 3RM Pull Up,
  // que la categorie ATHX reguliere n'a pas -- cf. scripts/generate_simulation_data.py) : on
  // n'a donc la vraie liste qu'une fois la categorie choisie (etape 4).
  const strengthMovements = category ? yearData.strength_movements[category] : []
  const field = gender && category ? yearData.populations[gender][category] : null
  const enduranceBounds = enduranceBoundsFor(mode, year)

  // Les 2 "emplacements" coequipier en Team, avec leur libelle et leur PROPRE genre (utile en
  // Mixte, ou les 2 coequipiers n'ont pas le meme genre -- cf. strength_by_movement_individual,
  // indexe par genre d'athlete, jamais par division d'equipe). Homme/Femme (non mixte) :
  // numerotes 1/2 (2 coequipiers du meme genre, il faut les distinguer) ; Mixte : pas de
  // numero, un seul de chaque genre, aucune ambiguite possible.
  const athleteSlots = useMemo(() => {
    if (mode !== 'team' || !gender) return []
    if (gender === 'Mixed') {
      return [
        { key: 'A', athleteGender: 'Male', label: lang === 'fr' ? 'Athlète Homme' : 'Male Athlete' },
        { key: 'B', athleteGender: 'Female', label: lang === 'fr' ? 'Athlète Femme' : 'Female Athlete' },
      ]
    }
    const genderWord = gender === 'Male' ? (lang === 'fr' ? 'Homme' : 'Male') : (lang === 'fr' ? 'Femme' : 'Female')
    const prefix = lang === 'fr' ? 'Athlète' : ''
    return [
      { key: 'A', athleteGender: gender, label: lang === 'fr' ? `${prefix} ${genderWord} 1` : `${genderWord} Athlete 1` },
      { key: 'B', athleteGender: gender, label: lang === 'fr' ? `${prefix} ${genderWord} 2` : `${genderWord} Athlete 2` },
    ]
  }, [mode, gender, lang])

  const strengthFieldKeys = mode === 'team'
    ? [
        ...['strengthA0', 'strengthA1', 'strengthA2'].slice(0, strengthMovements.length),
        ...['strengthB0', 'strengthB1', 'strengthB2'].slice(0, strengthMovements.length),
      ]
    : ['strength0', 'strength1', 'strength2'].slice(0, strengthMovements.length)

  const fieldErrors = useMemo(() => {
    const errs = {}
    strengthFieldKeys.forEach((k) => { errs[k] = validateStrengthField(inputs[k], lang) })
    errs.endurance = validateEnduranceField(inputs.endurance, lang, enduranceBounds)
    errs.metcon = validateMetconField(inputs.metcon, lang)
    return errs
  }, [inputs, lang, strengthFieldKeys, enduranceBounds])
  const hasErrors = Object.values(fieldErrors).some(Boolean)

  const parseNum = (k) => parseFloat((inputs[k] || '').replace(',', '.')) || 0

  // Valeurs par mouvement, par athlete -- uniquement pertinent en Team (2 coequipiers saisis
  // separement). athleteMovementValues.A[i]/.B[i] correspond a strengthMovements[i].
  const athleteMovementValues = useMemo(() => {
    if (mode !== 'team') return null
    return {
      A: ['strengthA0', 'strengthA1', 'strengthA2'].slice(0, strengthMovements.length).map(parseNum),
      B: ['strengthB0', 'strengthB1', 'strengthB2'].slice(0, strengthMovements.length).map(parseNum),
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, inputs, strengthMovements.length])

  // Une valeur par mouvement de Force (2 ou 3 selon saison/categorie, cf. strengthMovements) --
  // dans le meme ordre que strengthMovements, donc movementValues[i] correspond toujours a
  // strengthMovements[i]. En Team : somme des 2 coequipiers par mouvement (total d'equipe),
  // utilise partout ailleurs exactement comme avant (classement, score ATHX...).
  const movementValues = useMemo(() => {
    if (mode === 'team') {
      if (!athleteMovementValues) return []
      return strengthMovements.map((_, i) => (athleteMovementValues.A[i] || 0) + (athleteMovementValues.B[i] || 0))
    }
    return ['strength0', 'strength1', 'strength2'].slice(0, strengthMovements.length).map(parseNum)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, inputs, strengthMovements.length, athleteMovementValues])

  const perf = useMemo(() => {
    const strength = movementValues.reduce((sum, v) => sum + v, 0)
    return {
      strength,
      endurance: parseFloat((inputs.endurance || '').replace(',', '.')) || 0,
      metcon: parseClockToSeconds(inputs.metcon) || 0,
    }
  }, [inputs, movementValues])

  const valid = !hasErrors && perf.strength > 0 && perf.endurance > 0 && perf.metcon > 0

  const overallSim = useMemo(() => {
    if (!field || !submitted || !valid) return null
    return simulateWithMargin(field.overall, perf)
  }, [field, submitted, valid, perf])

  const improvement = useMemo(() => {
    if (!field || !submitted || !valid) return null
    return bestImprovementTarget(field.overall, perf)
  }, [field, submitted, valid, perf])

  // Meme principe que "Points forts/faibles" et "Sur quelle epreuve travailler en priorite",
  // mais A L'INTERIEUR de la Force : quel mouvement est le plus fort/faible (percentile
  // individuel par mouvement) et lequel, boosté de +3%, rapporte le plus de places au
  // classement general (pas forcement le meme -- s'ameliorer sur son point faible ne paie pas
  // toujours le plus, demande explicite de l'utilisateur). SOLO uniquement -- en Team, cette
  // meme analyse existe mais PAR ATHLETE (cf. athleteAnalyses ci-dessous), pas au niveau equipe.
  const movementRanksByPct = useMemo(() => {
    if (mode !== 'individual' || !field || !submitted || !valid || strengthMovements.length < 2) return []
    return rankMovements(field.overall, strengthMovements, movementValues).sort((a, b) => a.pct - b.pct)
  }, [mode, field, submitted, valid, strengthMovements, movementValues])
  const bestMovement = movementRanksByPct[0]
  const worstMovement = movementRanksByPct[movementRanksByPct.length - 1]

  const movementImprovement = useMemo(() => {
    if (mode !== 'individual' || !field || !submitted || !valid || strengthMovements.length < 2) return null
    return bestMovementImprovement(field.overall, perf, strengthMovements, movementValues)
  }, [mode, field, submitted, valid, strengthMovements, movementValues, perf])

  // Version Team de movementRanksByPct/movementImprovement, PAR ATHLETE (demande explicite) :
  // population de comparaison = strength_by_movement_individual[categorie][genre de CET
  // athlete] (tous les athletes individuels de ce genre en Team cette annee/categorie, quelle
  // que soit la composition de leur propre paire -- cf. commentaire de
  // per_movement_fields_by_athlete_gender cote script). Le classement (gain de +3%) reste
  // simule contre le champ d'EQUIPE (field.overall) avec totalOverride=perf.strength : booster
  // le mouvement d'UN SEUL coequipier change le total d'equipe, donc son classement, pas un
  // classement individuel qui n'existe pas.
  const athleteAnalyses = useMemo(() => {
    if (mode !== 'team' || !field || !submitted || !valid || strengthMovements.length < 2
      || !athleteMovementValues || athleteSlots.length < 2 || !category) return []
    return athleteSlots.map((slot) => {
      const values = athleteMovementValues[slot.key]
      const popField = { strength_by_movement: yearData.strength_by_movement_individual[category][slot.athleteGender] }
      const ranks = rankMovements(popField, strengthMovements, values).sort((a, b) => a.pct - b.pct)
      const improvement = bestMovementImprovement(field.overall, perf, strengthMovements, values, IMPROVEMENT_PCT, perf.strength)
      return { slot, best: ranks[0], worst: ranks[ranks.length - 1], improvement }
    }).filter((a) => a.best && a.worst)
  }, [mode, field, submitted, valid, strengthMovements, athleteMovementValues, athleteSlots, category, yearData, perf])

  const eventSims = useMemo(() => {
    if (!field || !submitted || !valid) return []
    return Object.entries(field.events)
      .filter(([key]) => !EXCLUDED_EVENTS.has(key))
      .map(([key, ev]) => ({
        key,
        label: ev.label,
        n: ev.n,
        ...simulateWithMargin(ev, perf),
      }))
      // Classe les competitions selon le classement que l'utilisateur y obtiendrait
      // (meilleur rang d'abord), pas par ordre alphabetique.
      .sort((a, b) => a.base.rank - b.base.rank)
  }, [field, submitted, valid, perf])

  function updateInput(key, value) {
    setInputs((prev) => ({ ...prev, [key]: value }))
    setSubmitted(false)
  }

  // Le champ MetCon (MM:SS) etait un seul <input> avec inputMode="numeric" -- sur mobile, ce
  // mode force un clavier NUMERIQUE PUR (comme un code PIN), qui n'a pas la touche ":" (aucun
  // inputMode standard, ni "numeric" ni "decimal" ni "tel", n'inclut ":"). Impossible de taper
  // "14:30" au clavier tactile. Fix : deux petits champs numeriques (minutes / secondes)
  // separes par un ":" purement visuel (pas de saisie dessus) -- chaque champ garde son clavier
  // numerique mobile, et on recompose "MM:SS" en interne pour ne rien changer a la validation/
  // au calcul existants (inputs.metcon reste la source de verite, format inchange).
  function splitClock(raw) {
    const [m, s] = (raw || '').split(':')
    return { m: m || '', s: s || '' }
  }

  function updateMetconPart(part, rawValue) {
    const digits = rawValue.replace(/\D/g, '').slice(0, 2)
    const { m, s } = splitClock(inputs.metcon)
    const next = part === 'm' ? { m: digits, s } : { m, s: digits }
    updateInput('metcon', next.m === '' && next.s === '' ? '' : `${next.m}:${next.s}`)
  }

  function changeYear(y) {
    setYear(y)
    setGender(null)
    setCategory(null)
    setInputs(EMPTY_INPUTS)
    setSubmitted(false)
  }

  function changeMode(m) {
    setMode(m)
    setGender(null)
    setCategory(null)
    setInputs(EMPTY_INPUTS)
    setSubmitted(false)
  }

  function reset() {
    setGender(null)
    setCategory(null)
    setInputs(EMPTY_INPUTS)
    setSubmitted(false)
  }

  const disciplinesByPct = overallSim?.base
    ? [
        { key: 'strength', label: DISCIPLINE_LABEL.strength, pct: overallSim.base.pctStrength, rank: overallSim.base.subrankStrength },
        { key: 'endurance', label: DISCIPLINE_LABEL.endurance, pct: overallSim.base.pctEndurance, rank: overallSim.base.subrankEndurance },
        { key: 'metcon', label: DISCIPLINE_LABEL.metcon, pct: overallSim.base.pctMetcon, rank: overallSim.base.subrankMetcon },
      ].sort((a, b) => a.pct - b.pct)
    : []
  const best = disciplinesByPct[0]
  const worst = disciplinesByPct[disciplinesByPct.length - 1]
  const genderLabel = (g) => {
    if (g === 'Male') return lang === 'fr' ? 'Homme' : 'Men'
    if (g === 'Female') return lang === 'fr' ? 'Femme' : 'Women'
    return lang === 'fr' ? 'Mixte' : 'Mixed'
  }
  const modeLabel = (m) => (m === 'team' ? (lang === 'fr' ? 'Team' : 'Team') : (lang === 'fr' ? 'Solo' : 'Solo'))

  return (
    <div className="sim-page">
      <section className="hero sim-hero">
        <div className="container">
          <AthxLogo color="#ffffff" className="hero-logo" />
          <h1>{lang === 'fr' ? 'Simulation : où vous classeriez-vous ?' : 'Simulation: where would you rank?'}</h1>
          <p>
            {lang === 'fr' ? (
              <>Entrez vos estimations de performance sur les 3 épreuves ATHX et découvrez le
                classement exact que vous auriez obtenu, au général comme sur chaque compétition,
                face aux vrais résultats de la saison choisie.</>
            ) : (
              <>Enter your performance estimates on the 3 ATHX events and find out the exact
                ranking you would have gotten, overall and on each competition, against the real
                results of the chosen season.</>
            )}
          </p>
        </div>
      </section>

      <section className="section sim-section">
        <div className="container">
          <div className="sim-step">
            <p className="section-title">{lang === 'fr' ? 'Étape 1' : 'Step 1'}</p>
            <h2 className="section-heading sim-step-heading">{lang === 'fr' ? 'Saison' : 'Season'}</h2>
            <div className="sim-square-grid sim-year-grid">
              {simData.years.map((y) => (
                <button
                  key={y}
                  className={`sim-square${year === y ? ' active' : ''}`}
                  onClick={() => changeYear(y)}
                >
                  {y}
                </button>
              ))}
            </div>
          </div>

          <div className="sim-step">
            <p className="section-title">{lang === 'fr' ? 'Étape 2' : 'Step 2'}</p>
            <h2 className="section-heading sim-step-heading">{lang === 'fr' ? 'Format' : 'Format'}</h2>
            <div className="sim-square-grid">
              <button className={`sim-square${mode === 'individual' ? ' active' : ''}`} onClick={() => changeMode('individual')}>
                {lang === 'fr' ? 'Solo' : 'Solo'}
              </button>
              <button className={`sim-square${mode === 'team' ? ' active' : ''}`} onClick={() => changeMode('team')}>
                {lang === 'fr' ? 'Team' : 'Team'}
              </button>
            </div>
          </div>

          <div className="sim-step">
            <p className="section-title">{lang === 'fr' ? 'Étape 3' : 'Step 3'}</p>
            <h2 className="section-heading sim-step-heading">{lang === 'fr' ? 'Division' : 'Division'}</h2>
            <div className="sim-square-grid">
              {genders.map((g) => (
                <button
                  key={g}
                  className={`sim-square${gender === g ? ' active' : ''}`}
                  onClick={() => { setGender(g); setCategory(null); setSubmitted(false) }}
                >
                  {genderLabel(g)}
                </button>
              ))}
            </div>
          </div>

          {gender && (
            <div className="sim-step">
              <p className="section-title">{lang === 'fr' ? 'Étape 4' : 'Step 4'}</p>
              <h2 className="section-heading sim-step-heading">{t('category')}</h2>
              <div className="sim-square-grid">
                {simData.categories.map((c) => (
                  <button
                    key={c}
                    className={`sim-square${category === c ? ' active' : ''}`}
                    onClick={() => { setCategory(c); setSubmitted(false) }}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          {gender && category && field && (
            <div className="sim-step">
              <p className="section-title">{lang === 'fr' ? 'Étape 5' : 'Step 5'}</p>
              <h2 className="section-heading sim-step-heading">{lang === 'fr' ? 'Vos estimations de performance' : 'Your performance estimates'}</h2>

              <WorkoutReference year={year} mode={mode} gender={gender} category={category} />

              <div className="sim-form">
                <div className="sim-form-group">
                  <h3>{DISCIPLINE_LABEL.strength} <span className="sim-form-unit">{lang === 'fr' ? `(KG par mouvement, 0 à ${STRENGTH_MAX_KG})` : `(KG per movement, 0 to ${STRENGTH_MAX_KG})`}</span></h3>
                  {mode === 'team' ? (
                    // Team : un jeu de champs par coequipier (demande explicite -- permet
                    // ensuite de situer CHAQUE athlete individuellement, pas seulement le
                    // total d'equipe). Le total par mouvement (somme des 2) reste utilise
                    // partout ailleurs exactement comme avant.
                    athleteSlots.map((slot) => (
                      <div key={slot.key} className="sim-form-athlete">
                        <p className="sim-form-athlete-label">{slot.label}</p>
                        <div className="sim-form-row">
                          {strengthMovements.map((mv, i) => {
                            const key = `strength${slot.key}${i}`
                            return (
                              <Field key={key} label={mv} error={fieldErrors[key]}>
                                <input
                                  type="text" inputMode="decimal" placeholder={lang === 'fr' ? 'ex : 120' : 'e.g. 120'}
                                  className={fieldErrors[key] ? 'has-error' : ''}
                                  value={inputs[key]}
                                  onChange={(e) => updateInput(key, e.target.value)}
                                />
                              </Field>
                            )
                          })}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="sim-form-row">
                      {strengthMovements.map((mv, i) => {
                        const key = `strength${i}`
                        return (
                          <Field key={key} label={mv} error={fieldErrors[key]}>
                            <input
                              type="text" inputMode="decimal" placeholder={lang === 'fr' ? 'ex : 120' : 'e.g. 120'}
                              className={fieldErrors[key] ? 'has-error' : ''}
                              value={inputs[key]}
                              onChange={(e) => updateInput(key, e.target.value)}
                            />
                          </Field>
                        )
                      })}
                    </div>
                  )}
                </div>

                <div className="sim-form-group">
                  <h3>{DISCIPLINE_LABEL.endurance} <span className="sim-form-unit">{lang === 'fr' ? `(distance totale${mode === 'team' ? ' de la paire' : ''}, KM, ${enduranceBounds.min} à ${enduranceBounds.max})` : `(total distance${mode === 'team' ? ', pair' : ''}, KM, ${enduranceBounds.min} to ${enduranceBounds.max})`}</span></h3>
                  <Field label={lang === 'fr' ? 'Distance totale' : 'Total distance'} error={fieldErrors.endurance}>
                    <input
                      type="text" inputMode="decimal" placeholder="ex : 4.2"
                      className={fieldErrors.endurance ? 'has-error' : ''}
                      value={inputs.endurance}
                      onChange={(e) => updateInput('endurance', e.target.value)}
                    />
                  </Field>
                </div>

                <div className="sim-form-group">
                  <h3>MetCon X <span className="sim-form-unit">{lang === 'fr' ? '(temps total, minutes et secondes, 00:00 à 30:00)' : '(total time, minutes and seconds, 00:00 to 30:00)'}</span></h3>
                  <Field
                    label={`${lang === 'fr' ? 'Temps total' : 'Total time'}${inputs.metcon && !fieldErrors.metcon && Number.isFinite(parseClockToSeconds(inputs.metcon)) ? ` (= ${parseClockToSeconds(inputs.metcon)}s)` : ''}`}
                    error={fieldErrors.metcon}
                  >
                    {/* Deux champs numeriques separes (clavier mobile numerique valide sur les
                        deux) plutot qu'un seul champ "MM:SS" -- voir commentaire sur
                        updateMetconPart plus haut dans le fichier. */}
                    <div className="sim-clock-row">
                      <input
                        type="text" inputMode="numeric" pattern="[0-9]*" maxLength={2} placeholder="14"
                        aria-label={lang === 'fr' ? 'Minutes' : 'Minutes'}
                        className={fieldErrors.metcon ? 'has-error' : ''}
                        value={splitClock(inputs.metcon).m}
                        onChange={(e) => updateMetconPart('m', e.target.value)}
                      />
                      <span className="sim-clock-sep" aria-hidden="true">:</span>
                      <input
                        type="text" inputMode="numeric" pattern="[0-9]*" maxLength={2} placeholder="30"
                        aria-label={lang === 'fr' ? 'Secondes' : 'Seconds'}
                        className={fieldErrors.metcon ? 'has-error' : ''}
                        value={splitClock(inputs.metcon).s}
                        onChange={(e) => updateMetconPart('s', e.target.value)}
                      />
                    </div>
                  </Field>
                </div>
              </div>

              <div className="sim-actions">
                <button className="sim-submit" disabled={!valid} onClick={handleSubmit}>
                  {lang === 'fr' ? 'Voir mon classement' : 'See my ranking'}
                </button>
                <button className="sim-reset-link" onClick={reset}>{lang === 'fr' ? 'Recommencer' : 'Start over'}</button>
              </div>
            </div>
          )}
        </div>
      </section>

      {submitted && valid && overallSim?.base && (
        <section className="section sim-results" ref={resultsRef}>
          <div className="container">
            <p className="section-title">{lang === 'fr' ? 'Résultats' : 'Results'}</p>
            <h2 className="section-heading sim-step-heading">
              {modeLabel(mode)} · {genderLabel(gender)} · {category} · {lang === 'fr' ? 'saison' : 'season'} {year}
            </h2>

            <div className="sim-result-block">
              <h3>{lang === 'fr' ? 'Classement général, toutes compétitions confondues' : 'Overall ranking, all competitions combined'}</h3>
              <RangeBadge base={overallSim.base} n={field.overall.n} topLabel={topLabel} />
            </div>

            <div className="sim-result-block">
              <h3>{lang === 'fr' ? 'Classement général par épreuve' : 'Overall ranking by event'}</h3>
              <div className="sim-discipline-grid">
                {[
                  { key: 'strength', label: DISCIPLINE_LABEL.strength, rank: overallSim.base.subrankStrength, pct: overallSim.base.pctStrength },
                  { key: 'endurance', label: DISCIPLINE_LABEL.endurance, rank: overallSim.base.subrankEndurance, pct: overallSim.base.pctEndurance },
                  { key: 'metcon', label: DISCIPLINE_LABEL.metcon, rank: overallSim.base.subrankMetcon, pct: overallSim.base.pctMetcon },
                ].map((d) => (
                  <div key={d.key} className="sim-discipline-card">
                    <p className="sim-discipline-label">{d.label}</p>
                    <p className="sim-discipline-rank">{fmtInt(d.rank)} <span className="sim-discipline-total">/ {fmtInt(field.overall.n)}</span></p>
                    <p className="sim-discipline-pct">{topLabel(d.pct)}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="sim-result-block">
              <h3>{lang === 'fr' ? 'Classement par compétition' : 'Ranking by competition'}</h3>
              <div className="table-wrap sim-event-table-wrap">
                <table className="lb-table sim-event-table">
                  <thead>
                    <tr>
                      <th scope="col">{t('event')}</th>
                      <th scope="col">{t('rank')}</th>
                      <th scope="col">{lang === 'fr' ? 'Percentile' : 'Percentile'}</th>
                      <th scope="col">
                        {lang === 'fr' ? "Marge d'erreur" : 'Margin of error'}
                        <InfoIconPortal
                          text={lang === 'fr' ? (
                            <>Simulation basée sur les résultats réels de la saison {year} scrapés
                              sur ce site ({modeLabel(mode)}, division {genderLabel(gender)},
                              catégorie {category}). Le classement est calculé en comparant
                              directement vos estimations aux performances de
                              {mode === 'team' ? ' toutes les paires ayant participé' : ' tous les athlètes ayant concouru'}.
                              La colonne "Marge d'erreur" indique la plage de classement possible
                              avec une estimation ±{MARGIN_PCT}% plus ou moins optimiste,
                              l'incertitude habituelle d'une auto-évaluation, pas une garantie de
                              résultat.</>
                          ) : (
                            <>Simulation based on the real results of the {year} season scraped
                              from this site ({modeLabel(mode)}, division {genderLabel(gender)},
                              category {category}). The ranking is calculated by directly
                              comparing your estimates to the performances of
                              {mode === 'team' ? ' every pair that competed' : ' every athlete who competed'}.
                              The "Margin of error" column shows the possible ranking range with
                              an estimate ±{MARGIN_PCT}% more or less optimistic — the usual
                              uncertainty of a self-assessment, not a guarantee of result.</>
                          )}
                        />
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {eventSims.map((ev) => (
                      <tr key={ev.key}>
                        <td>{ev.label}</td>
                        <td className="rank-cell">{fmtInt(ev.base.rank)} / {fmtInt(ev.n)}</td>
                        <td>{topLabel(ev.base.pctOverall)}</td>
                        <td className="sim-event-margin">
                          {ev.best.rank !== ev.base.rank || ev.worst.rank !== ev.base.rank
                            ? `${fmtInt(ev.best.rank)} – ${fmtInt(ev.worst.rank)}`
                            : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {overallSim?.base && (
              <div className="sim-result-block">
                <h3>{lang === 'fr' ? 'Votre score ATHX' : 'Your ATHX score'}</h3>
                <p className="sim-improve-intro">
                  {lang === 'fr' ? (
                    <>Pour situer votre profil en un coup d'œil, on donne une note sur 100 par
                      épreuve. C'est une autre façon de voir où vous en êtes, vos points forts et vos
                      points faibles.</>
                  ) : (
                    <>To place your profile at a glance, we give a score out of 100 per event. It's
                      another way to see where you stand, your strengths and your weaknesses.</>
                  )}
                </p>
                <AthxCard
                  division={genderLabel(gender)}
                  category={category}
                  scores={{
                    strength: Math.round(100 - overallSim.base.pctStrength),
                    endurance: Math.round(100 - overallSim.base.pctEndurance),
                    metcon: Math.round(100 - overallSim.base.pctMetcon),
                  }}
                />
              </div>
            )}

            {best && worst && (
              <div className="sim-result-block">
                <h3>{lang === 'fr' ? 'Points forts / points faibles' : 'Strengths / weaknesses'}</h3>
                <div className="sim-strength-weakness">
                  <div className="sim-sw-card sim-sw-good">
                    <p className="sim-sw-tag">{lang === 'fr' ? 'Point fort' : 'Strength'}</p>
                    <p className="sim-sw-name">{best.label}</p>
                    <p className="sim-sw-detail">
                      {topLabel(best.pct)}, {lang === 'fr' ? "c'est l'épreuve qui vous donne votre meilleure place" : 'the event that gives you your best placing'}
                    </p>
                  </div>
                  <div className="sim-sw-card sim-sw-bad">
                    <p className="sim-sw-tag">{lang === 'fr' ? 'Point faible' : 'Weakness'}</p>
                    <p className="sim-sw-name">{worst.label}</p>
                    <p className="sim-sw-detail">
                      {topLabel(worst.pct)}, {lang === 'fr' ? "c'est l'épreuve qui vous coûte le plus de places" : 'the event that costs you the most placings'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {improvement && (
              <div className="sim-result-block">
                <h3>{lang === 'fr' ? 'Sur quelle épreuve travailler en priorité ?' : 'Which event should you prioritize?'}</h3>
                <p className="sim-improve-intro">
                  {lang === 'fr' ? (
                    <>Si vous deviez mettre l'accent sur UNE seule épreuve (les 2 autres restant
                      identiques), voici le nombre de places gagnées pour un même effort de +{IMPROVEMENT_PCT}%
                      {' '}de performance, épreuve par épreuve, avec la performance concrète que ça
                      représente. Certaines épreuves rapportent nettement plus de places que d'autres
                      en fonction du niveau que vous avez et du niveau des autres participants pour
                      le même effort : c'est là qu'un effort de progression est le plus rentable.</>
                  ) : (
                    <>If you had to focus on just ONE event (the other 2 staying the same), here's
                      the number of places gained for the same +{IMPROVEMENT_PCT}% effort in
                      performance, event by event, with the concrete performance that represents.
                      Some events yield clearly more places than others depending on your own
                      level and the level of other participants, for the same effort: that's
                      where a progression effort pays off the most.</>
                  )}
                </p>
                <div className="sim-improve-grid">
                  {improvement.scenarios.map((s, i) => (
                    <div key={s.key} className={`sim-improve-card${i === 0 ? ' sim-improve-best' : ''}`}>
                      <p className="sim-improve-label">
                        {DISCIPLINE_LABEL[s.key]}{i === 0 ? (lang === 'fr' ? ', le plus rentable' : ', the most profitable') : ''}
                      </p>
                      <p className="sim-improve-values">
                        {formatDisciplineValue(s.key, s.fromValue)} → {formatDisciplineValue(s.key, s.toValue)}
                      </p>
                      <p className="sim-improve-gain">
                        {s.gain > 0
                          ? (lang === 'fr' ? `+${fmtInt(s.gain)} place${s.gain > 1 ? 's' : ''}` : `+${fmtInt(s.gain)} place${s.gain > 1 ? 's' : ''}`)
                          : (lang === 'fr' ? 'aucun gain' : 'no gain')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {mode === 'individual' && bestMovement && worstMovement && (
              <div className="sim-result-block">
                <h3>{lang === 'fr' ? 'Mouvement fort / mouvement faible (Force)' : 'Strong / weak movement (Strength)'}</h3>
                <p className="sim-improve-intro">
                  {lang === 'fr' ? (
                    <>Même principe que les points forts/faibles, mais à l'intérieur de la
                      Force : chaque mouvement comparé à sa propre population (un 1RM Strict
                      Press ne se compare pas à un 5RM Deadlift en KG bruts).</>
                  ) : (
                    <>Same idea as strengths/weaknesses, but inside Strength itself: each
                      movement compared to its own population (a 1RM Strict Press can't be
                      compared to a 5RM Deadlift in raw KG).</>
                  )}
                </p>
                <div className="sim-strength-weakness">
                  <div className="sim-sw-card sim-sw-good">
                    <p className="sim-sw-tag">{lang === 'fr' ? 'Mouvement fort' : 'Strong movement'}</p>
                    <p className="sim-sw-name">{bestMovement.label}</p>
                    <p className="sim-sw-detail">
                      {topLabel(bestMovement.pct)}, {formatDisciplineValue('strength', bestMovement.value)}
                    </p>
                  </div>
                  <div className="sim-sw-card sim-sw-bad">
                    <p className="sim-sw-tag">{lang === 'fr' ? 'Mouvement faible' : 'Weak movement'}</p>
                    <p className="sim-sw-name">{worstMovement.label}</p>
                    <p className="sim-sw-detail">
                      {topLabel(worstMovement.pct)}, {formatDisciplineValue('strength', worstMovement.value)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {mode === 'individual' && movementImprovement && (
              <div className="sim-result-block">
                <h3>{lang === 'fr' ? 'Quel mouvement de Force prioriser ?' : 'Which Strength movement should you prioritize?'}</h3>
                <p className="sim-improve-intro">
                  {lang === 'fr' ? (
                    <>Attention, ce n'est pas forcément votre mouvement faible : s'améliorer de
                      +{IMPROVEMENT_PCT}% (arrondi au KG près) sur votre point faible ne fait pas
                      toujours gagner le plus de KG sur le total Force, donc pas forcément le
                      plus de places au classement général. Voici le vrai classement, mouvement
                      par mouvement.</>
                  ) : (
                    <>Careful, it's not necessarily your weak movement: a +{IMPROVEMENT_PCT}%
                      improvement (rounded to the nearest KG) on your weak point doesn't always
                      add the most KG to your total Strength score, so not necessarily the most
                      places in the overall ranking. Here's the real ranking, movement by
                      movement.</>
                  )}
                </p>
                <div className="sim-improve-grid">
                  {movementImprovement.scenarios.map((s, i) => (
                    <div key={s.key} className={`sim-improve-card${i === 0 ? ' sim-improve-best' : ''}`}>
                      <p className="sim-improve-label">
                        {s.label}{i === 0 ? (lang === 'fr' ? ', le plus rentable' : ', the most profitable') : ''}
                      </p>
                      <p className="sim-improve-values">
                        {formatDisciplineValue('strength', s.fromValue)} → {formatDisciplineValue('strength', s.toValue)}
                      </p>
                      <p className="sim-improve-gain">
                        {s.gain > 0
                          ? `+${fmtInt(s.gain)} ${lang === 'fr' ? `place${s.gain > 1 ? 's' : ''}` : `place${s.gain > 1 ? 's' : ''}`}`
                          : (lang === 'fr' ? 'aucun gain' : 'no gain')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Team : meme principe, mais PAR ATHLETE (demande explicite) -- remplace les 2
                blocs equipe ci-dessus, un fort/faible + une priorite de progression par
                coequipier, chacun compare a la population de son propre genre (cf.
                athleteAnalyses). */}
            {mode === 'team' && athleteAnalyses.map(({ slot, best, worst, improvement }) => (
              <Fragment key={slot.key}>
                <div className="sim-result-block">
                  <h3>
                    {lang === 'fr' ? `Mouvement fort / mouvement faible — ${slot.label}` : `Strong / weak movement — ${slot.label}`}
                  </h3>
                  <p className="sim-improve-intro">
                    {lang === 'fr' ? (
                      <>Même principe que les points forts/faibles, mais à l'intérieur de la
                        Force et pour {slot.label} individuellement : chaque mouvement comparé
                        à la population des athlètes de son genre en Team (un 1RM Strict Press
                        ne se compare pas à un 5RM Deadlift en KG bruts).</>
                    ) : (
                      <>Same idea as strengths/weaknesses, but inside Strength and for
                        {' '}{slot.label} individually: each movement compared to the
                        population of Team athletes of their own gender (a 1RM Strict Press
                        can't be compared to a 5RM Deadlift in raw KG).</>
                    )}
                  </p>
                  <div className="sim-strength-weakness">
                    <div className="sim-sw-card sim-sw-good">
                      <p className="sim-sw-tag">{lang === 'fr' ? 'Mouvement fort' : 'Strong movement'}</p>
                      <p className="sim-sw-name">{best.label}</p>
                      <p className="sim-sw-detail">
                        {topLabel(best.pct)}, {formatDisciplineValue('strength', best.value)}
                      </p>
                    </div>
                    <div className="sim-sw-card sim-sw-bad">
                      <p className="sim-sw-tag">{lang === 'fr' ? 'Mouvement faible' : 'Weak movement'}</p>
                      <p className="sim-sw-name">{worst.label}</p>
                      <p className="sim-sw-detail">
                        {topLabel(worst.pct)}, {formatDisciplineValue('strength', worst.value)}
                      </p>
                    </div>
                  </div>
                </div>

                {improvement && (
                  <div className="sim-result-block">
                    <h3>
                      {lang === 'fr' ? `Quel mouvement prioriser pour ${slot.label} ?` : `Which movement should ${slot.label} prioritize?`}
                    </h3>
                    <p className="sim-improve-intro">
                      {lang === 'fr' ? (
                        <>Attention, ce n'est pas forcément son mouvement faible : améliorer un
                          mouvement de +{IMPROVEMENT_PCT}% (arrondi au KG près) ne fait pas
                          toujours gagner le plus de KG sur le total Force de l'équipe, donc pas
                          forcément le plus de places au classement général. Voici le vrai
                          classement, mouvement par mouvement, pour {slot.label}.</>
                      ) : (
                        <>Careful, it's not necessarily their weak movement: a +{IMPROVEMENT_PCT}%
                          improvement (rounded to the nearest KG) on one movement doesn't always
                          add the most KG to the team's total Strength score, so not necessarily
                          the most places in the overall ranking. Here's the real ranking,
                          movement by movement, for {slot.label}.</>
                      )}
                    </p>
                    <div className="sim-improve-grid">
                      {improvement.scenarios.map((s, i) => (
                        <div key={s.key} className={`sim-improve-card${i === 0 ? ' sim-improve-best' : ''}`}>
                          <p className="sim-improve-label">
                            {s.label}{i === 0 ? (lang === 'fr' ? ', le plus rentable' : ', the most profitable') : ''}
                          </p>
                          <p className="sim-improve-values">
                            {formatDisciplineValue('strength', s.fromValue)} → {formatDisciplineValue('strength', s.toValue)}
                          </p>
                          <p className="sim-improve-gain">
                            {s.gain > 0
                              ? `+${fmtInt(s.gain)} ${lang === 'fr' ? `place${s.gain > 1 ? 's' : ''}` : `place${s.gain > 1 ? 's' : ''}`}`
                              : (lang === 'fr' ? 'aucun gain' : 'no gain')}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Fragment>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
