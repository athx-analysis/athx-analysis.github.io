import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import AthxLogo from './AthxLogo'
import { LEADERBOARDS } from '../lib/dataSource'
import { useLanguage } from '../i18n/LanguageContext'

const ROUTE_BY_KEY = {
  individual: '/individual-leaderboards',
  team: '/team-leaderboards',
  team_individual: '/team-individual-leaderboards',
}

const SUBTITLE_KEY_BY_KEY = {
  individual: 'lb_individual_sub',
  team: 'lb_team_sub',
  team_individual: 'lb_team_individual_sub',
}

export default function Header() {
  const [open, setOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const ref = useRef(null)
  const location = useLocation()
  const { lang, toggle, t } = useLanguage()

  useEffect(() => {
    function onClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  // Ferme le menu mobile a chaque changement de page (sinon il reste ouvert par-dessus
  // la nouvelle page apres un clic sur un lien).
  useEffect(() => { setMobileOpen(false); setOpen(false) }, [location.pathname])

  return (
    <header className="site-header">
      <div className="container site-header-inner">
        <Link to="/" className="brand">
          <AthxLogo color="#0a0a0a" className="brand-logo" />
          <span className="brand-name">Analysis</span>
        </Link>

        <div className="site-header-right">
          <button
            className={`nav-burger${mobileOpen ? ' open' : ''}`}
            aria-label={mobileOpen ? (lang === 'fr' ? 'Fermer le menu' : 'Close menu') : (lang === 'fr' ? 'Ouvrir le menu' : 'Open menu')}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
          >
            <span /><span /><span />
          </button>

          <nav className={`nav${mobileOpen ? ' nav-mobile-open' : ''}`}>
            <Link to="/" className="nav-link">{t('nav_home')}</Link>
            <Link to="/le-sport" className="nav-link">{t('nav_sport')}</Link>
            <Link to="/analyses" className="nav-link">{t('nav_analyses')}</Link>
            <Link to="/simulation" className="nav-link">{t('nav_simulation')}</Link>

            <div className={`nav-dropdown${open ? ' open' : ''}`} ref={ref}>
              <button className="nav-dropdown-trigger" onClick={() => setOpen((v) => !v)}>
                {t('nav_results')}
                <svg className="nav-dropdown-caret" width="10" height="6" viewBox="0 0 10 6" fill="none">
                  <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {open && (
                <div className="nav-dropdown-menu">
                  {LEADERBOARDS.map((lb) => (
                    <Link
                      key={lb.key}
                      to={ROUTE_BY_KEY[lb.key]}
                      className="nav-dropdown-item"
                      onClick={() => setOpen(false)}
                    >
                      {lb.label}
                      <span className="item-sub">{t(SUBTITLE_KEY_BY_KEY[lb.key])}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </nav>

          {/* Tout a droite du header, apres Resultats -- demande explicite. Drapeaux plutot que
              "FR/EN" : meme principe de bascule (les deux visibles, celui actif surligne). */}
          <button
            className="lang-toggle"
            onClick={toggle}
            aria-label={t('lang_toggle_aria')}
            title={t('lang_toggle_aria')}
          >
            <span className={lang === 'fr' ? 'lang-toggle-active' : ''} aria-hidden="true">🇫🇷</span>
            <span className={lang === 'en' ? 'lang-toggle-active' : ''} aria-hidden="true">🇬🇧</span>
          </button>
        </div>
      </div>
    </header>
  )
}
