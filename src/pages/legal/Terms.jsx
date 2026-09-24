import { Link } from 'react-router-dom'
import LegalPage from '../../components/LegalPage'
import { useLanguage } from '../../i18n/LanguageContext'

export default function Terms() {
  const { lang } = useLanguage()
  return (
    <LegalPage
      title={lang === 'fr' ? "Conditions générales d'utilisation" : 'Terms of Use'}
      updated={lang === 'fr' ? '21 septembre 2026' : 'September 21, 2026'}
      path="/terms"
      description={lang === 'fr' ? "Conditions générales d'utilisation du site ATHX Analysis." : 'Terms of use for the ATHX Analysis website.'}
    >
      {lang === 'fr' ? (
        <>
          <p className="legal-intro">
            En utilisant ATHX Analysis, vous acceptez les conditions ci-dessous.
          </p>

          <h2>1. Objet du site</h2>
          <p>
            ATHX Analysis est un site indépendant d'analyse statistique des résultats de la
            compétition ATHX Games. Il propose des classements, un simulateur de performance et des
            analyses de données, construits à partir de résultats réels rendus publics par ATHX
            Games. <strong>Ce site n'est ni édité, ni exploité, ni approuvé par ATHX Games</strong>,
            toute ressemblance de nom ou de sujet ne constitue pas une affiliation.
          </p>

          <h2>2. Usage du site</h2>
          <p>
            Le site est fourni gratuitement, à titre informatif. Vous pouvez le consulter librement.
            Vous vous engagez à ne pas tenter d'en extraire massivement le contenu, de perturber son
            fonctionnement, ou de l'utiliser à des fins illégales.
          </p>

          <h2>3. Exactitude des données et des simulations</h2>
          <p>
            Les classements affichés sont construits à partir de données scrapées sur le site
            officiel ATHX Games ; des erreurs de scraping, de synchronisation ou de mise à jour sont
            possibles. Le simulateur de performance est un outil statistique indicatif (comparaison
            directe de vos estimations aux résultats réels d'une saison) : il ne garantit aucun
            résultat et ne remplace pas un classement officiel. Utilisez ces informations à titre
            indicatif uniquement.
          </p>

          <h2>4. Propriété intellectuelle</h2>
          <p>
            Le code source, la mise en page et les analyses originales de ce site sont la propriété
            de son éditeur. Les données de résultats sportifs sous-jacentes proviennent d'ATHX Games
            (athxgames.com) et restent soumises aux droits de leur producteur ; ce site les réutilise
            à des fins d'analyse non commerciale, avec mention systématique de la source.
          </p>

          <h2>5. Responsabilité</h2>
          <p>
            Le site est fourni "en l'état", sans garantie d'exactitude, de disponibilité ou
            d'exhaustivité. L'éditeur ne saurait être tenu responsable d'un usage des informations
            du site (notamment du simulateur) qui aurait des conséquences pour l'utilisateur.
          </p>

          <h2>6. Droit de retrait pour les athlètes</h2>
          <p>
            Si vous êtes un athlète référencé sur ce site et que vous souhaitez que vos résultats en
            soient retirés, voir la page <Link to="/contact">Contact</Link>.
          </p>

          <h2>7. Contact</h2>
          <p>
            Pour toute question sur ces conditions : <a href="mailto:axelcarot@gmail.com">axelcarot@gmail.com</a>.
          </p>
        </>
      ) : (
        <>
          <p className="legal-intro">
            By using ATHX Analysis, you accept the terms below.
          </p>

          <h2>1. Purpose of the site</h2>
          <p>
            ATHX Analysis is an independent site providing statistical analysis of ATHX Games
            competition results. It offers leaderboards, a performance simulator and data
            analyses, built from real results made public by ATHX Games.{' '}
            <strong>This site is neither published, operated, nor endorsed by ATHX Games</strong>;
            any resemblance in name or subject does not constitute affiliation.
          </p>

          <h2>2. Use of the site</h2>
          <p>
            The site is provided free of charge, for informational purposes. You may browse it
            freely. You agree not to attempt to bulk-extract its content, disrupt its operation,
            or use it for unlawful purposes.
          </p>

          <h2>3. Accuracy of data and simulations</h2>
          <p>
            The leaderboards shown are built from data scraped on the official ATHX Games
            website; scraping, syncing or update errors are possible. The performance simulator
            is an indicative statistical tool (a direct comparison of your estimates to a
            season's real results): it guarantees no result and doesn't replace an official
            ranking. Use this information for guidance only.
          </p>

          <h2>4. Intellectual property</h2>
          <p>
            The source code, layout and original analyses of this site are the property of its
            publisher. The underlying sports results data comes from ATHX Games (athxgames.com)
            and remains subject to its producer's rights; this site reuses it for non-commercial
            analysis purposes, with the source systematically credited.
          </p>

          <h2>5. Liability</h2>
          <p>
            The site is provided "as is", without warranty of accuracy, availability or
            completeness. The publisher cannot be held liable for any use of the site's
            information (including the simulator) that has consequences for the user.
          </p>

          <h2>6. Right of withdrawal for athletes</h2>
          <p>
            If you're an athlete referenced on this site and would like your results removed,
            see the <Link to="/contact">Contact</Link> page.
          </p>

          <h2>7. Contact</h2>
          <p>
            For any question about these terms: <a href="mailto:axelcarot@gmail.com">axelcarot@gmail.com</a>.
          </p>
        </>
      )}
    </LegalPage>
  )
}
