import { Link } from 'react-router-dom'
import AthxLogo from '../components/AthxLogo'
import Reveal from '../components/Reveal'
import TrendChart from '../components/charts/TrendChart'
import WorldMapFootprint from '../components/charts/WorldMapFootprint'
import ComparisonBars from '../components/charts/ComparisonBars'
import RankedBarChart from '../components/charts/RankedBarChart'
import stats from '../data/site_stats.json'
import analyses from '../data/analyses_data.json'
import { useLanguage } from '../i18n/LanguageContext'

const COUNTRY_NAME = {
  fr: {
    Denmark: 'Danemark', France: 'France', Germany: 'Allemagne', Ireland: 'Irlande',
    Italy: 'Italie', Spain: 'Espagne', 'United States': 'les États-Unis', 'United Kingdom': 'le Royaume-Uni',
    Netherlands: 'les Pays-Bas', Portugal: 'le Portugal',
  },
  en: {
    Denmark: 'Denmark', France: 'France', Germany: 'Germany', Ireland: 'Ireland',
    Italy: 'Italy', Spain: 'Spain', 'United States': 'the United States', 'United Kingdom': 'the United Kingdom',
    Netherlands: 'the Netherlands', Portugal: 'Portugal',
  },
}
const ARROW = (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 11L11 3M11 3H4M11 3V10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
)

