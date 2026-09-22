import { useState } from 'react'
import { Link } from 'react-router-dom'
import AthxLogo from '../components/AthxLogo'
import Reveal from '../components/Reveal'
import EvidenceToggle from '../components/EvidenceToggle'
import SegmentPicker from '../components/SegmentPicker'
import ScatterWithFit from '../components/charts/ScatterWithFit'
import RadarProfile from '../components/charts/RadarProfile'
import MultiLineChart from '../components/charts/MultiLineChart'
import Heatmap from '../components/charts/Heatmap'
import { niceDomainTicks } from '../lib/chartUtils'
import data from '../data/analyses_data.json'
import { useLanguage } from '../i18n/LanguageContext'

const DEFAULT_SEGMENT = data.segments.find((s) => s.key === 'individual_Male_ATHX')?.key || data.segments[0].key

const MOVEMENT_STEP = { '1RM Strict Press': 20, '3RM Back Squat': 50, '5RM Deadlift': 50 }

function secToMin(v) { return v / 60 }
function fmtMin(v) { return v.toFixed(1).replace(/\.0$/, '') }

function useSegment(initial = DEFAULT_SEGMENT) {
  const [key, setKey] = useState(initial)
  const seg = data.by_segment[key]
  const meta = data.segments.find((s) => s.key === key)
  return [key, setKey, seg, meta]
}

