// Logique de simulation de classement (100% client, pas de backend) : à partir des listes
// triées de performances réelles (src/data/simulation_data.json), calcule où un athlète
// hypothétique se classerait.
//
// Principe (vérifié empiriquement sur les données réelles) : le "sous-classement" d'un
// athlète sur une épreuve = 1 + le nombre d'athlètes réels strictement meilleurs que lui sur
// cette épreuve ; ses Points = somme exacte des 3 sous-classements (Force + Endurance +
// MetCon) ; son classement général = 1 + le nombre d'athlètes réels dont les Points sont
// strictement meilleurs (Points plus bas = mieux, comme sur le site).

export const MARGIN_PCT = 3
export const IMPROVEMENT_PCT = 3

export const DISCIPLINE_CONFIG = {
  strength: { rawKey: 'strength_raw', direction: 'higher', label: 'Force' },
  endurance: { rawKey: 'endurance_raw', direction: 'higher', label: 'Endurance' },
  metcon: { rawKey: 'metcon_raw', direction: 'lower', label: 'MetCon' },
}

export function countBetter(sortedAsc, value, direction) {
  // direction 'higher' : compte les valeurs strictement > value (Force/Endurance : plus = mieux)
  // direction 'lower'  : compte les valeurs strictement < value (MetCon : moins = mieux)
  const n = sortedAsc.length
  if (n === 0) return 0
  let lo = 0
  let hi = n
  if (direction === 'higher') {
    // upper_bound(value) -> nb d'elements <= value ; le reste (n - upper_bound) est > value
    while (lo < hi) {
      const mid = (lo + hi) >>> 1
      if (sortedAsc[mid] <= value) lo = mid + 1
      else hi = mid
    }
    return n - lo
  }
  // lower_bound(value) -> nb d'elements < value
  while (lo < hi) {
    const mid = (lo + hi) >>> 1
    if (sortedAsc[mid] < value) lo = mid + 1
    else hi = mid
  }
  return lo
}

// perf = { strength, endurance, metcon } (valeurs brutes : KG total, KM total, secondes)
export function simulateField(field, perf) {
  if (!field || field.n === 0) return null
  const subrankStrength = 1 + countBetter(field.strength_raw, perf.strength, 'higher')
  const subrankEndurance = 1 + countBetter(field.endurance_raw, perf.endurance, 'higher')
  const subrankMetcon = 1 + countBetter(field.metcon_raw, perf.metcon, 'lower')
  const points = subrankStrength + subrankEndurance + subrankMetcon
  const rank = 1 + countBetter(field.points, points, 'lower')
  const n = field.n
  return {
    n,
    rank,
    points,
    pctOverall: (rank / n) * 100,
    subrankStrength,
    subrankEndurance,
    subrankMetcon,
    pctStrength: (subrankStrength / n) * 100,
    pctEndurance: (subrankEndurance / n) * 100,
    pctMetcon: (subrankMetcon / n) * 100,
  }
}

// Marge d'erreur +-3% appliquee uniformement aux 3 estimations (incertitude globale de
// l'auto-evaluation), direction consciente de la performance (Force/Endurance : plus haut =
// mieux -> optimiste = *1.03 ; MetCon : plus bas = mieux -> optimiste = *0.97).
export function simulateWithMargin(field, perf, marginPct = MARGIN_PCT) {
  const f = marginPct / 100
  const base = simulateField(field, perf)
  const optimistic = simulateField(field, {
    strength: perf.strength * (1 + f),
    endurance: perf.endurance * (1 + f),
    metcon: perf.metcon * (1 - f),
  })
  const pessimistic = simulateField(field, {
    strength: perf.strength * (1 - f),
    endurance: perf.endurance * (1 - f),
    metcon: perf.metcon * (1 + f),
  })
  return { base, best: optimistic, worst: pessimistic }
}