export default function Home() {
  const { lang } = useLanguage()
  const fmt = (n) => n.toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US')
  const toCountryName = (c) => COUNTRY_NAME[lang][c] || c

  const {
    events_per_year, countries_per_year, participants_per_year, current_footprint,
    comparison, events_2026_planned_total, events_2027_planned,
    events_2027_europe, events_2027_north_america_cities,
  } = stats

  const firstYear = events_per_year[0]
  const lastYear = events_per_year[events_per_year.length - 1]
  const firstCountries = countries_per_year[0]
  const lastCountries = countries_per_year[countries_per_year.length - 1]
  const firstParticipants = participants_per_year[0]
  const lastParticipants = participants_per_year[participants_per_year.length - 1]

  const otherCountries = lastCountries.list.filter((c) => c !== 'United Kingdom')

  const lastYearPlanned = events_2026_planned_total ?? lastYear.events
  const eventsData = events_per_year.map((d) => ({
    year: d.year,
    events: d.year === lastYear.year ? lastYearPlanned : d.events,
  }))
  const participantsData = participants_per_year.map((d) => ({ year: d.year, participants: d.total }))

  const { athx, hyrox } = comparison
  const { fidelity } = analyses

  return (
    <>
      <section className="hero">
        <div className="container">
          <AthxLogo color="#ffffff" className="hero-logo" />
          <h1>{lang === 'fr' ? 'Un sport en plein essor, malgré une grosse concurrence' : 'A sport on the rise, despite fierce competition'}</h1>
          <p>
            {lang === 'fr' ? (
              <>Les ATHX Games ont été créés en {firstYear.year}. Depuis, la trajectoire ne s'est jamais
                inversée : plus d'événements, dans plus de pays, avec plus d'athlètes sur la ligne
                de départ à chaque nouvelle saison.</>
            ) : (
              <>The ATHX Games were founded in {firstYear.year}. Since then, the trajectory has never
                reversed: more events, in more countries, with more athletes on the start line every
                new season.</>
            )}
          </p>
        </div>
      </section>

      <section className="section section-flush">
        <div className="container">
          <Reveal className="about-block">
            <div className="about-block-text">
              <h3>{lang === 'fr' ? 'Un engouement qui se lit dans les chiffres de participation' : 'A momentum you can read in the participation numbers'}</h3>
              <p>
                {lang === 'fr' ? (
                  <>Conséquence directe de cette expansion : le nombre d'athlètes sur la ligne de
                    départ a explosé, passant de {fmt(firstParticipants.total)} participants en{' '}
                    {firstParticipants.year} à {fmt(lastParticipants.total)} en {lastParticipants.year}
                    {' '}(multiplication par {(lastParticipants.total / firstParticipants.total).toFixed(1)}).</>
                ) : (
                  <>A direct consequence of this expansion: the number of athletes on the start line has
                    exploded, going from {fmt(firstParticipants.total)} participants in {firstParticipants.year}
                    {' '}to {fmt(lastParticipants.total)} in {lastParticipants.year}
                    {' '}(a ×{(lastParticipants.total / firstParticipants.total).toFixed(1)} increase).</>
                )}
              </p>
            </div>
            <div className="about-block-chart">
              <TrendChart
                data={participantsData} dataKey="participants" unit="participants" color="#155dfc"
                title={lang === 'fr' ? 'Participants par saison' : 'Participants per season'}
                yLabel={lang === 'fr' ? 'Nombre de participants' : 'Number of participants'}
              />
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section section-flush" style={{ background: 'var(--bg-panel)' }}>
        <div className="container">
          <Reveal className="about-block reverse">
            <div className="about-block-text">
              <h3>{lang === 'fr' ? 'Un calendrier qui s\'étoffe chaque saison' : 'A calendar that grows every season'}</h3>
              <ul className="about-bullet-list">
                <li>
                  {lang === 'fr' ? (
                    <>{firstYear.events} événements disputés en {firstYear.year}, contre{' '}
                      <strong>{lastYearPlanned} événements</strong> en {lastYear.year}{' '}
                      (croissance ×{(lastYearPlanned / firstYear.events).toFixed(1)} en {lastYear.year - firstYear.year} ans)</>
                  ) : (
                    <>{firstYear.events} events held in {firstYear.year}, versus{' '}
                      <strong>{lastYearPlanned} events</strong> in {lastYear.year}{' '}
                      (×{(lastYearPlanned / firstYear.events).toFixed(1)} growth in {lastYear.year - firstYear.year} years)</>
                  )}
                </li>
                <li>
                  {lang === 'fr' ? (
                    <><strong>{events_2027_planned} événements</strong> déjà programmés pour {lastYear.year + 1}{' '}
                      ({events_2027_europe} en Europe, {events_2027_north_america_cities?.length} en Amérique du Nord)</>
                  ) : (
                    <><strong>{events_2027_planned} events</strong> already scheduled for {lastYear.year + 1}{' '}
                      ({events_2027_europe} in Europe, {events_2027_north_america_cities?.length} in North America)</>
                  )}
                </li>
              </ul>
            </div>
            <div className="about-block-chart">
              <TrendChart
                data={eventsData}
                dataKey="events"
                unit={lang === 'fr' ? 'événements' : 'events'}
                color="#ff2d20"
                forecast={{ year: lastYear.year + 1, value: events_2027_planned }}
                title={lang === 'fr' ? 'Événements par saison' : 'Events per season'}
                yLabel={lang === 'fr' ? "Nombre d'événements" : 'Number of events'}
              />
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section section-flush">
        <div className="container">
          <Reveal className="about-block">
            <div className="about-block-text">
              <h3>{lang === 'fr' ? "D'une compétition 100 % britannique à un circuit mondial" : 'From an all-British competition to a global circuit'}</h3>
              <p>
                {lang === 'fr' ? (
                  <>Né au Royaume-Uni, où se sont déroulées les toutes premières éditions, ATHX
                    s'est ensuite exporté à l'international : {firstCountries.countries} pays
                    {' '}en {firstCountries.year}, contre {lastCountries.countries} aujourd'hui.
                    {otherCountries.length > 0 && (
                      <> Le circuit s'est depuis étendu à {otherCountries.map(toCountryName).join(', ')}.</>
                    )}</>
                ) : (
                  <>Born in the UK, where the very first editions took place, ATHX later went
                    international: {firstCountries.countries} countries in {firstCountries.year}, versus
                    {' '}{lastCountries.countries} today.
                    {otherCountries.length > 0 && (
                      <> The circuit has since expanded to {otherCountries.map(toCountryName).join(', ')}.</>
                    )}</>
                )}
              </p>
            </div>
            <div className="about-block-chart">
              <WorldMapFootprint countries={current_footprint.countries} />
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section section-flush" style={{ background: 'var(--bg-panel)' }}>
        <div className="container">
          <Reveal className="about-block reverse">
            <div className="about-block-text">
              <h3>{lang === 'fr' ? 'Le sport construit-il son image de marque avec des athlètes phares ?' : 'Is the sport building its brand with star athletes?'}</h3>
              <p className="question-subtitle">{lang === 'fr' ? "Réponse : oui, surtout du côté de l'élite." : 'Answer: yes, especially among the elite.'}</p>
              <p>
                {lang === 'fr' ? (
                  <>Sur l'ensemble des participants (2025 et 2026), <strong>{fidelity.overall_return_rate}%</strong>{' '}
                    reviennent faire un ATHX : un taux de fidélisation qui n'est déjà pas négligeable
                    pour un sport aussi jeune. Et en ne regardant que le Top 10 de chaque événement
                    (toutes catégories confondues : femmes, hommes, ATHX, ATHX Pro), ce taux grimpe à
                    {' '}<strong>{fidelity.elite_return_rate}%</strong>, soit un quart des athlètes : un signal positif
                    pour construire un circuit avec des têtes d'affiche récurrentes, à la HYROX.</>
                ) : (
                  <>Across all participants (2025 and 2026), <strong>{fidelity.overall_return_rate}%</strong>{' '}
                    come back to do another ATHX : a retention rate that's far from negligible for
                    such a young sport. And looking only at the Top 10 of each event (all categories
                    combined: women, men, ATHX, ATHX Pro), that rate climbs to{' '}
                    <strong>{fidelity.elite_return_rate}%</strong>, or one in four athletes: a positive signal
                    for building a circuit with recurring headline names, the way HYROX has.</>
                )}
              </p>
            </div>
            <div className="about-block-chart">
              <RankedBarChart
                data={[
                  { name: lang === 'fr' ? 'Population générale' : 'General population', value: fidelity.overall_return_rate, color: 'var(--blue)' },
                  { name: lang === 'fr' ? 'Élite (Top 10)' : 'Elite (Top 10)', value: fidelity.elite_return_rate, color: 'var(--accent)' },
                ]}
                unit="%" height={150}
                title={lang === 'fr' ? 'Athlètes revenus faire un second ATHX' : 'Athletes who came back for another ATHX'}
                xLabel={lang === 'fr' ? 'Taux de retour (%)' : 'Return rate (%)'}
              />
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <Reveal>
            <p className="section-title">{lang === 'fr' ? 'La concurrence' : 'The competition'}</p>
            <h2 className="section-heading" style={{ marginBottom: 24 }}>
              {lang === 'fr' ? 'Face à un mastodonte déjà bien installé : HYROX' : 'Up against an established giant: HYROX'}
            </h2>
            <p className="about-intro-text">
              {lang === 'fr' ? (
                <>ATHX n'évolue pas seul sur ce marché. HYROX, lancé plusieurs années plus tôt,
                  a déjà atteint une échelle largement supérieure. La comparaison, saison
                  {' '}{athx.year} d'ATHX contre saison {hyrox.season_label} d'HYROX, ne laisse aucun doute
                  sur l'ampleur de l'écart :</>
              ) : (
                <>ATHX isn't alone in this market. HYROX, launched several years earlier, has already
                  reached a much larger scale. Comparing ATHX's {athx.year} season against HYROX's
                  {' '}{hyrox.season_label} season leaves no doubt about the size of the gap:</>
              )}
            </p>
          </Reveal>

          <Reveal>
            <div className="comparison-grid">
              <ComparisonBars
                label={lang === 'fr' ? 'Pays' : 'Countries'}
                athxValue={athx.countries}
                hyroxValue={hyrox.countries}
                athxCaption={`ATHX ${athx.year}`}
                hyroxCaption={`HYROX ${hyrox.season_label}`}
              />
              <ComparisonBars
                label={lang === 'fr' ? 'Événements' : 'Events'}
                athxValue={athx.events}
                hyroxValue={hyrox.events}
                athxCaption={`ATHX ${athx.year}`}
                hyroxCaption={`HYROX ${hyrox.season_label}`}
              />
              <ComparisonBars
                label={lang === 'fr' ? 'Participants moyens / événement' : 'Average participants / event'}
                athxValue={athx.avg_participants_per_event}
                hyroxValue={hyrox.avg_participants_per_event}
                athxCaption={`ATHX ${athx.year}`}
                hyroxCaption={`HYROX ${hyrox.season_label}`}
              />
              <ComparisonBars
                label={lang === 'fr' ? 'Participants' : 'Participants'}
                athxValue={athx.participants}
                hyroxValue={hyrox.participants}
                athxCaption={`ATHX ${athx.year}`}
                hyroxCaption={`HYROX ${hyrox.season_label}`}
              />
            </div>
          </Reveal>

          <Reveal>
            <p className="about-intro-text">
              {lang === 'fr' ? (
                <>Ramené à l'échelle d'un seul événement, l'écart est tout aussi parlant : un event
                  HYROX accueille en moyenne {(hyrox.avg_participants_per_event / athx.avg_participants_per_event).toFixed(1)}x
                  {' '}plus de participants qu'un event ATHX ({fmt(hyrox.avg_participants_per_event)} contre{' '}
                  {fmt(Math.round(athx.avg_participants_per_event))} en moyenne).</>
              ) : (
                <>Scaled down to a single event, the gap is just as telling: a HYROX event welcomes on
                  average {(hyrox.avg_participants_per_event / athx.avg_participants_per_event).toFixed(1)}x
                  {' '}more participants than an ATHX event ({fmt(hyrox.avg_participants_per_event)} versus{' '}
                  {fmt(Math.round(athx.avg_participants_per_event))} on average).</>
              )}
            </p>

            <ul className="source-line source-bullet-list">
              <li>
                {lang === 'fr' ? (
                  <>Chiffres ATHX calculés à partir des données scrapées sur le{' '}
                    <a href="https://athxgames.com" target="_blank" rel="noreferrer">site officiel ATHX Games</a>
                    {' '}(<a href="https://athxgames.com/individual-leaderboards" target="_blank" rel="noreferrer">leaderboard</a>).</>
                ) : (
                  <>ATHX figures calculated from data scraped on the{' '}
                    <a href="https://athxgames.com" target="_blank" rel="noreferrer">official ATHX Games website</a>
                    {' '}(<a href="https://athxgames.com/individual-leaderboards" target="_blank" rel="noreferrer">leaderboard</a>).</>
                )}
              </li>
              <li>
                {lang === 'fr' ? 'Chiffres HYROX : ' : 'HYROX figures: '}
                {hyrox.sources.map((s, i) => (
                  <span key={s.url}>
                    <a href={s.url} target="_blank" rel="noreferrer">{s.label}</a>
                    {i < hyrox.sources.length - 1 ? ', ' : ''}
                  </span>
                ))}
                .
              </li>
            </ul>

            <p className="about-closing-text">
              {lang === 'fr' ? (
                <>L'écart est immense, mais c'est justement ce qui rend ATHX intéressant à suivre :
                  un marché jeune, en forte croissance, sur lequel il reste tout à construire. Si la
                  trajectoire actuelle se confirme, le nombre d'athlètes comme le niveau de
                  performance devraient continuer de grimper ensemble dans les années à venir. C'est
                  pourquoi l'optimisation de sa performance et de sa programmation va prendre une
                  place de plus en plus importante, saison après saison.</>
              ) : (
                <>The gap is huge, but that's exactly what makes ATHX interesting to follow: a young,
                  fast-growing market where everything is still to be built. If the current
                  trajectory holds, both the number of athletes and the level of performance should
                  keep climbing together in the years ahead. That's why optimizing performance and
                  programming will matter more and more, season after season.</>
              )}
              <br /><br />
              <Link to="/analyses" className="closing-text-link">
                {lang === 'fr' ? 'Voir ce que les données racontent déjà' : 'See what the data already shows'}
                <span className="btn-pill-icon">{ARROW}</span>
              </Link>
            </p>
          </Reveal>
        </div>
      </section>
    </>
  )
}