export default function Analyses() {
  const { lang, t } = useLanguage()
  const [pairKey, setPairKey, pairSeg] = useSegment()
  const [profKey, setProfKey, profSeg] = useSegment()
  const [corrKey, setCorrKey, corrSeg] = useSegment()
  const [seasKey, setSeasKey, seasSeg] = useSegment()
  const [cityKey, setCityKey, citySeg] = useSegment()
  const [thrKey, setThrKey, thrSeg] = useSegment()

  const DISCIPLINE_SPECS = [
    { key: 'strength', label: t('discipline_force'), unit: 'KG', step: 100 },
    { key: 'endurance', label: t('discipline_endurance'), unit: 'KM', step: 0.5 },
    { key: 'metcon', label: t('discipline_metcon'), unit: 'min', step: 1 },
  ]
  const SEASON_COLORS = { strength: 'var(--accent)', endurance: 'var(--blue)', metcon: 'var(--accent-2)' }
  const SEASON_UNITS = lang === 'fr'
    ? { strength: 'KG, total soulevé', endurance: 'KM, distance totale', metcon: 'min, temps total' }
    : { strength: 'KG, total lifted', endurance: 'KM, total distance', metcon: 'min, total time' }
  const PAIR_SPECS = [
    { key: 'fe', aKey: 'strength_raw', bKey: 'endurance_raw', aLabel: t('discipline_force'), bLabel: t('discipline_endurance'), aUnit: 'KG', bUnit: 'KM', bIsMetcon: false },
    { key: 'fm', aKey: 'strength_raw', bKey: 'metcon_perf', aLabel: t('discipline_force'), bLabel: t('discipline_metcon'), aUnit: 'KG', bUnit: 'min', bIsMetcon: true },
    { key: 'em', aKey: 'endurance_raw', bKey: 'metcon_perf', aLabel: t('discipline_endurance'), bLabel: t('discipline_metcon'), aUnit: 'KM', bUnit: 'min', bIsMetcon: true },
  ]
  const notEnoughData = t('not_enough_data')
  const notEnoughDataShort = t('not_enough_data_short')
  const pctBeyond = (pct) => (lang === 'fr' ? `${pct}% du plateau déjà au-delà du seuil` : `${pct}% of the field already beyond the threshold`)
  const curveLegendLabel = lang === 'fr' ? 'Tendance (moyenne lissée)' : 'Trend (smoothed average)'
  const thresholdLegendLabel = t('threshold_label')

  return (
    <div className="analyses-page">
      <section className="hero">
        <div className="container">
          <AthxLogo color="#ffffff" className="hero-logo" />
          <h1>{lang === 'fr' ? 'Ce que les données ATHX montrent.' : 'What the ATHX data shows.'}</h1>
          <p>{lang === 'fr' ? `Étude construite sur la saison ${data.year}.` : `Study built on the ${data.year} season.`}</p>
        </div>
      </section>

      {/* ================= Q1 : profils ================= */}
      <section className="section analyses-act">
        <div className="container">
          <Reveal>
            <h2 className="section-heading section-heading-tight">
              {lang === 'fr' ? 'Quels sont les profils qui font un ATHX ?' : 'What profiles make an ATHX athlete?'}
            </h2>
            <p className="question-subtitle">
              {t('answer_prefix')} : {lang === 'fr' ? "aucun profil ne se distingue vraiment d'un autre." : "no profile really stands out from another."}
            </p>
            <p className="about-intro-text">
              {lang === 'fr' ? (
                <>En regardant Force, Endurance et MetCon deux à deux, on ne voit pas de groupe
                  particulier qui se détache : les athlètes se répartissent sur un continuum, pas
                  en profils bien séparés.</>
              ) : (
                <>Looking at Strength, Endurance and MetCon two at a time, no particular group
                  stands out: athletes spread out over a continuum, not into clearly separate
                  profiles.</>
              )}
            </p>
          </Reveal>
          <Reveal className="analyses-chart-block">
            <SegmentPicker segments={data.segments} value={pairKey} onChange={setPairKey} />
            {pairSeg?.pairwise ? (
              <div className="analyses-threeup">
                {PAIR_SPECS.map((spec) => {
                  const raw = pairSeg.pairwise.pairs[`${spec.aKey}__${spec.bKey}`] || []
                  // metcon_perf = -temps en secondes -- reconverti en minutes (site entier : on
                  // parle toujours en minutes pour le MetCon, jamais en secondes brutes).
                  const points = raw.map((p) => ({
                    x: p.x, y: spec.bIsMetcon ? secToMin(-p.y) : p.y,
                  }))
                  return (
                    <div key={spec.key} className="about-block-chart">
                      <ScatterWithFit
                        title={`${spec.aLabel} / ${spec.bLabel}`}
                        points={points}
                        xLabel={spec.aLabel} xUnit={spec.aUnit}
                        yLabel={spec.bLabel} yUnit={spec.bUnit}
                        yReversed={spec.bIsMetcon}
                        yTickFormatter={spec.bIsMetcon ? fmtMin : undefined}
                        pointSize={2} pointOpacity={0.5}
                      />
                    </div>
                  )
                })}
              </div>
            ) : <p className="chart-caption">{notEnoughData}</p>}
            <EvidenceToggle label={lang === 'fr' ? 'Comment lire ces graphiques ?' : 'How to read these charts?'}>
              <p className="about-intro-text" style={{ marginBottom: 0 }}>
                {lang === 'fr' ? (
                  <>Chaque point est un athlète, comparé sur deux épreuves à la fois. Si des profils
                    distincts existaient, on verrait des amas séparés dans les nuages — ce n'est pas
                    le cas.</>
                ) : (
                  <>Each point is one athlete, compared on two events at a time. If distinct
                    profiles existed, we'd see separate clusters in the clouds — that's not the
                    case.</>
                )}
              </p>
            </EvidenceToggle>
          </Reveal>
        </div>
      </section>

      {/* ================= Q2 : profil precis ================= */}
      <section className="section analyses-act" style={{ background: 'var(--bg-panel)' }}>
        <div className="container">
          <Reveal className="about-block reverse">
            <div className="about-block-text">
              <h2 className="section-heading section-heading-tight">
                {lang === 'fr' ? "Est-ce qu'il faut un profil précis pour gagner ?" : 'Does it take a specific profile to win?'}
              </h2>
              <p className="question-subtitle">
                {t('answer_prefix')} : {lang === 'fr' ? 'non, il faut être complet sur les trois épreuves.' : 'no, you need to be well-rounded across all three events.'}
              </p>
              <p className="about-intro-text">
                {lang === 'fr'
                  ? 'Les vainqueurs sont meilleurs en moyenne sur les trois épreuves à la fois, pas seulement sur une.'
                  : 'Winners are, on average, better across all three events at once, not just one.'}
              </p>
              <EvidenceToggle label={lang === 'fr' ? 'Comment lire ce graphique ?' : 'How to read this chart?'}>
                <p className="about-intro-text" style={{ marginBottom: 0 }}>
                  {lang === 'fr' ? (
                    <>Le triangle gris (plateau) compare la moyenne de tous les participants au
                      triangle rouge (Top 10 de chaque événement), épreuve par épreuve. Plus le
                      sommet rouge dépasse le sommet gris sur une épreuve, plus les meilleurs sont
                      au-dessus de la moyenne sur cette épreuve. Survolez le graphique pour voir les
                      vraies valeurs (KG, KM, secondes).</>
                  ) : (
                    <>The grey triangle (field) compares the average of all participants to the red
                      triangle (Top 10 of each event), event by event. The further the red vertex
                      extends past the grey one on an event, the further the best athletes are above
                      average on it. Hover the chart to see the real values (KG, KM, seconds).</>
                  )}
                </p>
              </EvidenceToggle>
            </div>
            <div className="about-block-chart">
              <SegmentPicker segments={data.segments} value={profKey} onChange={setProfKey} />
              {profSeg?.winner_profile ? (
                <RadarProfile profile={profSeg.winner_profile} title={lang === 'fr' ? 'Vainqueurs (Top 10) vs plateau' : 'Winners (Top 10) vs field'} />
              ) : <p className="chart-caption">{notEnoughData}</p>}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ================= Q3 : transfert entre epreuves ================= */}
      <section className="section analyses-act">
        <div className="container">
          <Reveal className="about-block reverse">
            <div className="about-block-chart">
              <SegmentPicker segments={data.segments} value={corrKey} onChange={setCorrKey} />
              {corrSeg?.correlations ? (
                <Heatmap
                  title={lang === 'fr' ? 'Corrélation entre épreuves' : 'Correlation between events'}
                  rows={corrSeg.correlations.labels.map((l) => (lang === 'fr' ? l : (l === 'Force' ? 'Strength' : l)))}
                  cols={corrSeg.correlations.labels.map((l) => (lang === 'fr' ? l : (l === 'Force' ? 'Strength' : l)))}
                  values={corrSeg.correlations.matrix}
                  mode="sequential"
                  labelWidth={90}
                />
              ) : <p className="chart-caption">{notEnoughData}</p>}
            </div>
            <div className="about-block-text">
              <h2 className="section-heading section-heading-tight">
                {lang === 'fr' ? 'Est-ce que travailler une épreuve se transfère sur une autre ?' : 'Does training one event transfer to another?'}
              </h2>
              <p className="question-subtitle">
                {t('answer_prefix')} : {lang === 'fr' ? 'non, sauf indirectement via le MetCon.' : 'no, except indirectly through MetCon.'}
              </p>
              <p className="about-intro-text">
                {lang === 'fr' ? (
                  <>Être fort et endurant augmente les chances d'être bon au MetCon, mais pas par
                    transfert direct : c'est le fait d'être bon en Force ET en Endurance qui rend
                    bon au MetCon, pas l'inverse. Travailler le MetCon ne rend pas plus fort ni plus
                    endurant.</>
                ) : (
                  <>Being strong and enduring increases the odds of being good at MetCon, but not
                    through direct transfer: it's being good at BOTH Strength AND Endurance that
                    makes you good at MetCon, not the other way round. Training MetCon doesn't make
                    you stronger or more enduring.</>
                )}
              </p>
              <EvidenceToggle label={lang === 'fr' ? 'Comment lire ce graphique ?' : 'How to read this chart?'}>
                <p className="about-intro-text" style={{ marginBottom: 0 }}>
                  {lang === 'fr' ? (
                    <>Plus une case est colorée foncé, plus les deux épreuves sont corrélées.
                      Au-dessus de 0.75, on peut parler d'une vraie corrélation positive ; en-dessous,
                      la case reste pâle et on ne peut rien affirmer de particulier entre ces deux
                      épreuves.</>
                  ) : (
                    <>The darker a cell, the more the two events are correlated. Above 0.75, we can
                      speak of a real positive correlation; below that, the cell stays pale and
                      nothing particular can be said about that pair of events.</>
                  )}
                </p>
              </EvidenceToggle>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ================= Q4 : evolution saisonniere ================= */}
      <section className="section analyses-act" style={{ background: 'var(--bg-panel)' }}>
        <div className="container">
          <Reveal>
            <h2 className="section-heading section-heading-tight">
              {lang === 'fr' ? 'Est-ce que les performances évoluent au cours de l\'année ?' : 'Do performances change over the course of the year?'}
            </h2>
            <p className="question-subtitle">
              {t('answer_prefix')} : {lang === 'fr'
                ? 'non, sauf une légère hausse en Force chez le Top 10, mais pas significativement croissante.'
                : "no, except a slight rise in Strength among the Top 10, though not significantly increasing."}
            </p>
          </Reveal>

          <Reveal className="analyses-chart-block">
            <div className="analyses-group-card">
              <h3>{lang === 'fr' ? 'Performance moyenne, événement par événement' : 'Average performance, event by event'}</h3>
              <p>
                {lang === 'fr' ? (
                  <>Dans l'ordre chronologique réel de la saison — plateau (tous les participants
                    du segment) contre Top 10 de chaque événement, pour voir si une éventuelle
                    progression est plutôt le fait de l'élite.</>
                ) : (
                  <>In the season's real chronological order — field (all participants in the
                    segment) versus the Top 10 of each event, to see whether any progression is
                    more of an elite effect.</>
                )}
              </p>
              <SegmentPicker segments={data.segments} value={seasKey} onChange={setSeasKey} />
              {seasSeg?.season ? (
                <div className="analyses-threeup">
                  {DISCIPLINE_SPECS.map((spec) => {
                    const series = seasSeg.season.series[spec.key]
                    const series10 = seasSeg.season.series_top10[spec.key]
                    const toV = (v) => (v == null ? null : (spec.key === 'metcon' ? secToMin(v) : v))
                    const allValues = [...series, ...series10].map((d) => toV(d.value)).filter((v) => v != null)
                    const { domain } = niceDomainTicks(Math.min(...allValues), Math.max(...allValues), spec.step)
                    const chartData = seasSeg.season.order.map((event) => {
                      const foundP = series.find((d) => d.event === event)
                      const found10 = series10.find((d) => d.event === event)
                      return { event, plateau: toV(foundP?.value), top10: toV(found10?.value) }
                    })
                    return (
                      <MultiLineChart
                        key={spec.key}
                        data={chartData} unit={spec.unit} domain={domain}
                        title={spec.label} yLabel={`${spec.label} (${SEASON_UNITS[spec.key]})`}
                        lines={[
                          { dataKey: 'plateau', name: t('plateau_avg'), color: SEASON_COLORS[spec.key] },
                          { dataKey: 'top10', name: t('top10_avg'), color: 'var(--gray-400)', dashed: true },
                        ]}
                      />
                    )
                  })}
                </div>
              ) : <p className="chart-caption">{notEnoughData}</p>}
            </div>
            <EvidenceToggle label={lang === 'fr' ? 'Comment lire ces graphiques ?' : 'How to read these charts?'}>
              <p className="about-intro-text" style={{ marginBottom: 0 }}>
                {lang === 'fr' ? (
                  <>Sur la Force, le niveau du Top 10 progresse un peu au fil de la saison, mais pas
                    le plateau, et la hausse elle-même n'est pas nettement croissante d'un événement
                    à l'autre. Sur l'Endurance et le MetCon, ni le plateau ni le Top 10 ne bougent
                    vraiment. Autrement dit, il n'y a pas de vraie dynamique de progression
                    chronologique sur la saison : un signe que le niveau de performance n'est pas
                    encore assez compétitif d'un événement à l'autre pour qu'une préparation
                    spécifique événement par événement se voie dans les chiffres.</>
                ) : (
                  <>On Strength, the Top 10's level improves a little over the season, but the field
                    doesn't, and the rise itself isn't clearly increasing from one event to the
                    next. On Endurance and MetCon, neither the field nor the Top 10 really move.
                    In other words, there's no real chronological progression dynamic over the
                    season: a sign that the level of performance isn't yet competitive enough from
                    one event to the next for event-by-event specific preparation to show up in the
                    numbers.</>
                )}
              </p>
            </EvidenceToggle>
          </Reveal>
        </div>
      </section>

      {/* ================= Q5 : ecarts entre villes ================= */}
      <section className="section analyses-act">
        <div className="container">
          <Reveal>
            <h2 className="section-heading section-heading-tight">
              {lang === 'fr' ? 'Est-ce que certains événements comportent des écarts de niveau importants ?' : 'Do some events show large gaps in level?'}
            </h2>
            <p className="question-subtitle">
              {t('answer_prefix')} : {lang === 'fr' ? 'oui, mais un sport encore trop jeune pour trancher pourquoi.' : "yes, but the sport is still too young to say why."}
            </p>
            <p className="about-intro-text">
              {lang === 'fr' ? (
                <>La variance de niveau d'une ville à l'autre est grande, à mettre en perspective
                  avec le nombre encore limité de participants par événement. Pas encore assez de
                  recul pour trancher si c'est un vrai effet ville ou juste le bruit d'un sport
                  jeune.</>
              ) : (
                <>The variance in level from one city to another is large, which should be weighed
                  against the still-limited number of participants per event. Not enough hindsight
                  yet to say whether it's a real city effect or just the noise of a young sport.</>
              )}
            </p>
          </Reveal>
          <Reveal className="analyses-chart-block">
            <SegmentPicker segments={data.segments} value={cityKey} onChange={setCityKey} />
            {citySeg?.city_heatmap ? (
              <Heatmap
                title={lang === 'fr' ? 'Écarts de niveau par ville' : 'Level gaps by city'}
                rows={citySeg.city_heatmap.rows.map((r) => r.event)}
                cols={[t('discipline_force'), t('discipline_endurance'), t('discipline_metcon')]}
                values={citySeg.city_heatmap.rows.map((r) => [r.strength_z, r.endurance_z, r.metcon_z])}
                mode="diverging"
                labelWidth={100}
              />
            ) : <p className="chart-caption">{notEnoughData}</p>}
            <EvidenceToggle label={lang === 'fr' ? 'Comment lire ce graphique ?' : 'How to read this chart?'}>
              <p className="about-intro-text" style={{ marginBottom: 0 }}>
                {lang === 'fr' ? (
                  <>Z-score par épreuve, saison {data.year}. Une case colorée en rouge/orange veut
                    dire que la ville est au-dessus de la moyenne des villes sur cette épreuve, une
                    case bleue qu'elle est en-dessous. Plus la couleur est foncée, plus l'écart est
                    grand.</>
                ) : (
                  <>Z-score per event, {data.year} season. A cell colored red/orange means the city
                    is above the average of all cities on that event, a blue cell means it's below.
                    The darker the color, the bigger the gap.</>
                )}
              </p>
            </EvidenceToggle>
          </Reveal>
        </div>
      </section>

      {/* ================= Q6 : seuils de rentabilite (derniere partie, transition Simulation) ================= */}
      <section className="section analyses-act" style={{ background: 'var(--bg-panel)' }}>
        <div className="container">
          <Reveal>
            <h2 className="section-heading">
              {lang === 'fr' ? "Jusqu'où optimiser sa performance ?" : 'How far should you optimize your performance?'}
            </h2>
          </Reveal>

          <Reveal>
            <SegmentPicker segments={data.segments} value={thrKey} onChange={setThrKey} />
            <div className="analyses-threeup">
              {DISCIPLINE_SPECS.map((spec) => {
                const th = thrSeg?.thresholds_global?.[spec.key]
                if (!th) return <p key={spec.key} className="chart-caption">{notEnoughDataShort}</p>
                const isMetcon = spec.key === 'metcon'
                const pts = isMetcon ? th.points.map((p) => ({ ...p, x: secToMin(p.x) })) : th.points
                const curve = isMetcon && th.curve ? th.curve.map((p) => ({ ...p, x: secToMin(p.x) })) : th.curve
                const threshold = th.threshold == null ? null : (isMetcon ? secToMin(th.threshold) : th.threshold)
                const dom = isMetcon ? [th.domain[0] / 60, th.domain[1] / 60] : th.domain
                const { domain, ticks } = niceDomainTicks(dom[0], dom[1], spec.step)
                return (
                  <div key={spec.key} className="about-block-chart">
                    <ScatterWithFit
                      title={spec.label}
                      points={pts} curve={curve} threshold={threshold}
                      xLabel={spec.label} xUnit={spec.unit} yLabel={t('score')} height={230}
                      xDomain={domain} xTicks={ticks} xReversed={isMetcon}
                      xTickFormatter={isMetcon ? fmtMin : undefined}
                      curveLegendLabel={curveLegendLabel} thresholdLegendLabel={thresholdLegendLabel}
                    />
                    {th.pct_au_dela != null && (
                      <p className="chart-caption">{pctBeyond(th.pct_au_dela)}</p>
                    )}
                  </div>
                )
              })}
            </div>
          </Reveal>

          <Reveal>
            <div className="about-block-text" style={{ marginTop: 32, marginBottom: 16 }}>
              <h3>{lang === 'fr' ? 'Zoom sur chaque mouvement de Force' : 'Zoom on each Strength movement'}</h3>
              <p className="about-intro-text" style={{ marginBottom: 0 }}>
                {lang === 'fr' ? (
                  <>Même méthode, appliquée cette fois au KG soulevé sur chacun des 3 mouvements de
                    Force de la saison {data.year}, comparé au total Force (les points ne sont pas
                    attribués mouvement par mouvement, seulement sur le classement Force global).</>
                ) : (
                  <>Same method, applied this time to the KG lifted on each of the 3 Strength
                    movements of the {data.year} season, compared against the total Strength score
                    (points aren't awarded movement by movement, only on the overall Strength
                    ranking).</>
                )}
              </p>
            </div>
            <div className="analyses-threeup">
              {data.force_movements.map((mv) => {
                const th = thrSeg?.thresholds_movements?.[mv]
                if (!th) return <p key={mv} className="chart-caption">{notEnoughDataShort}</p>
                const { domain, ticks } = niceDomainTicks(th.domain[0], th.domain[1], MOVEMENT_STEP[mv] || 25)
                return (
                  <div key={mv} className="about-block-chart">
                    <ScatterWithFit
                      title={mv}
                      points={th.points} curve={th.curve} threshold={th.threshold}
                      xLabel={mv} xUnit="KG" yLabel={lang === 'fr' ? 'Force totale' : 'Total Strength'} yUnit="KG" height={230}
                      xDomain={domain} xTicks={ticks} yReversed={false}
                      curveLegendLabel={curveLegendLabel} thresholdLegendLabel={thresholdLegendLabel}
                    />
                    {th.pct_au_dela != null && (
                      <p className="chart-caption">{pctBeyond(th.pct_au_dela)}</p>
                    )}
                  </div>
                )
              })}
            </div>
          </Reveal>

          <Reveal>
            <EvidenceToggle label={lang === 'fr' ? 'Comment lire ces graphiques ?' : 'How to read these charts?'}>
              <p className="about-intro-text" style={{ marginBottom: 0 }}>
                {lang === 'fr' ? (
                  <>Chaque point est un athlète. La courbe lisse la tendance réelle ; au-delà de
                    la ligne pointillée orange (le seuil), progresser sur cette épreuve rapporte de
                    moins en moins de places au classement (ou de KG sur le total Force, pour le
                    zoom par mouvement). Pour le MetCon, l'axe va du temps le plus long (à gauche) au
                    plus rapide (à droite), pour rester dans le sens "on progresse en allant vers la
                    droite" sur les trois graphiques.</>
                ) : (
                  <>Each point is one athlete. The curve smooths the real trend; beyond the
                    orange dashed line (the threshold), improving on that event yields fewer and
                    fewer ranking places (or KG on the total Strength score, for the movement zoom).
                    For MetCon, the axis runs from the longest time (left) to the fastest (right),
                    to keep "progress = moving right" true on all three charts.</>
                )}
              </p>
            </EvidenceToggle>
          </Reveal>

          <Reveal className="about-closing-text">
            {lang === 'fr' ? (
              <>En pratique : tant que vous êtes en-dessous du seuil (pointillés) sur une épreuve,
                continuer à la travailler reste très rentable en places gagnées. Une fois au-delà,
                chaque progrès supplémentaire rapporte de moins en moins. Si vous avez un point
                faible ailleurs, c'est là que le même effort rapportera le plus.</>
            ) : (
              <>In practice: as long as you're below the threshold (dashed line) on an event,
                continuing to work on it stays very profitable in places gained. Once past it, each
                extra bit of progress pays off less and less. If you have a weak point elsewhere,
                that's where the same effort will pay off the most.</>
            )}
            <br /><br />
            <Link to="/simulation" className="closing-text-link">
              {lang === 'fr' ? 'Trouver mon propre profil et mon levier prioritaire' : 'Find my own profile and priority lever'}
              <span className="btn-pill-icon">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 11L11 3M11 3H4M11 3V10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </span>
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ================= Closing ================= */}
      <section className="section analyses-act">
        <div className="container">
          <Reveal className="about-closing-text">
            {lang === 'fr' ? (
              <>
                <strong>Alors, où vous situez-vous ?</strong> Toutes ces analyses tournent autour d'une
                même conclusion : le classement se lit par épreuve, et le bon conseil dépend
                entièrement de votre profil personnel, pas d'une règle générale. La page{' '}
                <Link to="/simulation">Simulation</Link> applique exactement cette méthode à vos propres
                estimations : votre classement réel, vos points forts, vos points faibles.
              </>
            ) : (
              <>
                <strong>So, where do you stand?</strong> All these analyses circle back to the same
                conclusion: the ranking is read event by event, and the right advice depends
                entirely on your own profile, not on a general rule. The{' '}
                <Link to="/simulation">Simulation</Link> page applies exactly this method to your own
                estimates: your real ranking, your strengths, your weaknesses.
              </>
            )}
          </Reveal>

          <Reveal>
            <p className="source-line" style={{ marginTop: 32 }}>
              {lang === 'fr' ? (
                <>Toutes les analyses de cette page sont calculées à partir des résultats réels scrapés
                  sur athxgames.com (mêmes données que les classements de ce site), recalculées à
                  chaque mise à jour des données. Aucun nombre n'est saisi à la main.</>
              ) : (
                <>All analyses on this page are calculated from real results scraped from
                  athxgames.com (the same data as this site's leaderboards), recomputed on every
                  data update. No number is entered by hand.</>
              )}
            </p>
          </Reveal>
        </div>
      </section>
    </div>
  )
}
