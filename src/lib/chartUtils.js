// Domaine + ticks "ronds" (intervalle régulier) pour un axe, à partir du min/max réel des
// données et d'un pas donné (100 pour la Force en KG, 0.5 pour l'Endurance en KM, 1 pour le
// MetCon en minutes...) -- borne inférieure/supérieure arrondies au pas en-dessous/au-dessus,
// pour que l'axe démarre et finisse sur un multiple exact du pas, quel que soit le segment.
export function niceDomainTicks(min, max, step) {
  const lo = Math.floor(min / step) * step
  const hi = Math.ceil(max / step) * step
  const ticks = []
  for (let v = lo; v <= hi + step * 0.001; v += step) {
    ticks.push(Math.round(v / step) * step)
  }
  return { domain: [lo, hi], ticks }
}

export const secondsToMinutesLabel = (s) => (s / 60).toFixed(1).replace(/\.0$/, '')

// Choisit un pas "rond" (1, 2, 2.5, 5, 10, 20, 25, 50, 100... x10^k) proche de range/targetTicks
// -- pour un axe qui s'adapte automatiquement a l'echelle reelle des donnees (les segments
// individuels et equipe n'ont pas du tout la meme plage de points) tout en restant a
// intervalles reguliers, jamais des ticks arbitraires type "-79, 141, 291".
export function niceStep(range, targetTicks = 6) {
  if (!Number.isFinite(range) || range <= 0) return 1
  const raw = range / targetTicks
  const mag = Math.pow(10, Math.floor(Math.log10(raw)))
  const norm = raw / mag
  const steps = [1, 2, 2.5, 5, 10]
  const picked = steps.find((s) => norm <= s) ?? 10
  return picked * mag
}
