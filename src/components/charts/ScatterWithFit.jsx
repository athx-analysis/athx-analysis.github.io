import {
  ResponsiveContainer, Scatter, XAxis, YAxis, CartesianGrid, Tooltip,
  Line, ComposedChart, LineChart, ReferenceLine,
} from 'recharts'
import { niceDomainTicks, niceStep } from '../../lib/chartUtils'
import { useLanguage } from '../../i18n/LanguageContext'

function CustomTooltip({ active, payload, xLabel, xUnit, yLabel, yUnit, xFormat, yFormat }) {
  if (!active || !payload?.length) return null
  const p = payload[0].payload
  return (
    <div className="chart-tooltip">
      <div className="chart-tooltip-value">{xLabel} : {xFormat ? xFormat(p.x) : p.x}{xUnit}</div>
      <div className="chart-tooltip-value">{yLabel} : {yFormat ? yFormat(p.y) : p.y}{yUnit}</div>
    </div>
  )
}

// Rendu manuel d'un point en cercle SVG simple (pas le mecanisme ZAxis/d3-symbol de recharts,
// dont le mapping "size" -> rayon reel en pixels s'est revele peu previsible) : garantit un
// rayon exact, en pixels, quel que soit le nombre de points ou la densite du nuage.
function makeDot(radius, opacity) {
  return function Dot({ cx, cy, fill }) {
    if (cx == null || cy == null) return null
    return <circle cx={cx} cy={cy} r={radius} fill={fill} fillOpacity={opacity} stroke="none" />
  }
}

