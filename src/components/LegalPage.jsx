import AthxLogo from './AthxLogo'
import { useLanguage } from '../i18n/LanguageContext'

// Mise en page commune aux pages legales (confidentialite, CGU, cookies, mentions legales,
// contact) -- prose simple, coherente avec la DA du site (meme bande standardisee : logo +
// titre, meme container). `title`/`updated` sont deja fournis traduits par la page appelante.
export default function LegalPage({ title, updated, children }) {
  const { lang } = useLanguage()
  return (
    <div className="legal-page">
      <section className="hero legal-hero">
        <div className="container">
          <AthxLogo color="#ffffff" className="hero-logo" />
          <h1>{title}</h1>
          {updated && <p className="legal-updated">{lang === 'fr' ? 'Dernière mise à jour' : 'Last updated'} : {updated}</p>}
        </div>
      </section>
      <section className="section">
        <div className="container legal-content">
          {children}
        </div>
      </section>
    </div>
  )
}
