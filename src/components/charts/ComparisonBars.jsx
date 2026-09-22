import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Cell, LabelList } from 'recharts'

const ATHX_COLOR = '#ff2d20'
const HYROX_COLOR = '#4a5565'

function formatNumber(n) {
  // Number(n) au cas ou la valeur arrive en string (String.prototype.toLocaleString
  // ne regroupe pas les milliers, contrairement a Number.prototype.toLocaleString).
  // Regroupement manuel par espace normale (plus fiable au rendu SVG que l'espace
  // insecable renvoyee par toLocaleString).
  const s = Math.round(Number(n)).toString()
  return s.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

function renderValueLabel({ x, y, width, height, value }) {
  // Rendu manuel plutot que `formatter` + le <Text> interne de recharts : ce dernier
  // decoupe le texte en "mots" pour son retour a la ligne automatique et ne remet pas
  // d'espace entre eux au rendu -> "1500000" au lieu de "1 500 000". Un <text> simple
  // avec le texte forme en enfant JSX garde l'espace intact.
  return (
    <text x={x + width + 10} y={y + height / 2} dy={4} fill="#0a0a0a" fontWeight={700} fontSize={13}>
      {formatNumber(value)}
    </text>
  )
}

// Un mini bar-chart ATHX vs HYROX pour UNE métrique (chaque métrique garde sa propre
// échelle : les ordres de grandeur sont trop différents pour un graphe unique). Pas de
// tooltip au survol -- la valeur est déjà affichée en clair au bout de chaque barre.
export default function ComparisonBars({ label, athxValue, hyroxValue, athxCaption, hyroxCaption }) {
  const data = [
    { name: athxCaption, value: athxValue, fill: ATHX_COLOR },
    { name: hyroxCaption, value: hyroxValue, fill: HYROX_COLOR },
  ]
  return (
    <div className="comparison-card">
      <p className="comparison-label">{label}</p>
      <ResponsiveContainer width="100%" height={150}>
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 76, left: 4, bottom: 4 }}>
          <XAxis type="number" hide />
          <YAxis type="category" dataKey="name" width={110} tick={{ fill: '#3a3f47', fontSize: 12 }} axisLine={false} tickLine={false} />
          <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={26} isAnimationActive={false}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.fill} />
            ))}
            <LabelList dataKey="value" content={renderValueLabel} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
