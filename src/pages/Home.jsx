import { useState } from 'react'
import { Link } from 'react-router-dom'
import AthxLogo from '../components/AthxLogo'
import Reveal from '../components/Reveal'
import WorkoutFormatCard from '../components/WorkoutFormatCard'
import { OFFICIAL_WORKOUTS, OFFICIAL_YEARS } from '../data/workout_official'
import { useLanguage } from '../i18n/LanguageContext'

const ARROW = (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 11L11 3M11 3H4M11 3V10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
)

const FLOW_ARROW = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M5 12H19M19 12L13 6M19 12L13 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
)

// Pauses OFFICIELLES entre les 3 epreuves -- source : section "How It Works" de la page
// d'accueil athxgames.com (timeline Start -> Warm-Up 30:00 -> Strength -> Refuel Zone 10:00 ->
// Endurance -> Recovery Zone 30:00 -> MetCon X -> Finish), confirmee identique sur la page
// officielle des workouts 2025 (Zone 3.0 Refuel 10 MINS, Zone 5.0 Recovery 30 MINS). Meme
// structure de pause pour les 3 saisons affichees ici (aucune source ne la donne differente
// par annee).
const BREAK_AFTER_STRENGTH = { min: 10, fr: 'Ravitaillement', en: 'Refuel' }
const BREAK_AFTER_ENDURANCE = { min: 30, fr: 'Récupération', en: 'Recovery' }

function FlowArrow({ theBreak, lang }) {
  return (
    <div className="wof-flow-arrow">
      {FLOW_ARROW}
      <span className="wof-flow-arrow-time">{theBreak.min} {lang === 'fr' ? 'min' : 'min'}</span>
      <span className="wof-flow-arrow-label">{lang === 'fr' ? theBreak.fr : theBreak.en}</span>
    </div>
  )
}

