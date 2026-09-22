import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'
import { useLanguage } from '../../i18n/LanguageContext'

function CustomTooltip({ active, payload, label, unit, lang }) {
  if (!active || !payload?.length) return null
  // Le point de prévision partage la même année que le dernier point réel (pour
  // relier visuellement les deux courbes) : on affiche la valeur réelle si présente,
  // sinon la prévision, en le signalant.
  const real = payload.find((p) => p.dataKey === 'value' && p.value != null)
  const forecast = payload.find((p) => p.dataKey === 'forecastValue' && p.value != null)
  const entry = real || forecast
  if (!entry) return null
  return (
    <div className="chart-tooltip">
      <div className="chart-tooltip-year">{label}</div>
      <div className="chart-tooltip-value">
        {entry.value.toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US')} {unit}
        {!real && forecast && <span className="chart-tooltip-tag"> ({lang === 'fr' ? 'prévu' : 'planned'})</span>}
      </div>
    </div>
  )
}

// Courbe/aire d'évolution d'une métrique par année (événements, participants...).
// `forecast` (optionnel) : { year, value } -> ajoute un point en pointillés, visuellement
// distinct des données réelles (ex: événements déjà planifiés pour l'année suivante).
export default function TrendChart({ data, dataKey, unit, color = '#ff2d20', forecast, title, yLabel }) {
  const { lang } = useLanguage()
  const gradientId = `trend-gradient-${dataKey}`

  let chartData = data.map((d) => ({ year: d.year, value: d[dataKey] }))
  if (forecast) {
    const lastReal = chartData[chartData.length - 1]
    chartData = [
      ...chartData.map((d) => ({ ...d, forecastValue: null })),
      { year: forecast.year, value: null, forecastValue: forecast.value },
    ]
    // relie la ligne pleine à la ligne en pointillés sur le dernier point réel
    chartData[chartData.length - 2].forecastValue = lastReal.value
  }

  return (
    <div>
      {title && <h4 className="mini-chart-title">{title}</h4>}
      <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 40, bottom: 26 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.45} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="#e2e2e2" vertical={false} />
        <XAxis dataKey="year" stroke="#70757e" tickLine={false} axisLine={{ stroke: '#e2e2e2' }} tick={{ fontSize: 11 }}
          label={{ value: lang === 'fr' ? 'Année' : 'Year', position: 'bottom', offset: 6, fill: '#70757e', fontSize: 11 }} />
        <YAxis stroke="#70757e" tickLine={false} axisLine={false} width={52} tick={{ fontSize: 11 }}
          label={yLabel ? { value: yLabel, angle: -90, position: 'left', offset: 20, fill: '#70757e', fontSize: 11 } : undefined} />
        <Tooltip content={<CustomTooltip unit={unit} lang={lang} />} cursor={{ stroke: color, strokeWidth: 1, strokeDasharray: '4 4' }} />
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2.5}
          fill={`url(#${gradientId})`}
          dot={{ r: 4, fill: color, strokeWidth: 0 }}
          activeDot={{ r: 6 }}
          connectNulls
          isAnimationActive={false}
        />
        {forecast && (
          <Area
            type="monotone"
            dataKey="forecastValue"
            stroke={color}
            strokeWidth={2}
            strokeDasharray="6 5"
            fill="transparent"
            dot={{ r: 4, fill: "#ffffff", stroke: color, strokeWidth: 2 }}
            activeDot={{ r: 6 }}
            connectNulls
            isAnimationActive={false}
          />
        )}
      </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
