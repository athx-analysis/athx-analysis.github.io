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
            <h2 className="hook-section-title">
              {lang === 'fr' ? '3 questions, 3 réponses.' : '3 questions, 3 answers.'}
            </h2>
            <p className="hook-section-sub">
              {lang === 'fr'
                ? 'Chacune trouve sa réponse sur une page différente du site.'
                : 'Each one gets answered on a different page of this site.'}
            </p>
            <div className="hook-cards">
              <Link to="/simulation" className="hook-card">
                <span className="hook-card-num">01</span>
                <span className="hook-card-eyebrow">{lang === 'fr' ? 'Simulation' : 'Simulation'}</span>
                <h3 className="hook-card-title">{lang === 'fr' ? 'Où te situerais-tu ?' : 'Where would you rank?'}</h3>
                <p className="hook-card-body">
                  {lang === 'fr' ? (
                    <>Tu hésites à t'inscrire à un ATHX ? Découvre exactement où tu te classerais
                      face aux vrais résultats de la saison, ton point fort, ton point faible, et
                      l'épreuve sur laquelle progresser en priorité.</>
                  ) : (
                    <>On the fence about signing up for an ATHX? Find out exactly where you'd rank
                      against this season's real results, your strength, your weakness, and which
                      event to prioritize.</>
                  )}
                </p>
                <span className="hook-card-cta">
                  {lang === 'fr' ? 'Simuler mon classement' : 'Simulate my ranking'}
                  <span className="btn-pill-icon">{ARROW}</span>
                </span>
              </Link>

              <Link to="/analyses" className="hook-card">
                <span className="hook-card-num">02</span>
                <span className="hook-card-eyebrow">{lang === 'fr' ? 'Analyses' : 'Analyses'}</span>
                <h3 className="hook-card-title">{lang === 'fr' ? 'Faut-il être bon partout ?' : 'Do you need to be good at everything?'}</h3>
                <p className="hook-card-body">
                  {lang === 'fr' ? (
                    <>Un point faible peut-il vraiment être compensé par deux points forts ? Existe-t-il
                      un profil type chez les meilleurs ? Et à partir de quel niveau progresser encore
                      ne rapporte (presque) plus rien ?</>
                  ) : (
                    <>Can a weak spot really be offset by two strengths? Is there a typical profile
                      among the best? And past what level does getting even better stop paying off?</>
                  )}
                </p>
                <span className="hook-card-cta">
                  {lang === 'fr' ? 'Voir ce que les données montrent' : 'See what the data shows'}
                  <span className="btn-pill-icon">{ARROW}</span>
                </span>
              </Link>

              <Link to="/le-sport" className="hook-card">
                <span className="hook-card-num">03</span>
                <span className="hook-card-eyebrow">{lang === 'fr' ? 'Le Sport' : 'The Sport'}</span>
                <h3 className="hook-card-title">{lang === 'fr' ? 'Un sport d\'avenir ?' : 'A sport with a future?'}</h3>
                <p className="hook-card-body">
                  {lang === 'fr' ? (
                    <>Ce jeune circuit a-t-il vraiment le vent en poupe, ou juste l'air d'y être ?
                      Peut-il un jour rivaliser avec HYROX ? Et les athlètes reviennent-ils
                      vraiment, saison après saison ?</>
                  ) : (
                    <>Is this young circuit really on the rise, or does it just look that way? Could
                      it one day rival HYROX? And do athletes actually come back, season after
                      season?</>
                  )}
                </p>
                <span className="hook-card-cta">
                  {lang === 'fr' ? 'Découvrir la croissance ATHX' : "Discover ATHX's growth"}
                  <span className="btn-pill-icon">{ARROW}</span>
                </span>
              </Link>
            </div>
          </Reveal>

          <Reveal>
            <h2 className="wof-page-title" style={{ marginTop: 64 }}>
              {lang === 'fr' ? 'Déroulement de la compétition' : 'How the Competition Works'}
            </h2>

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
              <WorkoutFormatCard zone={yearData.zones.endurance} mode={mode} gender={gender} categoryTag={categoryTag} />
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
        </div>
      </section>
    </>
  )
}
