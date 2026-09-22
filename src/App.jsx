import { HashRouter, Routes, Route, Link } from 'react-router-dom'
import Header from './components/Header'
import ScrollToTop from './components/ScrollToTop'
import Home from './pages/Home'
import Sport from './pages/Sport'
import Leaderboard from './pages/Leaderboard'
import Simulation from './pages/Simulation'
import Analyses from './pages/Analyses'
import NotFound from './pages/NotFound'
import PrivacyPolicy from './pages/legal/PrivacyPolicy'
import Terms from './pages/legal/Terms'
import CookiePolicy from './pages/legal/CookiePolicy'
import LegalNotice from './pages/legal/LegalNotice'
import Contact from './pages/legal/Contact'
import { useLanguage } from './i18n/LanguageContext'

export default function App() {
  const { t } = useLanguage()
  return (
    <HashRouter>
      <ScrollToTop />
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/le-sport" element={<Sport />} />
          <Route path="/simulation" element={<Simulation />} />
          <Route path="/analyses" element={<Analyses />} />
          <Route path="/individual-leaderboards" element={<Leaderboard lbKey="individual" />} />
          <Route path="/team-leaderboards" element={<Leaderboard lbKey="team" />} />
          <Route path="/team-individual-leaderboards" element={<Leaderboard lbKey="team_individual" />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/cookie-policy" element={<CookiePolicy />} />
          <Route path="/legal-notice" element={<LegalNotice />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <footer className="site-footer">
        <div className="container footer-inner">
          <p>{t('footer_disclaimer')}</p>
          <nav className="footer-links">
            <Link to="/contact">{t('footer_contact')}</Link>
            <Link to="/privacy-policy">{t('footer_privacy')}</Link>
            <Link to="/terms">{t('footer_terms')}</Link>
            <Link to="/cookie-policy">{t('footer_cookies')}</Link>
            <Link to="/legal-notice">{t('footer_legal')}</Link>
          </nav>
        </div>
      </footer>
    </HashRouter>
  )
}
