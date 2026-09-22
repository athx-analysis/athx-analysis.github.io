import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell, ReferenceLine } from 'recharts'
import { useLanguage } from '../../i18n/LanguageContext'

function CustomTooltip({ active, payload, unit, lang }) {
  if (!active || !payload?.length) return null
  const p = payload[0]
  return (
    <div className="chart-tooltip">
      <div className="chart-tooltip-year">{p.payload.detail || p.payload.name}</div>
      <div className="chart-tooltip-value">{typeof p.value === 'number' ? p.value.toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US') : p.value}{unit || ''}</div>
    </div>
  )
}

// Bar chart horizontal generique, trie par valeur, une couleur par barre optionnelle.
// `data` = [{ name, value, color?, detail? }] -- `detail` (optionnel) remplace `name` dans le
// tooltip seulement, pour garder l'axe court quand le libelle complet est trop long.
export default function RankedBarChart({ data, unit = '', height, color = 'var(--accent)', zeroLine = false, labelWidth = 116, title, xLabel }) {
  const { lang } = useLanguage()
  const h = height || Math.max(140, data.length * 34)
  return (
    <div>
      {title && <h4 className="mini-chart-title">{title}</h4>}
      <ResponsiveContainer width="100%" height={h + (xLabel ? 26 : 0)}>
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 48, left: 4, bottom: xLabel ? 28 : 4 }}>
          <CartesianGrid stroke="#e2e2e2" horizontal={false} />
          <XAxis type="number" stroke="#70757e" tickLine={false} axisLine={{ stroke: '#e2e2e2' }} tick={{ fontSize: 11 }}
            label={xLabel ? { value: xLabel, position: 'bottom', offset: 6, fill: '#70757e', fontSize: 11 } : undefined} />
          <YAxis type="category" dataKey="name" width={labelWidth} tick={{ fill: '#3a3f47', fontSize: 12 }} axisLine={false} tickLine={false} />
          {zeroLine && <ReferenceLine x={0} stroke="#8a8f98" />}
          <Tooltip content={<CustomTooltip unit={unit} lang={lang} />} cursor={{ fill: 'rgba(10,10,10,0.04)' }} />
          <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={20} isAnimationActive={false}>
            {data.map((d, i) => <Cell key={i} fill={d.color || color} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
