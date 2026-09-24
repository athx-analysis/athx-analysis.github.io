import { Link } from 'react-router-dom'
import LegalPage from '../../components/LegalPage'
import { useLanguage } from '../../i18n/LanguageContext'

export default function LegalNotice() {
  const { lang } = useLanguage()
  return (
    <LegalPage
      title={lang === 'fr' ? 'Mentions légales' : 'Legal Notice'}
      updated={lang === 'fr' ? '21 septembre 2026' : 'September 21, 2026'}
      path="/legal-notice"
      description={lang === 'fr' ? "Mentions légales du site ATHX Analysis." : 'Legal notice for the ATHX Analysis website.'}
    >
      {lang === 'fr' ? (
        <>
          <h2>Éditeur du site</h2>
          <p>
            Site édité à titre personnel, non professionnel, par un particulier.
            <br />
            Contact : <a href="mailto:axelcarot@gmail.com">axelcarot@gmail.com</a>
            <br />
            Instagram : <a href="https://instagram.com/axelcarot" target="_blank" rel="noreferrer">@axelcarot</a>
          </p>

          <h2>Directeur de la publication</h2>
          <p>L'éditeur du site, joignable à l'adresse ci-dessus.</p>

          <h2>Hébergement</h2>
          <p>
            <em>À compléter une fois le site mis en ligne</em>, nom, adresse et contact de
            l'hébergeur choisi (ex. Netlify, Vercel, Cloudflare Pages...). Cette section est
            obligatoire en droit français dès la mise en ligne publique et doit être renseignée
            avant l'ouverture au public.
          </p>

          <h2>Propriété intellectuelle</h2>
          <p>
            Le code source et la mise en page de ce site sont la propriété de son éditeur. Les
            données de résultats sportifs affichées proviennent d'ATHX Games (athxgames.com),
            réutilisées à des fins d'analyse non commerciale avec mention systématique de la
            source. Le nom et le logo "ATHX" sont des marques appartenant à leurs titulaires
            respectifs, ce site n'est ni affilié, ni approuvé, ni sponsorisé par ATHX Games.
          </p>

          <h2>Données personnelles</h2>
          <p>
            Voir la <Link to="/privacy-policy">politique de confidentialité</Link> pour le détail des
            données traitées et vos droits.
          </p>
        </>
      ) : (
        <>
          <h2>Site publisher</h2>
          <p>
            Site published in a personal, non-professional capacity, by an individual.
            <br />
            Contact: <a href="mailto:axelcarot@gmail.com">axelcarot@gmail.com</a>
            <br />
            Instagram: <a href="https://instagram.com/axelcarot" target="_blank" rel="noreferrer">@axelcarot</a>
          </p>

          <h2>Publication director</h2>
          <p>The site's publisher, reachable at the address above.</p>

          <h2>Hosting</h2>
          <p>
            <em>To be completed once the site goes live</em>, with the name, address and contact
            of the chosen host (e.g. Netlify, Vercel, Cloudflare Pages...). This section is
            required under French law as soon as the site is publicly available and must be
            filled in before public launch.
          </p>

          <h2>Intellectual property</h2>
          <p>
            The source code and layout of this site are the property of its publisher. The sports
            results data displayed comes from ATHX Games (athxgames.com), reused for
            non-commercial analysis purposes with the source systematically credited. The name
            and logo "ATHX" are trademarks belonging to their respective owners; this site is
            neither affiliated with, endorsed by, nor sponsored by ATHX Games.
          </p>

          <h2>Personal data</h2>
          <p>
            See the <Link to="/privacy-policy">privacy policy</Link> for details on the data
            processed and your rights.
          </p>
        </>
      )}
    </LegalPage>
  )
}
