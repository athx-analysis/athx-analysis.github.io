import { useMemo, useState } from 'react'
import { geoMercator } from 'd3-geo'
import { ComposableMap, Geographies, Geography } from 'react-simple-maps'
import { useLanguage } from '../../i18n/LanguageContext'

const GEO_URL = `${import.meta.env.BASE_URL}geo/world-110m.json`

const WIDTH = 900
const HEIGHT = 420
const PADDING = 16

// Coins (lon, lat) du cadre Atlantique Nord (États-Unis + Europe) que l'on veut voir
// remplir la carte. On calcule nous-mêmes le scale/translate à partir de ces coins
// (plutôt que via `fitExtent` + un polygone sphérique, dont le sens de rotation donne
// un résultat incorrect en Mercator ici) : pour une projection Mercator, les
// méridiens/parallèles restent des droites, donc projeter juste les 4 coins suffit.
const FOCUS_CORNERS = [
  [-125, 25],
  [42, 25],
  [42, 62],
  [-125, 62],
]

function buildProjection() {
  const raw = geoMercator().scale(1).translate([0, 0])
  const projected = FOCUS_CORNERS.map(raw)
  const xs = projected.map((p) => p[0])
  const ys = projected.map((p) => p[1])
  const x0 = Math.min(...xs), x1 = Math.max(...xs)
  const y0 = Math.min(...ys), y1 = Math.max(...ys)
  const scale = Math.min((WIDTH - 2 * PADDING) / (x1 - x0), (HEIGHT - 2 * PADDING) / (y1 - y0))
  const translate = [WIDTH / 2 - scale * (x0 + x1) / 2, HEIGHT / 2 - scale * (y0 + y1) / 2]
  return geoMercator().scale(scale).translate(translate)
}

export default function WorldMapFootprint({ countries }) {
  const { lang } = useLanguage()
  const [hovered, setHovered] = useState(null)
  const [hoveredKey, setHoveredKey] = useState(null)
  const byMapName = new Map(countries.map((c) => [c.map_name, c]))

  const projection = useMemo(buildProjection, [])

  return (
    <div className="map-card">
      <ComposableMap width={WIDTH} height={HEIGHT} projection={projection} style={{ width: '100%', height: 'auto' }}>
        <Geographies geography={GEO_URL}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const match = byMapName.get(geo.properties.name)
              const isHovered = hoveredKey === geo.rsmKey
              // react-simple-maps v5 : Geography est un simple <path> SVG, pas de
              // style imbriqué {default,hover,pressed} (ça, c'était l'API v1-3) —
              // on passe `fill` directement et on gère le survol nous-mêmes via state.
              const fill = match ? (isHovered ? '#ff6a52' : '#ff2d20') : (isHovered ? '#d8d8d8' : '#e9e9e9')
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={fill}
                  stroke="#ffffff"
                  strokeWidth={0.8}
                  style={{ outline: 'none', cursor: match ? 'pointer' : 'default', transition: 'fill 0.15s ease' }}
                  onMouseEnter={() => {
                    setHoveredKey(geo.rsmKey)
                    if (match) setHovered(match)
                  }}
                  onMouseLeave={() => {
                    setHoveredKey(null)
                    setHovered(null)
                  }}
                />
              )
            })
          }
        </Geographies>
      </ComposableMap>

      <div className="map-info-panel">
        {hovered ? (
          <>
            <strong>{hovered.country}</strong>
            <span className="map-info-cities">
              {hovered.cities.map((city) => city.name).join(', ')}
            </span>
          </>
        ) : (
          <span className="muted">
            {lang === 'fr'
              ? 'Survolez un pays en rouge pour voir les villes (disputées ou à venir)'
              : 'Hover a country in red to see its cities (held or upcoming)'}
          </span>
        )}
      </div>
    </div>
  )
}
