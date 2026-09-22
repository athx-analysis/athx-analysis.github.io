import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar, Tooltip, Legend } from 'recharts'
import { useLanguage } from '../../i18n/LanguageContext'

// Radar Force/Endurance/MetCon (z-score) : profil des vainqueurs vs plateau. Rendu
// volontairement plat/2D (aplats pleins, pas de degrade de profondeur).
const OFFSET = 1.5
const AXIS_LABEL = { fr: { strength: 'Force', endurance: 'Endurance', metcon: 'MetCon' }, en: { strength: 'Strength', endurance: 'Endurance', metcon: 'MetCon' } }

// MetCon : la donnee brute est en secondes, mais personne ne raisonne en secondes sur ce site --
// affichage MM:SS au survol (coherent avec le reste du site : Simulation, WorkoutReference...).
function fmtClock(totalSeconds) {
  const m = Math.floor(totalSeconds / 60)
  const s = Math.round(totalSeconds % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

// Tooltip standardise (voir ScatterWithFit/MultiLineChart) : fond noir, texte TOUJOURS blanc.
function CustomTooltip({ active, payload, label, raw, axisLabels, plateauLabel, winnersLabel }) {
  if (!active || !payload?.length || !raw) return null
  const key = { [axisLabels.strength]: 'strength', [axisLabels.endurance]: 'endurance', [axisLabels.metcon]: 'metcon' }[label]
  return (
    <div className="chart-tooltip">
      <div className="chart-tooltip-year">{label}</div>
      {payload.map((p) => {
        const group = p.dataKey === 'plateau' ? 'plateau' : 'winners'
        const val = raw[group]?.[key]
        const display = key === 'metcon' ? fmtClock(val) : `${val}${key === 'strength' ? 'KG' : 'KM'}`
        return (
          <div key={p.dataKey} className="chart-tooltip-value">
            {p.dataKey === 'plateau' ? plateauLabel : winnersLabel} : {display}
          </div>
        )
      })}
    </div>
  )
}

export default function RadarProfile({ profile, height = 320, title }) {
  const { lang, t } = useLanguage()
  const axisLabels = AXIS_LABEL[lang]
  // Le plateau est a 0 par construction (z-score) -- un radar centre sur 0 l'ecraserait en un
  // point invisible, impossible a lire comme "triangle". On decale les deux profils d'un meme
  // offset (comparaison relative inchangee) pour que le plateau forme un vrai petit triangle
  // (regulier, puisque 0 = 0 = 0) a l'interieur du triangle, plus grand, des vainqueurs.
  const data = [
    { axis: axisLabels.strength, vainqueurs: OFFSET + profile.strength, plateau: OFFSET },
    { axis: axisLabels.endurance, vainqueurs: OFFSET + profile.endurance, plateau: OFFSET },
    { axis: axisLabels.metcon, vainqueurs: OFFSET + profile.metcon, plateau: OFFSET },
  ]
  return (
    <div>
      {title && <h4 className="mini-chart-title">{title}</h4>}
      <ResponsiveContainer width="100%" height={height}>
        <RadarChart data={data} outerRadius="68%">
          <PolarGrid stroke="#e6e6e6" />
          <PolarAngleAxis dataKey="axis" tick={{ fill: '#3a3f47', fontSize: 13, fontWeight: 700 }} />
          <Tooltip content={<CustomTooltip raw={profile.raw} axisLabels={axisLabels} plateauLabel={t('plateau_avg')} winnersLabel={t('winners_top10')} />} />
          <Radar name={t('winners_top10')} dataKey="vainqueurs" stroke="var(--accent)" fill="var(--accent)" fillOpacity={0.5} strokeWidth={2} isAnimationActive={false} />
          <Radar name={t('plateau_avg')} dataKey="plateau" stroke="var(--gray-400)" fill="var(--gray-400)" fillOpacity={0.8} strokeWidth={0} isAnimationActive={false} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}