// Nuage de points x/y + courbe de lissage optionnelle + seuil vertical optionnel + coloration
// par categorie optionnelle (groupKey). xDomain/xTicks (optionnels) imposent un axe X a
// intervalle regulier. yReversed (par defaut true, pour un axe "Points" ou moins = mieux) et
// xReversed (par defaut false) permettent d'inverser le sens de lecture d'un axe au besoin
// (ex: MetCon, ou l'on veut le temps le plus long a gauche et le plus rapide a droite).
// Titres d'axes rendus directement sur les axes (label recharts, position 'bottom'/'left',
// donc a l'EXTERIEUR de la zone de tracé) -- on reserve expres une bonne marge autour du
// graphique pour ca : le tracé prend un peu moins de place dans le cadre, mais rien ne se
// superpose jamais aux graduations.
// `square` (optionnel) : force le graphique dans un cadre carre (ratio 1:1, largeur pilotee
// par le parent) plutot que la hauteur fixe habituelle -- utilise pour les petites grilles.
// Ordre des plans (du fond vers le premier plan), demande explicite :
//   1. points (le plus petit possible)
//   2. courbe noire (lissage) -- par-dessus les points
//   3. seuil (pointille orange) -- par-dessus la courbe
//   4. tooltip au survol -- toujours au premier plan absolu
// La courbe ET le seuil sont rendus dans un DEUXIEME graphique, superpose en position absolute
// (memes marge/domaine/ticks que le graphique du dessous, pour un alignement pixel-parfait) :
// recharts peint systematiquement les Scatter au-dessus des Line/ReferenceLine a l'interieur
// d'un meme ComposedChart, quel que soit l'ordre des enfants JSX -- avec beaucoup de points
// semi-transparents qui se chevauchent, la courbe et le seuil finissaient caches par endroits.
// Dans ce deuxieme graphique, le seuil est place APRES la courbe (donc peint par-dessus elle).
// Le tooltip (rendu par recharts a l'interieur du PREMIER graphique) est repasse au-dessus de
// cette superposition via z-index CSS (voir .recharts-tooltip-wrapper dans index.css).
export default function ScatterWithFit({
  points, curve, threshold, title, xLabel, xUnit = '', yLabel = 'Points', yUnit = '', groupKey, groupColors,
  height = 340, xDomain, xTicks, xTickFormatter, yTickFormatter, pointOpacity = 0.55, pointSize = 1, yStep,
  yReversed = true, xReversed = false, margin, square = false, curveLegendLabel, thresholdLegendLabel,
}) {
  const { t } = useLanguage()
  const groups = groupKey ? [...new Set(points.map((p) => p[groupKey]))] : [null]
  const allX = [...points.map((p) => p.x), ...(curve || []).map((p) => p.x)]
  const allY = [...points.map((p) => p.y), ...(curve || []).map((p) => p.y)]
  const computedXDomain = (() => {
    const lo = Math.min(...allX)
    const hi = Math.max(...allX)
    const m = (hi - lo) * 0.05 || 1
    return [Math.floor(lo - m), Math.ceil(hi + m)]
  })()
  const yLo = Math.min(...allY)
  const yHi = Math.max(...allY)
  const resolvedYStep = yStep || niceStep(yHi - yLo)
  const { domain: yDomain, ticks: yTicks } = niceDomainTicks(Math.max(0, yLo - (yHi - yLo) * 0.05), yHi + (yHi - yLo) * 0.05, resolvedYStep)
  const resolvedXDomain = xDomain || computedXDomain
  const chartMargin = margin || { top: 24, right: 18, left: 26, bottom: 36 }
  const dot = makeDot(pointSize, pointOpacity)

  const chart = (
    <ResponsiveContainer width="100%" height={square ? '100%' : height}>
      <ComposedChart margin={chartMargin}>
        <CartesianGrid stroke="#e2e2e2" vertical={false} />
        <XAxis
          type="number" dataKey="x" name={xLabel} unit={xUnit} reversed={xReversed}
          domain={resolvedXDomain} ticks={xTicks} allowDataOverflow
          tickFormatter={xTickFormatter}
          stroke="#70757e" tickLine={false} axisLine={{ stroke: '#e2e2e2' }} tick={{ fontSize: 10 }}
          label={{ value: `${xLabel}${xUnit ? ` (${xUnit})` : ''}`, position: 'bottom', offset: 8, fill: '#70757e', fontSize: 11 }}
        />
        <YAxis type="number" dataKey="y" name={yLabel} domain={yDomain} ticks={yTicks} allowDataOverflow reversed={yReversed}
          tickFormatter={yTickFormatter}
          stroke="#70757e" tickLine={false} axisLine={false} width={40} tick={{ fontSize: 10 }}
          label={{ value: `${yLabel}${yUnit ? ` (${yUnit})` : ''}`, angle: -90, position: 'left', offset: 16, fill: '#70757e', fontSize: 11 }} />
        <Tooltip content={<CustomTooltip xLabel={xLabel} xUnit={xUnit} yLabel={yLabel} yUnit={yUnit} xFormat={xTickFormatter} yFormat={yTickFormatter} />} cursor={{ strokeDasharray: '3 3' }} />
        {groups.map((g) => (
          <Scatter
            key={g ?? 'all'}
            data={groupKey ? points.filter((p) => p[groupKey] === g) : points}
            fill={groupColors ? groupColors[g] : 'var(--blue)'}
            shape={dot}
            isAnimationActive={false}
          />
        ))}
      </ComposedChart>
    </ResponsiveContainer>
  )

  // Overlay transparent, memes marge/domaine/ticks que le graphique principal (pour un
  // alignement pixel-parfait) : courbe D'ABORD, seuil ENSUITE (peint par-dessus la courbe) --
  // les deux toujours peints apres (donc au-dessus) des points du graphique du dessous.
  const hasOverlay = (curve && curve.length > 0) || threshold != null
  const curveOverlay = hasOverlay && (
    <div className="chart-overlay">
      <ResponsiveContainer width="100%" height={square ? '100%' : height}>
        <LineChart data={curve || []} margin={chartMargin}>
          <XAxis type="number" dataKey="x" domain={resolvedXDomain} ticks={xTicks} allowDataOverflow reversed={xReversed} hide />
          <YAxis type="number" dataKey="y" domain={yDomain} ticks={yTicks} allowDataOverflow reversed={yReversed} width={40} hide />
          {curve && curve.length > 0 && (
            <Line type="linear" dataKey="y" stroke="var(--ink)" strokeWidth={2.5} dot={false} isAnimationActive={false} />
          )}
          {threshold != null && (
            <ReferenceLine x={threshold} stroke="var(--accent-2)" strokeDasharray="6 5" strokeWidth={2}
              label={{ value: `${t('threshold_label')} : ${xTickFormatter ? xTickFormatter(threshold) : threshold}${xUnit}`, position: 'top', fill: 'var(--accent-2)', fontSize: 11, fontWeight: 700 }} />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )

  // Legende explicite courbe/seuil (a quoi correspond chaque trait) : un trait plein pour la
  // courbe, un trait pointille pour le seuil -- n'apparait que si le graphique a effectivement
  // l'un et/ou l'autre (pas de legende vide sur un nuage de points sans lissage ni seuil).
  const showCurveLegend = curve && curve.length > 0 && curveLegendLabel
  const showThresholdLegend = threshold != null && thresholdLegendLabel
  const legend = (showCurveLegend || showThresholdLegend) && (
    <div className="chart-legend-lines">
      {showCurveLegend && (
        <span style={{ color: 'var(--ink)' }}>
          <i /> {curveLegendLabel}
        </span>
      )}
      {showThresholdLegend && (
        <span style={{ color: 'var(--accent-2)' }}>
          <i className="dashed" /> {thresholdLegendLabel}
        </span>
      )}
    </div>
  )

  return (
    <div>
      {title && <h4 className="mini-chart-title">{title}</h4>}
      {square ? (
        <div className="chart-square-box chart-overlay-wrap">
          {chart}
          {curveOverlay}
        </div>
      ) : (
        <div className="chart-overlay-wrap">
          {chart}
          {curveOverlay}
        </div>
      )}
      {legend}
    </div>
  )
}
