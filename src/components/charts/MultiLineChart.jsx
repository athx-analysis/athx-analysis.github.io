import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { useLanguage } from '../../i18n/LanguageContext'

// Tooltip standardise (voir ScatterWithFit/RadarProfile) : fond noir, texte TOUJOURS blanc --
// avant, la couleur du texte reprenait celle de la serie (rouge/gris/bleu...), ce qui rendait
// le style incoherent d'un graphique a l'autre.
function CustomTooltip({ active, payload, label, unit, lang }) {
  if (!active || !payload?.length) return null
  return (
    <div className="chart-tooltip">
      <div className="chart-tooltip-year">{label}</div>
      {payload.map((p) => (
        <div key={p.dataKey} className="chart-tooltip-value">
          {p.name} : {p.value?.toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US')}{unit}
        </div>
      ))}
    </div>
  )
}

// Jusqu'a 2 series par graphique (ex : plateau vs Top 10), pour comparer leur evolution --
// meme echelle Y forcement (les deux lignes partagent le meme axe, contrairement au ScatterWithFit
// qui isole 1 discipline par graphique). `lines` = [{ dataKey, color, name, dashed? }]. Titres
// d'axes directement sur les axes (voir ScatterWithFit) : marge basse genereuse car les noms
// d'evenements (axe X) sont deja pivotes et prennent de la place a eux seuls. Legende en bas,
// sous les libelles d'evenements -- consomme sa propre place (recharts l'exclut du calcul de
// marge automatiquement), d'ou la marge basse encore un peu plus genereuse que sans legende.
export default function MultiLineChart({ data, lines, height = 340, domain, title, yLabel, unit = '' }) {
  const { lang } = useLanguage()
  return (
    <div>
      {title && <h4 className="mini-chart-title">{title}</h4>}
      <ResponsiveContainer width="100%" height={height}>
        {/* Marge du haut volontairement plus petite que celle du bas : le titre (h4, hors SVG)
            occupe deja de la place au-dessus du graphique, donc pour que la zone de tracé
            (grille + courbes) soit verticalement centree dans TOUT LE CADRE (titre inclus, pas
            juste dans le SVG), il faut compenser cet espace pris par le titre -- mesure au
            pixel pres (cf. verification), pas une estimation a l'oeil. */}
        <LineChart data={data} margin={{ top: 58, right: 28, left: 28, bottom: 96 }}>
          <CartesianGrid stroke="#e2e2e2" vertical={false} />
          <XAxis dataKey="event" stroke="#70757e" tickLine={false} axisLine={{ stroke: '#e2e2e2' }}
            angle={-40} textAnchor="end" height={60} interval={0} tick={{ fontSize: 11 }}
            label={{ value: lang === 'fr' ? 'Événement' : 'Event', position: 'bottom', offset: 10, fill: '#70757e', fontSize: 11 }} />
          <YAxis stroke="#70757e" tickLine={false} axisLine={false} width={46} domain={domain || ['auto', 'auto']} tick={{ fontSize: 10 }}
            label={yLabel ? { value: yLabel, angle: -90, position: 'left', offset: 16, fill: '#70757e', fontSize: 11 } : undefined} />
          <Tooltip content={<CustomTooltip unit={unit} lang={lang} />} />
          <Legend verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: 12, bottom: 0 }} />
          {lines.map((l) => (
            <Line key={l.dataKey} type="monotone" dataKey={l.dataKey} name={l.name} stroke={l.color} strokeWidth={2.5}
              strokeDasharray={l.dashed ? '6 5' : undefined}
              dot={{ r: 3, fill: l.color, strokeWidth: 0 }} connectNulls isAnimationActive={false} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
