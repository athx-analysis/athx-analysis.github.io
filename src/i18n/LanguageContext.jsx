import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { DICT } from './dict'

const LanguageContext = createContext(null)
const STORAGE_KEY = 'athx_lang'

// Francais par defaut, systematiquement (demande explicite) -- l'anglais est un choix actif
// de l'utilisateur, jamais devine depuis le navigateur, pour rester previsible.
export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved === 'en' ? 'en' : 'fr'
    } catch {
      return 'fr'
    }
  })

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, lang) } catch { /* ignore */ }
    document.documentElement.lang = lang
    // Le <title>/meta description par page est gere par chaque page via usePageMeta (voir
    // src/hooks/usePageMeta.js) -- pose plus tard dans le rendu (effets enfants avant effets
    // parents), donc ne pas le faire ici sous peine de l'ecraser a chaque changement de langue.
  }, [lang])

  const value = useMemo(() => ({
    lang,
    setLang,
    toggle: () => setLang((l) => (l === 'fr' ? 'en' : 'fr')),
    // t(key) : dictionnaire court, mots/phrases repetes dans plusieurs pages (nav, unites de
    // graphiques, mots UI communs). Le contenu long et specifique a une page (paragraphes,
    // pages legales) est traduit directement dans chaque page via `lang`, pas ici.
    t: (key) => DICT[lang]?.[key] ?? DICT.fr[key] ?? key,
  }), [lang])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}