// Pour chaque epreuve, simule une amelioration de +3% (directionnelle) sur CETTE seule
// epreuve (les 2 autres inchangees) et mesure le gain de places au classement general.
// Expose aussi la valeur brute AVANT/APRES (fromValue/toValue) pour pouvoir dire concretement
// "de X a Y -> +N places", epreuve par epreuve, plutot qu'un simple nombre de places isole.
export function bestImprovementTarget(field, perf, improvementPct = IMPROVEMENT_PCT) {
  const f = improvementPct / 100
  const base = simulateField(field, perf)
  if (!base) return null
  const scenarios = [
    { key: 'strength', label: 'Force', fromValue: perf.strength, toValue: perf.strength * (1 + f), perf: { ...perf, strength: perf.strength * (1 + f) } },
    { key: 'endurance', label: 'Endurance', fromValue: perf.endurance, toValue: perf.endurance * (1 + f), perf: { ...perf, endurance: perf.endurance * (1 + f) } },
    { key: 'metcon', label: 'MetCon', fromValue: perf.metcon, toValue: perf.metcon * (1 - f), perf: { ...perf, metcon: perf.metcon * (1 - f) } },
  ].map((s) => {
    const sim = simulateField(field, s.perf)
    return { key: s.key, label: s.label, fromValue: s.fromValue, toValue: s.toValue, rank: sim.rank, gain: base.rank - sim.rank }
  })
  scenarios.sort((a, b) => b.gain - a.gain)
  return { base, scenarios }
}

// Classe les MOUVEMENTS de Force du plus fort au plus faible pour cet athlete -- percentile
// INDIVIDUEL par mouvement (pas le total), seule facon equitable de comparer des mouvements a
// des echelles differentes (ex: 1RM Strict Press vs 5RM Deadlift, jamais les memes ordres de
// grandeur en KG). Necessite `field.strength_by_movement` (une liste triee par mouvement,
// generee par generate_simulation_data.py).
export function rankMovements(field, movementNames, movementValues) {
  const byMovement = field?.strength_by_movement
  if (!byMovement) return []
  return movementNames.map((name, i) => {
    const arr = byMovement[name]
    if (!arr || !arr.length) return null
    const rank = 1 + countBetter(arr, movementValues[i], 'higher')
    const n = arr.length
    return { key: name, label: name, value: movementValues[i], rank, n, pct: (rank / n) * 100 }
  }).filter(Boolean)
}

// Pour chaque mouvement de Force, simule un gain de +3% SUR CE SEUL mouvement (les 2 autres
// mouvements de Force + Endurance + MetCon inchanges) : le nouveau total Force (somme des
// mouvements, un seul boostee) est resimule contre la MEME population que le reste de la page
// (field.overall, deja utilisee pour le classement general) -- symetrique a
// bestImprovementTarget, mais a l'interieur de la seule discipline Force. Valeur affichee
// arrondie au KG pres (demande explicite).
//
// `totalOverride` (optionnel) : le total Force REEL utilise pour le classement (perf.strength)
// quand il ne correspond PAS a la somme de movementValues -- cas Team, ou movementValues ne
// contient que les mouvements d'UN SEUL coequipier (l'autre moitie du total Force de l'equipe),
// donc movementValues.reduce(...) serait le sous-total de cet athlete, pas le total d'equipe.
// Sans override (Solo, comportement inchange), le total est derive de movementValues comme
// avant.
export function bestMovementImprovement(field, perf, movementNames, movementValues, improvementPct = IMPROVEMENT_PCT, totalOverride = null) {
  const f = improvementPct / 100
  const base = simulateField(field, perf)
  if (!base) return null
  const total = totalOverride != null ? totalOverride : movementValues.reduce((a, b) => a + b, 0)
  const scenarios = movementNames.map((name, i) => {
    const boosted = Math.round(movementValues[i] * (1 + f))
    const newTotal = total - movementValues[i] + boosted
    const sim = simulateField(field, { ...perf, strength: newTotal })
    return { key: name, label: name, fromValue: Math.round(movementValues[i]), toValue: boosted, rank: sim.rank, gain: base.rank - sim.rank }
  })
  scenarios.sort((a, b) => b.gain - a.gain)
  return { base, scenarios }
}

// Classement + marge d'erreur +-3% sur UNE SEULE epreuve (utilise pour les cartes "classement
// general par epreuve" : rang/percentile sur cette seule dimension, independamment des 2 autres).
export function simulateDisciplineMargin(field, disciplineKey, rawValue, marginPct = MARGIN_PCT) {
  const { rawKey, direction } = DISCIPLINE_CONFIG[disciplineKey]
  const arr = field[rawKey]
  const n = field.n
  const f = marginPct / 100
  const betterFactor = direction === 'higher' ? 1 + f : 1 - f
  const worseFactor = direction === 'higher' ? 1 - f : 1 + f
  const at = (v) => {
    const rank = 1 + countBetter(arr, v, direction)
    return { rank, pct: (rank / n) * 100 }
  }
  return { n, base: at(rawValue), best: at(rawValue * betterFactor), worst: at(rawValue * worseFactor) }
}
