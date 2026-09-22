import { Link } from 'react-router-dom'
import { useLanguage } from '../i18n/LanguageContext'

export default function NotFound() {
  const { lang } = useLanguage()
  return (
    <section className="hero" style={{ minHeight: '50vh', display: 'flex', alignItems: 'center' }}>
      <div className="container">
        <p className="section-title" style={{ color: '#ff8a7d' }}>404</p>
        <h1>{lang === 'fr' ? "Cette page n'existe pas" : "This page doesn't exist"}</h1>
        <p>{lang === 'fr' ? "L'URL demandée ne correspond à aucune page du site." : "The requested URL doesn't match any page on this site."}</p>
        <div className="hero-actions">
          <Link to="/" className="btn-pill">
            {lang === 'fr' ? "Retour à l'accueil" : 'Back to home'}
            <span className="btn-pill-icon">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 11L11 3M11 3H4M11 3V10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </span>
          </Link>
        </div>
      </div>
    </section>
  )
}
