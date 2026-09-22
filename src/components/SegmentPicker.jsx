import { useLanguage } from '../i18n/LanguageContext'

// Selecteur de segment (Femme/Homme x ATHX/ATHX Pro, + Team Femme/Homme/Mixte x ATHX/ATHX Pro)
// -- liste deroulante native, reutilisee dans chaque bloc de la page Analyses qui doit
// s'adapter au segment choisi (le graphique change en fonction du segment). Les libelles de
// segment viennent du JSON (toujours en francais, cote Python) -- traduits ici via le
// dictionnaire (cle `seg_<segment.key>`) plutot que de regenerer le JSON en 2 langues.
export default function SegmentPicker({ segments, value, onChange, label, style }) {
  const { t } = useLanguage()
  return (
    <label className="segment-picker" style={style}>
      <span>{label || t('category')}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        <optgroup label={t('individual_group')}>
          {segments.filter((s) => s.kind === 'individual').map((s) => (
            <option key={s.key} value={s.key}>{t(`seg_${s.key}`)}</option>
          ))}
        </optgroup>
        <optgroup label={t('team_group')}>
          {segments.filter((s) => s.kind === 'team').map((s) => (
            <option key={s.key} value={s.key}>{t(`seg_${s.key}`)}</option>
          ))}
        </optgroup>
      </select>
    </label>
  )
}
