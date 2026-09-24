import AthxLogo from './AthxLogo'
import { useLanguage } from '../i18n/LanguageContext'
import { usePageMeta } from '../hooks/usePageMeta'

// Mise en page commune aux pages legales (confidentialite, CGU, cookies, mentions legales,
// contact) -- prose simple, coherente avec la DA du site (meme bande standardisee : logo +
// titre, meme container). `title`/`updated` sont deja fournis traduits par la page appelante.
// `path`/`description` alimentent usePageMeta (SEO) ici plutot que dans chaque page legale --
// centralise, ces pages n'ayant rien de specifique a faire varier par ailleurs.
export default function LegalPage({ title, updated, path, description, children }) {
  const { lang } = useLanguage()
  usePageMeta({ path, title: `${title} | ATHX Analysis`, description })
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
