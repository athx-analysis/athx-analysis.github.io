// Grille de cellules colorees generique -- utilisee pour la matrice de correlation (carree,
// 3x3) et la carte de chaleur par ville (rectangulaire, N villes x 3 epreuves). Degrades
// calques sur la DA du site (rouge/orange ATHX pour les valeurs hautes, bleu pour les valeurs
// negatives en mode diverging) -- texte systematiquement blanc avec un contour sombre, pour
// rester lisible quelle que soit l'intensite de la cellule (pas de bascule noir/blanc au cas
// par cas).
// `mode="sequential"` (0 -> 1, blanc -> rouge/orange ATHX, pour des correlations toujours
// positives ici) ; `mode="diverging"` (negatif -> bleu, positif -> rouge/orange ATHX, pour des
// z-scores).
export default function Heatmap({ rows, cols, values, mode = 'sequential', cellSuffix = '', labelWidth = 140, title, rowsLabel, colsLabel }) {
  const flat = values.flat().filter((v) => Number.isFinite(v))
  const maxAbs = Math.max(...flat.map((v) => Math.abs(v)), 0.01)

  function colorFor(v) {
    if (mode === 'sequential') {
      const t = Math.max(0, Math.min(1, v))
      // blanc -> rouge -> orange (degrade ATHX), intensite proportionnelle a la valeur
      const r = 255
      const g = Math.round(45 + (122 - 45) * t)
      const b = Math.round(32 * (1 - t))
      const bgAlpha = 0.18 + t * 0.82
      return `rgba(${r}, ${g}, ${b}, ${bgAlpha.toFixed(2)})`
    }
    const t = Math.max(-1, Math.min(1, v / maxAbs))
    const bgAlpha = 0.18 + Math.abs(t) * 0.82
    if (t >= 0) return `rgba(255, 61, 0, ${bgAlpha.toFixed(2)})` // rouge->orange ATHX
    return `rgba(21, 93, 252, ${bgAlpha.toFixed(2)})` // bleu
  }

  return (
    <div>
      {title && <h4 className="mini-chart-title">{title}</h4>}
      {(rowsLabel || colsLabel) && (
        <p className="chart-axis-caption">Lignes : {rowsLabel} · Colonnes : {colsLabel}</p>
      )}
      <div className="heatmap" style={{ '--heatmap-label-w': `${labelWidth}px` }}>
        <div className="heatmap-row heatmap-header">
          <div className="heatmap-cell heatmap-label" />
          {cols.map((c) => (
            <div key={c} className="heatmap-cell heatmap-col-label">{c}</div>
          ))}
        </div>
        {rows.map((r, ri) => (
          <div key={r} className="heatmap-row">
            <div className="heatmap-cell heatmap-label" title={r}>{r}</div>
            {cols.map((c, ci) => {
              const v = values[ri][ci]
              return (
                <div key={c} className="heatmap-cell heatmap-value" style={{ background: colorFor(v) }}>
                  {Number.isFinite(v) ? `${v.toFixed(2)}${cellSuffix}` : '—'}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
