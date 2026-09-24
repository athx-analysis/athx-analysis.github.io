import { useEffect, useMemo, useState } from 'react'
import {
  LEADERBOARDS,
  GLOBAL_YEARS_BY_LEADERBOARD,
  countriesForYear,
  citiesForYearCountry,
  loadLeaderboardCsv,
} from '../lib/dataSource'
import { useLanguage } from '../i18n/LanguageContext'
import { usePageMeta } from '../hooks/usePageMeta'

const LB_PATH = {
  individual: '/individual-leaderboards',
  team: '/team-leaderboards',
  team_individual: '/team-individual-leaderboards',
}
const LB_TITLE = {
  individual: { fr: 'Classement Individuel ATHX Games', en: 'Individual Leaderboard — ATHX Games' },
  team: { fr: 'Classement par Équipe ATHX Games', en: 'Team Leaderboard — ATHX Games' },
  team_individual: { fr: 'Classement Individuel par Mouvement (Équipe) ATHX Games', en: 'Team Individual Leaderboards — ATHX Games' },
}

const WORKOUT_ORDER = ['Overall', 'Strength', 'Endurance', 'MetCon X']
const GENDER_ORDER = ['Female', 'Male', 'Mixed']
const METRIC_COLUMNS = [
  'Strength', 'Endurance', 'MetCon X',
  '1RM Strict Press', '3RM Back Squat', '5RM Deadlift',
  'Run', 'Row', 'Points',
]

function sortByPriority(values, priority) {
  return [...values].sort((a, b) => {
    const ia = priority.indexOf(a)
    const ib = priority.indexOf(b)
    if (ia !== -1 || ib !== -1) return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib)
    return a.localeCompare(b)
  })
}

function distinct(rows, key) {
  return [...new Set(rows.map((r) => r[key]).filter(Boolean))]
}

