import LegalPage from '../../components/LegalPage'
import { useLanguage } from '../../i18n/LanguageContext'

export default function Contact() {
  const { lang } = useLanguage()
  return (
    <LegalPage
      title="Contact"
      path="/contact"
      description={lang === 'fr' ? 'Contactez ATHX Analysis, notamment pour une demande de retrait de données.' : 'Contact ATHX Analysis, including for a data removal request.'}
    >
      {lang === 'fr' ? (
        <>
          <p className="legal-intro">
            Une question, un bug, une demande de retrait de vos données si vous êtes un athlète
            référencé sur ce site, ou juste envie d'échanger sur le projet, n'hésitez pas.
          </p>

          <h2>Email</h2>
          <p>
            <a href="mailto:axelcarot@gmail.com">axelcarot@gmail.com</a>
          </p>

          <h2>Instagram</h2>
          <p>
            <a href="https://instagram.com/axelcarot" target="_blank" rel="noreferrer">@axelcarot</a>
          </p>

          <h2>Vous êtes un athlète et voulez être retiré du site ?</h2>
          <p>
            Écrivez à l'adresse ci-dessus en précisant votre nom complet et, si possible, le ou les
            événements concernés, la demande sera traitée rapidement.
          </p>
        </>
      ) : (
        <>
          <p className="legal-intro">
            A question, a bug, a request to remove your data if you're an athlete referenced on
            this site, or just want to chat about the project — don't hesitate.
          </p>

          <h2>Email</h2>
          <p>
            <a href="mailto:axelcarot@gmail.com">axelcarot@gmail.com</a>
          </p>

          <h2>Instagram</h2>
          <p>
            <a href="https://instagram.com/axelcarot" target="_blank" rel="noreferrer">@axelcarot</a>
          </p>

          <h2>Are you an athlete and want to be removed from the site?</h2>
          <p>
            Write to the address above with your full name and, if possible, the event(s)
            concerned — the request will be handled promptly.
          </p>
        </>
      )}
    </LegalPage>
  )
}
