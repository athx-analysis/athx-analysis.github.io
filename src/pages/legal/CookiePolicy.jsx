import LegalPage from '../../components/LegalPage'
import { useLanguage } from '../../i18n/LanguageContext'

export default function CookiePolicy() {
  const { lang } = useLanguage()
  return (
    <LegalPage
      title={lang === 'fr' ? 'Politique de cookies' : 'Cookie Policy'}
      updated={lang === 'fr' ? '21 septembre 2026' : 'September 21, 2026'}
      path="/cookie-policy"
      description={lang === 'fr' ? 'Politique de cookies et de mesure d’audience du site ATHX Analysis.' : "ATHX Analysis' cookie and analytics policy."}
    >
      {lang === 'fr' ? (
        <>
          <p className="legal-intro">
            <strong>Ce site n'utilise aucun cookie.</strong> Aucun cookie de publicité, de réseau
            social ou de préférence n'est déposé. La mesure d'audience utilisée (voir ci-dessous)
            ne dépose pas non plus de cookie.
          </p>

          <h2>Qu'est-ce qu'un cookie ?</h2>
          <p>
            Un cookie est un petit fichier déposé par un site dans votre navigateur pour se souvenir
            d'informations d'une visite à l'autre (préférences, identifiant de session, suivi
            publicitaire...).
          </p>

          <h2>Ce que le site utilise réellement</h2>
          <p>
            ATHX Analysis est un site 100% statique. Certaines pages (comme le simulateur de
            performance) peuvent, à l'avenir, utiliser le <code>localStorage</code> de votre
            navigateur pour retenir une préférence d'affichage, une technologie proche des cookies
            dans son principe, mais qui reste strictement locale à votre appareil : cette donnée
            n'est jamais envoyée à un serveur, n'importe où. Elle ne nécessite pas de consentement
            au sens de la réglementation cookies (elle n'est pas transmise, ne sert ni au suivi ni à
            la mesure d'audience).
          </p>

          <h2>Mesure d'audience</h2>
          <p>
            Le site utilise Cloudflare Web Analytics pour compter les visites de façon globale et
            anonyme (nombre de pages vues, pays approximatif, appareil). Cet outil ne dépose aucun
            cookie, ne crée pas d'identifiant unique par visiteur et ne permet pas de vous
            reconnaître d'une visite à l'autre : c'est pour cette raison qu'aucun bandeau de
            consentement n'est nécessaire. Si un outil nécessitant un cookie de suivi était utilisé
            un jour à la place, cette page serait mise à jour et un bandeau de consentement clair
            (avec un vrai choix "refuser" aussi simple qu'"accepter") serait affiché avant tout
            dépôt, conformément à la réglementation ePrivacy et aux recommandations de la CNIL.
          </p>

          <h2>Contact</h2>
          <p>
            Pour toute question : <a href="mailto:axelcarot@gmail.com">axelcarot@gmail.com</a>.
          </p>
        </>
      ) : (
        <>
          <p className="legal-intro">
            <strong>This site does not use any cookies.</strong> No advertising, social network or
            preference cookie is set. The audience measurement tool used (see below) doesn't set
            a cookie either.
          </p>

          <h2>What is a cookie?</h2>
          <p>
            A cookie is a small file set by a site in your browser to remember information from
            one visit to the next (preferences, session identifier, ad tracking...).
          </p>

          <h2>What the site actually uses</h2>
          <p>
            ATHX Analysis is a 100% static site. Some pages (like the performance simulator) may,
            in the future, use your browser's <code>localStorage</code> to remember a display
            preference — a technology similar to cookies in principle, but which stays strictly
            local to your device: this data is never sent to a server, anywhere. It doesn't
            require consent under cookie regulations (it isn't transmitted, and serves neither
            tracking nor audience measurement).
          </p>

          <h2>Audience measurement</h2>
          <p>
            The site uses Cloudflare Web Analytics to count visits in an aggregate, anonymous way
            (number of page views, approximate country, device). This tool sets no cookie,
            creates no unique per-visitor identifier, and doesn't let you be recognized from one
            visit to the next: that's why no consent banner is required. If a tool requiring a
            tracking cookie were used instead in the future, this page would be updated and a
            clear consent banner (with a genuine "refuse" option as easy as "accept") would be
            shown before any such cookie is set, in line with the ePrivacy regulation and CNIL
            guidance.
          </p>

          <h2>Contact</h2>
          <p>
            For any question: <a href="mailto:axelcarot@gmail.com">axelcarot@gmail.com</a>.
          </p>
        </>
      )}
    </LegalPage>
  )
}
