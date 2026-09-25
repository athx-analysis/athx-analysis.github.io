import { useEffect, useRef, useState } from 'react'

// Fait "apparaitre" la carte ATHX Score au scroll avec un petit effet façon ouverture de pack
// FIFA (demande explicite) : la carte pop (echelle + fondu) pendant qu'une volée d'étincelles
// orange/jaune (couleurs de la DA du site, cf. --accent/--accent-2 et le jaune complémentaire)
// eclate depuis son centre. Rejoue a chaque fois que la carte re-rentre dans le viewport (meme
// logique que Reveal.jsx) -- `burstKey` change a chaque entree, ce qui force React a
// remonter .athx-spark-field a neuf pour que l'animation CSS reparte proprement de zero.
export default function AthxScoreReveal({ children }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  const [burstKey, setBurstKey] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          setBurstKey((k) => k + 1)
        } else {
          setVisible(false)
        }
      },
      { threshold: 0.35, rootMargin: '0px 0px -10% 0px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const SPARK_COUNT = 16
  const sparks = Array.from({ length: SPARK_COUNT }, (_, i) => i)

  return (
    <div ref={ref} className={`athx-score-reveal${visible ? ' visible' : ''}`}>
      {children}
      {visible && (
        <div className="athx-spark-field" key={burstKey} aria-hidden="true">
          {sparks.map((i) => (
            <span
              key={i}
              className={`athx-spark ${i % 2 === 0 ? 'athx-spark-a' : 'athx-spark-b'}`}
              style={{ '--angle': `${(360 / SPARK_COUNT) * i}deg`, '--delay': `${(i % 6) * 35}ms` }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
