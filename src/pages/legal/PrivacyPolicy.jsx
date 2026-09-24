import { Link } from 'react-router-dom'
import LegalPage from '../../components/LegalPage'
import { useLanguage } from '../../i18n/LanguageContext'

export default function PrivacyPolicy() {
  const { lang } = useLanguage()
  return (
    <LegalPage
      title={lang === 'fr' ? 'Politique de confidentialité' : 'Privacy Policy'}
      updated={lang === 'fr' ? '21 septembre 2026' : 'September 21, 2026'}
      path="/privacy-policy"
      description={lang === 'fr' ? "Politique de confidentialité du site ATHX Analysis." : 'Privacy policy for the ATHX Analysis website.'}
    >
      {lang === 'fr' ? (
        <>
          <p className="legal-intro">
            ATHX Analysis est un site d'analyse statistique indépendant, non affilié à ATHX Games.
            Cette page explique quelles données sont traitées sur ce site, pourquoi, et comment
            exercer vos droits.
          </p>

          <h2>1. Qui traite les données ?</h2>
          <p>
            Ce site est édité par un particulier (voir les <Link to="/legal-notice">mentions
            légales</Link>). Pour toute question sur cette politique ou pour exercer vos droits,
            contactez : <a href="mailto:axelcarot@gmail.com">axelcarot@gmail.com</a>.
          </p>

          <h2>2. Données concernant les visiteurs du site</h2>
          <p>
            Le site est 100% statique : il n'y a ni compte utilisateur, ni base de données, ni
            serveur applicatif. Concrètement :
          </p>
          <ul>
            <li>Aucun cookie n'est déposé et aucun outil de suivi publicitaire ou de réseau social n'est utilisé.</li>
            <li>Le site utilise Cloudflare Web Analytics pour compter les visites de façon globale et anonyme (pages vues, pays approximatif, appareil) : cet outil ne dépose pas de cookie et ne crée aucun identifiant permettant de vous reconnaître d'une visite à l'autre. Détail complet sur la <Link to="/cookie-policy">page cookies</Link>.</li>
            <li>La page Simulation calcule votre classement simulé entièrement dans votre navigateur : les valeurs que vous saisissez ne sont jamais envoyées, stockées ni transmises où que ce soit.</li>
            <li>Seuls les journaux techniques standards de l'hébergeur (adresse IP, navigateur, date de la requête) sont générés, traités par l'hébergeur lui-même dans le cadre de son propre fonctionnement, pas par ce site.</li>
          </ul>

          <h2>3. Données concernant les athlètes ATHX affichées sur le site</h2>
          <p>
            Ce site republie, à des fins d'analyse statistique et sportive, des données de
            classement rendues publiques par ATHX Games sur son site officiel
            (athxgames.com) : nom, nationalité, salle de sport, performances et classements.
            Il s'agit d'un traitement de données personnelles au sens du RGPD, distinct de celui
            opéré par ATHX Games.
          </p>
          <ul>
            <li><strong>Finalité</strong> : analyse statistique et sportive à but non commercial (classements, simulateur de performance, mise en perspective des résultats).</li>
            <li><strong>Base légale</strong> : intérêt légitime, données déjà rendues publiques par l'organisateur, réutilisées dans une finalité d'analyse sportive, sans profilage commercial.</li>
            <li><strong>Durée de conservation</strong> : le temps que les données restent pertinentes pour l'analyse (mises à jour au fil des saisons ATHX).</li>
          </ul>

          <h2>4. Vos droits</h2>
          <p>
            Si vous êtes un athlète dont les résultats apparaissent sur ce site et que vous
            souhaitez exercer vos droits d'accès, de rectification, d'opposition ou de suppression,
            contactez <a href="mailto:axelcarot@gmail.com">axelcarot@gmail.com</a>, votre demande
            sera traitée dans les meilleurs délais. Vous pouvez également introduire une réclamation
            auprès de la CNIL (cnil.fr) ou de l'autorité de protection des données de votre pays.
          </p>

          <h2>5. Sous-traitants et transferts</h2>
          <p>
            Aucune donnée n'est transmise à un tiers. Les seuls services externes chargés par le
            site sont des polices de caractères (Google Fonts). Leur chargement peut, selon votre
            navigateur, entraîner une requête technique vers les serveurs Google.
          </p>

          <h2>6. Modifications</h2>
          <p>
            Cette politique peut évoluer, notamment si un outil de mesure d'audience est ajouté. La
            date de mise à jour en haut de page reflète la dernière version.
          </p>
        </>
      ) : (
        <>
          <p className="legal-intro">
            ATHX Analysis is an independent statistical analysis site, not affiliated with ATHX
            Games. This page explains what data is processed on this site, why, and how to
            exercise your rights.
          </p>

          <h2>1. Who processes the data?</h2>
          <p>
            This site is published by an individual (see the <Link to="/legal-notice">legal
            notice</Link>). For any question about this policy or to exercise your rights,
            contact: <a href="mailto:axelcarot@gmail.com">axelcarot@gmail.com</a>.
          </p>

          <h2>2. Data about site visitors</h2>
          <p>
            The site is 100% static: there's no user account, no database, no application
            server. Concretely:
          </p>
          <ul>
            <li>No cookie is set and no advertising or social network tracking tool is used.</li>
            <li>The site uses Cloudflare Web Analytics to count visits in an aggregate, anonymous way (page views, approximate country, device): this tool sets no cookie and creates no identifier that would let you be recognized from one visit to the next. Full detail on the <Link to="/cookie-policy">cookie page</Link>.</li>
            <li>The Simulation page computes your simulated ranking entirely inside your browser: the values you enter are never sent, stored, or transmitted anywhere.</li>
            <li>Only the host's standard technical logs (IP address, browser, request date) are generated, processed by the host itself as part of its own operation, not by this site.</li>
          </ul>

          <h2>3. Data about ATHX athletes shown on the site</h2>
          <p>
            For statistical and sports analysis purposes, this site republishes ranking data made
            public by ATHX Games on its official website (athxgames.com): name, nationality, gym,
            performances and rankings. This constitutes personal data processing under GDPR,
            distinct from that carried out by ATHX Games.
          </p>
          <ul>
            <li><strong>Purpose</strong>: statistical and sports analysis for non-commercial purposes (leaderboards, performance simulator, putting results in perspective).</li>
            <li><strong>Legal basis</strong>: legitimate interest, data already made public by the organizer, reused for sports-analysis purposes, with no commercial profiling.</li>
            <li><strong>Retention period</strong>: for as long as the data remains relevant to the analysis (updated over the course of ATHX seasons).</li>
          </ul>

          <h2>4. Your rights</h2>
          <p>
            If you're an athlete whose results appear on this site and would like to exercise
            your rights of access, rectification, objection or erasure, contact{' '}
            <a href="mailto:axelcarot@gmail.com">axelcarot@gmail.com</a> — your request will be
            handled as promptly as possible. You may also file a complaint with the CNIL
            (cnil.fr) or your country's data protection authority.
          </p>

          <h2>5. Processors and transfers</h2>
          <p>
            No data is transmitted to a third party. The only external services loaded by the
            site are fonts (Google Fonts). Loading them may, depending on your browser, trigger a
            technical request to Google's servers.
          </p>

          <h2>6. Changes</h2>
          <p>
            This policy may evolve, in particular if an audience measurement tool is added. The
            update date at the top of the page reflects the latest version.
          </p>
        </>
      )}
    </LegalPage>
  )
}
