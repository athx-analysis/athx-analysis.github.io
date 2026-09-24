import { useEffect } from 'react'

// Referencement (SEO), sans rien changer a l'affichage : chaque page appelle ce hook avec son
// propre titre/description/URL, au lieu que toutes les pages partagent le <title> et le
// meta description generiques de index.html. Google (et les autres moteurs modernes) executent
// le JS avant d'indexer une SPA, donc ces balises posees apres coup sont bien lues -- ca evite
// que Google voie "ATHX Analysis" identique sur 12 pages differentes (signal de contenu
// duplique), et ameliore le titre/snippet affiche dans les resultats de recherche page par page.
//
// `path` = fragment apres le "#" de l'URL (ex: '/simulation', '' pour l'accueil) -- coherent
// avec le HashRouter deja utilise sur tout le site.
const SITE_ORIGIN = 'https://athx-analysis.github.io'

function setMetaTag(attr, name, content) {
  if (!content) return
  let el = document.querySelector(`meta[${attr}="${name}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, name)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

export function usePageMeta({ title, description, path = '', noindex = false }) {
  useEffect(() => {
    if (title) document.title = title
    setMetaTag('name', 'description', description)
    setMetaTag('property', 'og:title', title)
    setMetaTag('property', 'og:description', description)
    setMetaTag('name', 'twitter:title', title)
    setMetaTag('name', 'twitter:description', description)

    let canonical = document.querySelector('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.setAttribute('rel', 'canonical')
      document.head.appendChild(canonical)
    }
    canonical.setAttribute('href', path ? `${SITE_ORIGIN}/#${path}` : `${SITE_ORIGIN}/`)

    // 404 et pages equivalentes : jamais indexees (contenu vide de sens pour un moteur de
    // recherche), retire la balise sur les autres pages si elle avait ete posee avant.
    let robotsTag = document.querySelector('meta[name="robots"]')
    if (noindex) {
      if (!robotsTag) {
        robotsTag = document.createElement('meta')
        robotsTag.setAttribute('name', 'robots')
        document.head.appendChild(robotsTag)
      }
      robotsTag.setAttribute('content', 'noindex')
    } else if (robotsTag) {
      robotsTag.remove()
    }
  }, [title, description, path, noindex])
}
