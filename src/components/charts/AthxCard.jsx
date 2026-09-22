import { useLanguage } from '../../i18n/LanguageContext'

// Carte "profil" façon carte de joueur (FIFA/Ultimate Team) : pas de photo (utilisateur
// anonyme), mais une note globale + 3 notes par épreuve, mise en scène pour être un peu
// stylée/partageable plutôt qu'un simple radar. "ATHX SCORE" reste en anglais dans les deux
// langues (element de marque, comme "RESULTS"/"ANALYSIS" dans le header).
export default function AthxCard({ scores, division, category }) {
  const { t } = useLanguage()
  const STATS = [
    { key: 'strength', name: t('discipline_force') },
    { key: 'endurance', name: t('discipline_endurance') },
    { key: 'metcon', name: t('discipline_metcon') },
  ]
  const overall = Math.round((scores.strength + scores.endurance + scores.metcon) / 3)
  return (
    <div className="athx-card">
      <div className="athx-card-glow" />
      <div className="athx-card-head">
        <div className="athx-card-overall">{overall}</div>
        <div className="athx-card-meta">
          <span className="athx-card-tag">ATHX SCORE</span>
          <span className="athx-card-division">{division} · {category}</span>
        </div>
      </div>
      <div className="athx-card-stats">
        {STATS.map((s) => (
          <div key={s.key} className="athx-card-stat">
            <div className="athx-card-stat-top">
              <span className="athx-card-stat-label">{s.name}</span>
              <span className="athx-card-stat-value">{scores[s.key]}</span>
            </div>
            <div className="athx-card-bar">
              <div className="athx-card-bar-fill" style={{ width: `${Math.max(2, Math.min(100, scores[s.key]))}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
