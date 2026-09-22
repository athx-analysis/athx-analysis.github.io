import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

// React Router ne remet pas le scroll en haut de page tout seul lors d'une navigation --
// sans ca, un lien clique depuis le bas d'une page (ex: le bouton de fin de la Home) atterrit
// au milieu de la page suivante, a la meme position de scroll que la page precedente.
export default function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}