// Page d'accroche (nouvelle "/", l'ancienne page d'accueil vit desormais sur /le-sport, voir
// Sport.jsx) : objectif = hooker un visiteur qui ne connait pas les ATHX Games, lui montrer le
// format exact en 10 secondes, puis l'amener -- de son plein gre, en apparence -- vers la page
// qui parle du sport et de sa croissance (elle-meme un tremplin vers Simulation).
export default function Home() {
  const { lang } = useLanguage()

  const [year, setYear] = useState(2026)
  const [mode, setMode] = useState('individual') // 'individual' (Solo) | 'pairs' (Team)
  const [gender, setGender] = useState('Male') // 'Male' (Homme) | 'Female' (Femme)
  const [category, setCategory] = useState('ATHX') // 'ATHX' | 'ATHX Pro' | 'LITE'

  const yearData = OFFICIAL_WORKOUTS[year]
  const categoryTag = category === 'ATHX Pro' ? 'PRO' : category === 'LITE' ? 'LITE' : 'ATHX'

  return (
    <>
      <section className="hero">
        <div className="container">
          <AthxLogo color="#ffffff" className="hero-logo" />
          <h1>
            {lang === 'fr'
              ? '3 épreuves : Force, Endurance, Endurance de force'
              : '3 events: Strength, Endurance, Strength-Endurance'}
          </h1>
          <p>
            {lang === 'fr' ? (
              <>Qui est l'athlète le plus complet ? Force, endurance et endurance de force
                testées dans une seule compétition.</>
            ) : (
              <>Who's the most complete athlete? Strength, endurance and strength-endurance,
                tested in a single competition.</>
            )}
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <Reveal>
            <div className="hook-cards">
              <Link to="/le-sport" className="hook-card">
                <span className="hook-card-num">01</span>
                <span className="hook-card-eyebrow">{lang === 'fr' ? 'Le Sport' : 'The Sport'}</span>
                <h3 className="hook-card-title">{lang === 'fr' ? 'Un sport d\'avenir ?' : 'A sport with a future?'}</h3>
                <p className="hook-card-body">
                  {lang === 'fr' ? (
                    <>ATHX pourra-t-il un jour rivaliser avec HYROX ? Le sport construit-il son
                      image de marque avec des athlètes phares ?</>
                  ) : (
                    <>Could ATHX one day rival HYROX? Is the sport building its brand with
                      standout athletes?</>
                  )}
                </p>
                <span className="hook-card-cta">
                  {lang === 'fr' ? 'Découvrir la croissance ATHX' : "Discover ATHX's growth"}
                  <span className="btn-pill-icon">{ARROW}</span>
                </span>
              </Link>

              <Link to="/analyses" className="hook-card">
                <span className="hook-card-num">02</span>
                <span className="hook-card-eyebrow">{lang === 'fr' ? 'Analyses' : 'Analyses'}</span>
                <h3 className="hook-card-title">{lang === 'fr' ? 'Faut-il être bon partout ?' : 'Do you need to be good at everything?'}</h3>
                <p className="hook-card-body">
                  {lang === 'fr' ? (
                    <>Peut-on vraiment compenser un point faible ? Existe-t-il un profil type chez
                      les meilleurs ? Et à partir de quel niveau de performance l'optimisation de
                      la performance devient-elle moins rentable ?</>
                  ) : (
                    <>Can a weak spot really be compensated for? Is there a typical profile among
                      the best? And past what performance level does optimizing performance
                      further stop paying off?</>
                  )}
                </p>
                <span className="hook-card-cta">
                  {lang === 'fr' ? 'Voir ce que les données montrent' : 'See what the data shows'}
                  <span className="btn-pill-icon">{ARROW}</span>
                </span>
              </Link>

              <Link to="/simulation" className="hook-card">
                <span className="hook-card-num">03</span>
                <span className="hook-card-eyebrow">{lang === 'fr' ? 'Simulation' : 'Simulation'}</span>
                <h3 className="hook-card-title">{lang === 'fr' ? 'Où te situerais-tu ?' : 'Where would you rank?'}</h3>
                <p className="hook-card-body">
                  {lang === 'fr' ? (
                    <>Tu hésites à t'inscrire à un ATHX ? Découvre exactement où tu te classerais
                      face aux vrais résultats de la saison, tes points forts, tes points faibles,
                      et l'épreuve sur laquelle progresser en priorité.</>
                  ) : (
                    <>On the fence about signing up for an ATHX? Find out exactly where you'd rank
                      against this season's real results, your strengths, your weaknesses, and
                      which event to prioritize.</>
                  )}
                </p>
                <span className="hook-card-cta">
                  {lang === 'fr' ? 'Simuler mon classement' : 'Simulate my ranking'}
                  <span className="btn-pill-icon">{ARROW}</span>
                </span>
              </Link>
            </div>
          </Reveal>

          <Reveal>
            <h2 className="wof-page-title" style={{ marginTop: 64 }}>
              {lang === 'fr' ? 'Déroulement de la compétition' : 'How the Competition Works'}
            </h2>
            <p className="about-intro-text" style={{ marginBottom: 28 }}>
              {lang === 'fr' ? (
                <>Le format change chaque saison, décliné en plusieurs catégories (LITE, ATHX,
                  ATHX Pro) et adapté au genre comme au format Team. Sur chaque épreuve, l'athlète
                  est classé ; l'addition de ces trois classements donne son score total — et
                  l'objectif est d'obtenir la somme la plus basse possible.</>
              ) : (
                <>The format changes every season, split into several categories (LITE, ATHX,
                  ATHX Pro) and adapted for gender and for the Team format. On each event, the
                  athlete is ranked; adding up those three rankings gives their total score — and
                  the goal is to get the lowest sum possible.</>
              )}
            </p>

            <div className="wof-filter-row">
              <div className="wof-filter-block">
                <span className="wof-filter-title">{lang === 'fr' ? 'Saison' : 'Season'}</span>
                <div className="wof-toggle-group">
                  {OFFICIAL_YEARS.map((y) => (
                    <button key={y} className={`wof-toggle-btn${year === y ? ' active' : ''}`} onClick={() => setYear(y)}>{y}</button>
                  ))}
                </div>
              </div>

              <div className="wof-filter-block">
                <span className="wof-filter-title">{lang === 'fr' ? 'Format' : 'Format'}</span>
                <div className="wof-toggle-group">
                  <button className={`wof-toggle-btn${mode === 'individual' ? ' active' : ''}`} onClick={() => setMode('individual')}>
                    {lang === 'fr' ? 'Solo' : 'Solo'}
                  </button>
                  <button className={`wof-toggle-btn${mode === 'pairs' ? ' active' : ''}`} onClick={() => setMode('pairs')}>
                    {lang === 'fr' ? 'Team' : 'Team'}
                  </button>
                </div>
              </div>

              <div className="wof-filter-block">
                <span className="wof-filter-title">{lang === 'fr' ? 'Genre' : 'Gender'}</span>
                <div className="wof-toggle-group">
                  <button className={`wof-toggle-btn${gender === 'Male' ? ' active' : ''}`} onClick={() => setGender('Male')}>
                    {lang === 'fr' ? 'Homme' : 'Men'}
                  </button>
                  <button className={`wof-toggle-btn${gender === 'Female' ? ' active' : ''}`} onClick={() => setGender('Female')}>
                    {lang === 'fr' ? 'Femme' : 'Women'}
                  </button>
                </div>
              </div>

              <div className="wof-filter-block">
                <span className="wof-filter-title">{lang === 'fr' ? 'Catégorie' : 'Category'}</span>
                <div className="wof-toggle-group">
                  {['ATHX', 'ATHX Pro', 'LITE'].map((c) => (
                    <button key={c} className={`wof-toggle-btn${category === c ? ' active' : ''}`} onClick={() => setCategory(c)}>{c}</button>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal>
            <div className="wof-cards-row">
              <WorkoutFormatCard zone={yearData.zones.strength} mode={mode} gender={gender} categoryTag={categoryTag} />
              <FlowArrow theBreak={BREAK_AFTER_STRENGTH} lang={lang} />
              <WorkoutFormatCard zone={yearData.zones.endurance} mode={mode} gender={gender} categoryTag={categoryTag} />
              <FlowArrow theBreak={BREAK_AFTER_ENDURANCE} lang={lang} />
              <WorkoutFormatCard zone={yearData.zones.metconx} mode={mode} gender={gender} categoryTag={categoryTag} />
            </div>
            <p className="source-line" style={{ marginTop: 16 }}>
              {lang === 'fr' ? (
                <>Format officiel : <a href={yearData.sourceUrl} target="_blank" rel="noreferrer">{yearData.sourceUrl}</a>.</>
              ) : (
                <>Official format: <a href={yearData.sourceUrl} target="_blank" rel="noreferrer">{yearData.sourceUrl}</a>.</>
              )}
            </p>
          </Reveal>

          <Reveal>
            <p className="about-closing-text" style={{ marginTop: 48 }}>
              {lang === 'fr' ? (
                <>Sur le papier, ce format est construit pour ne récompenser que des profils
                  vraiment complets : être mauvais sur une seule épreuve ne devrait pas permettre
                  d'être bien classé. Mais est-ce vraiment le cas ?</>
              ) : (
                <>On paper, this format is built to reward only truly complete profiles: being
                  bad at a single event shouldn't let you place well. But is that really what
                  happens?</>
              )}
              <br /><br />
              <Link to="/analyses" className="closing-text-link">
                {lang === 'fr' ? 'La réponse est dans les chiffres' : 'The answer is in the numbers'}
                <span className="btn-pill-icon">{ARROW}</span>
              </Link>
            </p>
          </Reveal>

          <Reveal>
            <p className="about-closing-text" style={{ marginTop: 20 }}>
              {lang === 'fr' ? (
                <>Tu as déjà une idée de tes performances sur les 3 épreuves ? Simule ton
                  classement pour voir exactement où tu te situerais, et si une épreuve mérite un
                  travail prioritaire.</>
              ) : (
                <>Already have an idea of your performance on the 3 events? Simulate your ranking
                  to see exactly where you'd stand, and whether one event deserves priority
                  work.</>
              )}
              <br /><br />
              <Link to="/simulation" className="closing-text-link">
                {lang === 'fr' ? 'Simuler mon classement' : 'Simulate my ranking'}
                <span className="btn-pill-icon">{ARROW}</span>
              </Link>
            </p>
          </Reveal>
        </div>
      </section>
    </>
  )
}
