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
              <>Les ATHX Games partent d'une question simple : qui est l'athlète le plus complet ?
                Force, endurance et endurance de force sont testées dans une seule compétition, le
                même jour — impossible de s'y présenter avec un point faible.</>
            ) : (
              <>ATHX Games start from a simple question: who's the most complete athlete? Strength,
                endurance and strength-endurance are all tested in one competition, on the same day —
                there's nowhere to hide a weak spot.</>
            )}
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <Reveal>
            <h2 className="section-heading" style={{ marginBottom: 8 }}>
              {lang === 'fr' ? 'Format' : 'Format'}
            </h2>
            <p className="about-intro-text" style={{ marginBottom: 28 }}>
              {lang === 'fr' ? (
                <>Le format officiel exact, épreuve par épreuve — copié mot pour mot depuis{' '}
                  <a href={yearData.sourceUrl} target="_blank" rel="noreferrer">athxgames.com</a>,
                  saison par saison.</>
              ) : (
                <>The exact official format, event by event — copied word for word from{' '}
                  <a href={yearData.sourceUrl} target="_blank" rel="noreferrer">athxgames.com</a>,
                  season by season.</>
              )}
            </p>

            <div className="wof-toggle-group">
              <span className="wof-toggle-label">{lang === 'fr' ? 'Saison' : 'Season'}</span>
              {OFFICIAL_YEARS.map((y) => (
                <button key={y} className={`wof-toggle-btn${year === y ? ' active' : ''}`} onClick={() => setYear(y)}>{y}</button>
              ))}
            </div>

            <div className="wof-toggle-group">
              <span className="wof-toggle-label">{lang === 'fr' ? 'Format' : 'Format'}</span>
              <button className={`wof-toggle-btn${mode === 'individual' ? ' active' : ''}`} onClick={() => setMode('individual')}>
                {lang === 'fr' ? 'Solo' : 'Solo'}
              </button>
              <button className={`wof-toggle-btn${mode === 'pairs' ? ' active' : ''}`} onClick={() => setMode('pairs')}>
                {lang === 'fr' ? 'Team' : 'Team'}
              </button>

              <span className="wof-toggle-label">{lang === 'fr' ? 'Genre' : 'Gender'}</span>
              <button className={`wof-toggle-btn${gender === 'Male' ? ' active' : ''}`} onClick={() => setGender('Male')}>
                {lang === 'fr' ? 'Homme' : 'Men'}
              </button>
              <button className={`wof-toggle-btn${gender === 'Female' ? ' active' : ''}`} onClick={() => setGender('Female')}>
                {lang === 'fr' ? 'Femme' : 'Women'}
              </button>

              <span className="wof-toggle-label">{lang === 'fr' ? 'Catégorie' : 'Category'}</span>
              {['ATHX', 'ATHX Pro', 'LITE'].map((c) => (
                <button key={c} className={`wof-toggle-btn${category === c ? ' active' : ''}`} onClick={() => setCategory(c)}>{c}</button>
              ))}
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
                <>Format officiel, copié mot pour mot, <a href={yearData.sourceUrl} target="_blank" rel="noreferrer">source : {yearData.sourceUrl}</a>.</>
              ) : (
                <>Official format, copied word for word, <a href={yearData.sourceUrl} target="_blank" rel="noreferrer">source: {yearData.sourceUrl}</a>.</>
              )}
            </p>
          </Reveal>

          <Reveal>
            <p className="about-closing-text" style={{ marginTop: 48 }}>
              {lang === 'fr' ? (
                <>Un format qui a de quoi impressionner sur le papier. Mais est-ce que ce sport a
                  vraiment le vent en poupe, et jusqu'où peut-il aller ? C'est très exactement ce que
                  les chiffres — participation, calendrier, portée internationale — racontent déjà.</>
              ) : (
                <>A format that's impressive enough on paper. But is this sport really on the rise,
                  and how far can it go? That's exactly what the numbers — participation, calendar,
                  international reach — already tell us.</>
              )}
              <br /><br />
              <Link to="/le-sport" className="closing-text-link">
                {lang === 'fr' ? 'Découvrir le sport et sa croissance' : 'Discover the sport and its growth'}
                <span className="btn-pill-icon">{ARROW}</span>
              </Link>
            </p>
          </Reveal>
        </div>
      </section>
    </>
  )
}
