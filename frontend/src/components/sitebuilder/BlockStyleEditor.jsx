import { SPACING_MAP, RADIUS_MAP, GRADIENT_PRESETS, ANIMATION_OPTIONS } from './blockStyleUtils.jsx';

function StyleSection({ title, children }) {
  return (
    <div className="border-b border-gray-100 last:border-0 px-4 py-3 space-y-2.5">
      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{title}</p>
      {children}
    </div>
  );
}

function StyleLabel({ children }) {
  return <label className="block text-[11px] font-medium text-gray-500 mb-1">{children}</label>;
}

function ColorInput({ value, onChange, placeholder = '#ffffff' }) {
  return (
    <div className="flex gap-2 items-center">
      <input
        type="color"
        value={value || '#ffffff'}
        onChange={(e) => onChange(e.target.value)}
        className="w-8 h-8 rounded-lg border border-gray-200 cursor-pointer p-0.5"
      />
      <input
        type="text"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 px-2.5 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="text-[10px] text-gray-400 hover:text-red-400 bg-transparent border-none cursor-pointer"
        >
          x
        </button>
      )}
    </div>
  );
}

function ButtonGroup({ options, value, onChange }) {
  return (
    <div className="flex bg-gray-100 rounded-lg p-0.5 gap-0.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`flex-1 px-2 py-1.5 text-[10px] font-medium rounded-md transition-all cursor-pointer border-none ${
            value === opt.value
              ? 'bg-white shadow-sm text-gray-800'
              : 'text-gray-400 hover:text-gray-600 bg-transparent'
          }`}
          title={opt.label}
        >
          {opt.short || opt.label}
        </button>
      ))}
    </div>
  );
}

const SPACING_OPTIONS = [
  { value: 'none', label: 'Aucun', short: '0' },
  { value: 'sm', label: 'Petit', short: 'S' },
  { value: 'md', label: 'Moyen', short: 'M' },
  { value: 'lg', label: 'Grand', short: 'L' },
  { value: 'xl', label: 'Très grand', short: 'XL' },
];

const RADIUS_OPTIONS = [
  { value: 'none', label: 'Aucun', short: '—' },
  { value: 'sm', label: 'Petit', short: '◰' },
  { value: 'md', label: 'Moyen', short: '◳' },
  { value: 'lg', label: 'Grand', short: '⬡' },
  { value: 'full', label: 'Rond', short: '●' },
];

const VISIBILITY_OPTIONS = [
  { value: 'all', label: 'Tous' },
  { value: 'desktop-only', label: 'Desktop' },
  { value: 'mobile-only', label: 'Mobile' },
];

export default function BlockStyleEditor({ styles, onChange }) {
  const s = styles || {};
  const update = (key, val) => onChange({ ...s, [key]: val });

  return (
    <div>
      {/* Background */}
      <StyleSection title="Arrière-plan">
        <StyleLabel>Couleur</StyleLabel>
        <ColorInput value={s.backgroundColor} onChange={(v) => update('backgroundColor', v)} />

        <StyleLabel>Dégradé</StyleLabel>
        <div className="grid grid-cols-3 gap-1.5">
          {GRADIENT_PRESETS.map((g) => (
            <button
              key={g.label}
              onClick={() => update('backgroundGradient', g.value)}
              className={`h-8 rounded-lg border-2 cursor-pointer transition-all ${
                s.backgroundGradient === g.value ? 'border-[var(--color-primary)] scale-105' : 'border-gray-200'
              }`}
              style={{ background: g.value || '#f9fafb' }}
              title={g.label}
            />
          ))}
        </div>

        <StyleLabel>Image de fond</StyleLabel>
        <input
          type="text"
          value={s.backgroundImage || ''}
          onChange={(e) => update('backgroundImage', e.target.value)}
          placeholder="https://..."
          className="w-full px-2.5 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
        />

        <StyleLabel>Overlay</StyleLabel>
        <ColorInput value={s.backgroundOverlay} onChange={(v) => update('backgroundOverlay', v)} placeholder="rgba(0,0,0,0.3)" />
      </StyleSection>

      {/* Spacing */}
      <StyleSection title="Espacement">
        <StyleLabel>Padding haut</StyleLabel>
        <ButtonGroup options={SPACING_OPTIONS} value={s.paddingTop || 'none'} onChange={(v) => update('paddingTop', v)} />

        <StyleLabel>Padding bas</StyleLabel>
        <ButtonGroup options={SPACING_OPTIONS} value={s.paddingBottom || 'none'} onChange={(v) => update('paddingBottom', v)} />

        <StyleLabel>Marge haute</StyleLabel>
        <ButtonGroup options={SPACING_OPTIONS} value={s.marginTop || 'none'} onChange={(v) => update('marginTop', v)} />

        <StyleLabel>Marge basse</StyleLabel>
        <ButtonGroup options={SPACING_OPTIONS} value={s.marginBottom || 'none'} onChange={(v) => update('marginBottom', v)} />
      </StyleSection>

      {/* Border radius */}
      <StyleSection title="Bordures">
        <StyleLabel>Arrondi</StyleLabel>
        <ButtonGroup options={RADIUS_OPTIONS} value={s.borderRadius || 'none'} onChange={(v) => update('borderRadius', v)} />
      </StyleSection>

      {/* Animation */}
      <StyleSection title="Animation">
        <StyleLabel>Animation au scroll</StyleLabel>
        <select
          value={s.animation || 'none'}
          onChange={(e) => update('animation', e.target.value)}
          className="w-full px-2.5 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none"
        >
          {ANIMATION_OPTIONS.map((a) => (
            <option key={a.value} value={a.value}>{a.label}</option>
          ))}
        </select>
      </StyleSection>

      {/* Visibility */}
      <StyleSection title="Visibilité">
        <ButtonGroup options={VISIBILITY_OPTIONS} value={s.visibility || 'all'} onChange={(v) => update('visibility', v)} />
      </StyleSection>

      {/* Advanced */}
      <StyleSection title="Avancé">
        <label className="flex items-center justify-between cursor-pointer py-1">
          <span className="text-xs text-gray-600">Pleine largeur</span>
          <button
            type="button"
            onClick={() => update('fullWidth', !s.fullWidth)}
            className={`relative w-10 h-5.5 rounded-full transition-colors cursor-pointer border-none ${s.fullWidth ? 'bg-[var(--color-primary)]' : 'bg-gray-200'}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-4.5 h-4.5 bg-white rounded-full shadow-sm transition-transform ${s.fullWidth ? 'translate-x-[18px]' : 'translate-x-0'}`} />
          </button>
        </label>

        <StyleLabel>Classe CSS</StyleLabel>
        <input
          type="text"
          value={s.customClass || ''}
          onChange={(e) => update('customClass', e.target.value)}
          placeholder="ma-classe-custom"
          className="w-full px-2.5 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
        />
      </StyleSection>
    </div>
  );
}
