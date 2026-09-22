import Papa from 'papaparse'
import manifest from '../data/manifest.json'

// Années disponibles par leaderboard en mode "Toutes localisations" (data_general/).
// individual-leaderboards n'a que 2025/2026 sur le site source ; team et
// team-individual remontent jusqu'à 2023.
export const GLOBAL_YEARS_BY_LEADERBOARD = {
  individual: [2026, 2025],
  team: [2026, 2025, 2024, 2023],
  team_individual: [2026, 2025, 2024, 2023],
}

export const LEADERBOARDS = manifest.leaderboards
export const LOCATION_YEARS = Object.keys(manifest.years).sort((a, b) => b - a) // ["2026","2025"]

export function countriesForYear(year) {
  return Object.keys(manifest.years[year] || {}).sort()
}

export function citiesForYearCountry(year, country) {
  return (manifest.years[year]?.[country] || []).slice().sort()
}

function resolveDataUrl(csvFile, year, country, city) {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '')
  if (!country) return `${base}/data/data_general/${csvFile}`
  if (!city) return `${base}/data/${year}/${encodeURIComponent(country)}/${csvFile}`
  return `${base}/data/${year}/${encodeURIComponent(country)}/${encodeURIComponent(city)}/${csvFile}`
}

const cache = new Map()

// Charge (et met en cache) le CSV correspondant à une combinaison
// leaderboard/année/pays/ville. Quand `country` est vide, c'est le fichier
// "global" (data_general, toutes localisations confondues, plusieurs
// années) qui est chargé, et le filtrage par année se fait ensuite côté
// client sur la colonne `year`.
export async function loadLeaderboardCsv(csvFile, year, country, city) {
  const url = resolveDataUrl(csvFile, year, country, city)
  if (cache.has(url)) return cache.get(url)

  const promise = new Promise((resolve, reject) => {
    Papa.parse(url, {
      download: true,
      header: true,
      dynamicTyping: false,
      skipEmptyLines: true,
      complete: (results) => resolve(results.data),
      error: reject,
    })
  })
  cache.set(url, promise)
  try {
    return await promise
  } catch (err) {
    cache.delete(url)
    throw err
  }
}