export default function Leaderboard({ lbKey }) {
  const { lang, t } = useLanguage()
  usePageMeta({
    path: LB_PATH[lbKey],
    title: `${LB_TITLE[lbKey][lang]} | ATHX Analysis`,
    description: `${t(`lb_${lbKey}_sub`)} — ATHX Games.`,
  })
  const spec = LEADERBOARDS.find((l) => l.key === lbKey)
  const yearOptions = GLOBAL_YEARS_BY_LEADERBOARD[lbKey]

  const [year, setYear] = useState(String(yearOptions[0]))
  const [country, setCountry] = useState('')
  const [city, setCity] = useState('')
  const [category, setCategory] = useState('')
  const [gender, setGender] = useState('')
  const [workout, setWorkout] = useState('')
  const [search, setSearch] = useState('')

  const [rawRows, setRawRows] = useState([])
  const [status, setStatus] = useState('loading') // loading | ready | error

  // reset la localisation si l'année choisie n'a pas de détail pays/ville
  const countryOptions = countriesForYear(year)
  useEffect(() => {
    if (country && !countryOptions.includes(country)) {
      setCountry('')
      setCity('')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year])

  const cityOptions = country ? citiesForYearCountry(year, country) : []
  useEffect(() => {
    if (city && !cityOptions.includes(city)) setCity('')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [country])

  // chargement des données pour la localisation/année choisie
  useEffect(() => {
    let cancelled = false
    setStatus('loading')
    loadLeaderboardCsv(spec.csv, year, country, city)
      .then((rows) => {
        if (cancelled) return
        const scoped = country ? rows : rows.filter((r) => String(r.year) === String(year))
        setRawRows(scoped)
        setStatus('ready')
      })
      .catch(() => {
        if (cancelled) return
        setRawRows([])
        setStatus('error')
      })
    return () => {
      cancelled = true
    }
  }, [spec.csv, year, country, city])

  // options de filtre déduites des données chargées
  const categoryOptions = useMemo(() => distinct(rawRows, 'event_category').sort(), [rawRows])
  const genderOptions = useMemo(() => sortByPriority(distinct(rawRows, 'division'), GENDER_ORDER), [rawRows])
  const workoutOptions = useMemo(() => sortByPriority(distinct(rawRows, 'workout_filter'), WORKOUT_ORDER), [rawRows])

  useEffect(() => {
    if (categoryOptions.length && !categoryOptions.includes(category)) setCategory(categoryOptions[0])
  }, [categoryOptions]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (genderOptions.length && !genderOptions.includes(gender)) setGender(genderOptions[0])
  }, [genderOptions]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (workoutOptions.length && !workoutOptions.includes(workout)) setWorkout(workoutOptions[0])
  }, [workoutOptions]) // eslint-disable-line react-hooks/exhaustive-deps

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase()
    return rawRows
      .filter((r) => r.event_category === category && r.division === gender && r.workout_filter === workout)
      .filter((r) => {
        if (!q) return true
        const name = spec.kind === 'team' ? r.team_name : r.full_name
        return (name || '').toLowerCase().includes(q)
      })
      .sort((a, b) => Number(a.rank) - Number(b.rank))
  }, [rawRows, category, gender, workout, search, spec.kind])

  const visibleMetricColumns = useMemo(
    () => METRIC_COLUMNS.filter((col) => filteredRows.some((r) => r[col])),
    [filteredRows]
  )

  // le temps que les valeurs par défaut de catégorie/division/workout se
  // calent sur les données fraîchement chargées, on reste en "chargement"
  // plutôt que d'afficher un flash "aucun résultat" trompeur
  const filtersReady = Boolean(category && gender && workout)
  const isLoading = status === 'loading' || (status === 'ready' && !filtersReady)

  return (
    <div className="container section">
      <p className="section-title">{t('nav_results')}</p>
      <h2 className="section-heading">{spec.label}</h2>

      <div className="filters-bar">
        <div className="filter-field">
          <label>{lang === 'fr' ? 'Année' : 'Year'}</label>
          <select value={year} onChange={(e) => setYear(e.target.value)}>
            {yearOptions.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        <div className="filter-field">
          <label>{t('country')}</label>
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            disabled={countryOptions.length === 0}
          >
            <option value="">{lang === 'fr' ? 'Toutes localisations' : 'All locations'}</option>
            {countryOptions.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="filter-field">
          <label>{lang === 'fr' ? 'Ville' : 'City'}</label>
          <select value={city} onChange={(e) => setCity(e.target.value)} disabled={!country}>
            <option value="">{lang === 'fr' ? 'Toutes les villes' : 'All cities'}</option>
            {cityOptions.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="filter-field">
          <label>{t('category')}</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} disabled={!categoryOptions.length}>
            {categoryOptions.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="filter-field">
          <label>{lang === 'fr' ? 'Division' : 'Division'}</label>
          <select value={gender} onChange={(e) => setGender(e.target.value)} disabled={!genderOptions.length}>
            {genderOptions.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>

        <div className="filter-field">
          <label>Workout</label>
          <select value={workout} onChange={(e) => setWorkout(e.target.value)} disabled={!workoutOptions.length}>
            {workoutOptions.map((w) => (
              <option key={w} value={w}>{w}</option>
            ))}
          </select>
        </div>

        <div className="filter-field">
          <label>{lang === 'fr' ? 'Recherche' : 'Search'}</label>
          <input
            type="text"
            placeholder={spec.kind === 'team' ? t('search_team') : t('search_athlete')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="table-wrap">
        {isLoading && <div className="status-line">{t('loading')}</div>}
        {status === 'error' && <div className="status-line">{t('load_error')}</div>}
        {!isLoading && status === 'ready' && filteredRows.length === 0 && (
          <div className="status-line">{t('no_results')}</div>
        )}

        {!isLoading && status === 'ready' && filteredRows.length > 0 && (
          <>
            <div className="results-count-line">{filteredRows.length} {t('results_count')}</div>
            <div className="table-scroll">
              <table className="lb-table">
                <thead>
                  <tr>
                    <th scope="col">{t('rank')}</th>
                    <th scope="col">{spec.kind === 'team' ? t('team') : t('athlete')}</th>
                    <th scope="col">{t('event')}</th>
                    <th scope="col">{t('country')}</th>
                    {visibleMetricColumns.map((col) => (
                      <th key={col} scope="col">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((r, i) => (
                    <tr key={`${r.rank}-${i}`}>
                      <td className="rank-cell">#{r.rank}</td>
                      <td>
                        {spec.kind === 'team' ? (
                          r.team_name
                        ) : (
                          <span className="name-cell">
                            {r.full_name}
                          </span>
                        )}
                      </td>
                      <td className="muted">{r.event}</td>
                      <td className="muted">{r.country}</td>
                      {visibleMetricColumns.map((col) => (
                        <td key={col}>{r[col] || '—'}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="swipe-hint">{t('scroll_hint')}</div>
          </>
        )}
      </div>
    </div>
  )
}
