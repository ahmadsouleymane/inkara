import { getButtonClass, getButtonStyle, getCardClass } from './useGlobalStyles.js';

function Label({ children }) {
  return <p className="text-[11px] font-medium text-gray-500 mb-1.5">{children}</p>;
}

function OptionButtons({ options, value, onChange }) {
  return (
    <div className="flex bg-gray-100 rounded-lg p-0.5 gap-0.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`flex-1 px-2 py-1.5 text-[10px] font-medium rounded-md transition-all cursor-pointer border-none ${
            value === opt.value ? 'bg-white shadow-sm text-gray-800' : 'text-gray-400 hover:text-gray-600 bg-transparent'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="border-b border-gray-100 last:border-0 px-4 py-4 space-y-3">
      <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">{title}</p>
      {children}
    </div>
  );
}

export default function GlobalStylesEditor({ theme, onChange }) {
  const gs = theme?.globalStyles || {};
  const buttons = gs.buttons || {};
  const cards = gs.cards || {};
  const sections = gs.sections || {};

  const update = (section, key, val) => {
    onChange({
      ...theme,
      globalStyles: {
        ...gs,
        [section]: { ...gs[section], [key]: val },
      },
    });
  };

  return (
    <div>
      {/* Buttons */}
      <Section title="Boutons">
        <Label>Forme</Label>
        <OptionButtons
          options={[
            { value: 'none', label: '▭' },
            { value: 'sm', label: '◰' },
            { value: 'md', label: '◳' },
            { value: 'lg', label: '⬡' },
            { value: 'full', label: '●' },
          ]}
          value={buttons.borderRadius || 'md'}
          onChange={(v) => update('buttons', 'borderRadius', v)}
        />

        <Label>Taille</Label>
        <OptionButtons
          options={[
            { value: 'sm', label: 'Petit' },
            { value: 'md', label: 'Moyen' },
            { value: 'lg', label: 'Grand' },
          ]}
          value={buttons.size || 'md'}
          onChange={(v) => update('buttons', 'size', v)}
        />

        <Label>Style</Label>
        <OptionButtons
          options={[
            { value: 'filled', label: 'Plein' },
            { value: 'outline', label: 'Contour' },
            { value: 'ghost', label: 'Fantôme' },
          ]}
          value={buttons.style || 'filled'}
          onChange={(v) => update('buttons', 'style', v)}
        />

        <Label>Effet survol</Label>
        <OptionButtons
          options={[
            { value: 'darken', label: 'Assombrir' },
            { value: 'lighten', label: 'Éclaircir' },
            { value: 'scale', label: 'Grossir' },
            { value: 'shadow', label: 'Ombre' },
          ]}
          value={buttons.hoverEffect || 'darken'}
          onChange={(v) => update('buttons', 'hoverEffect', v)}
        />

        {/* Live preview */}
        <div className="pt-2">
          <Label>Aperçu</Label>
          <div className="flex gap-2">
            <button
              className={getButtonClass(theme)}
              style={getButtonStyle(theme)}
            >
              Bouton primaire
            </button>
          </div>
        </div>
      </Section>

      {/* Cards */}
      <Section title="Cartes">
        <Label>Arrondi</Label>
        <OptionButtons
          options={[
            { value: 'none', label: '▭' },
            { value: 'sm', label: '◰' },
            { value: 'md', label: '◳' },
            { value: 'lg', label: '⬡' },
            { value: 'xl', label: '◉' },
          ]}
          value={cards.borderRadius || 'lg'}
          onChange={(v) => update('cards', 'borderRadius', v)}
        />

        <Label>Ombre</Label>
        <OptionButtons
          options={[
            { value: 'none', label: 'Aucune' },
            { value: 'sm', label: 'Légère' },
            { value: 'md', label: 'Moyenne' },
            { value: 'lg', label: 'Forte' },
          ]}
          value={cards.shadow || 'sm'}
          onChange={(v) => update('cards', 'shadow', v)}
        />

        <label className="flex items-center justify-between cursor-pointer py-1">
          <span className="text-xs text-gray-600">Bordure</span>
          <button
            type="button"
            onClick={() => update('cards', 'border', !(cards.border !== false))}
            className={`relative w-10 h-5.5 rounded-full transition-colors cursor-pointer border-none ${cards.border !== false ? 'bg-[var(--color-primary)]' : 'bg-gray-200'}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-4.5 h-4.5 bg-white rounded-full shadow-sm transition-transform ${cards.border !== false ? 'translate-x-[18px]' : 'translate-x-0'}`} />
          </button>
        </label>

        {/* Card preview */}
        <div className="pt-2">
          <Label>Aperçu</Label>
          <div className={getCardClass(theme) + ' p-4'}>
            <div className="h-3 w-2/3 bg-gray-200 rounded mb-2" />
            <div className="h-2 w-full bg-gray-100 rounded mb-1" />
            <div className="h-2 w-4/5 bg-gray-100 rounded" />
          </div>
        </div>
      </Section>

      {/* Sections */}
      <Section title="Sections">
        <Label>Espacement par défaut</Label>
        <OptionButtons
          options={[
            { value: 'sm', label: 'Compact' },
            { value: 'md', label: 'Normal' },
            { value: 'lg', label: 'Aéré' },
            { value: 'xl', label: 'Spacieux' },
          ]}
          value={sections.defaultSpacing || 'md'}
          onChange={(v) => update('sections', 'defaultSpacing', v)}
        />

        <Label>Largeur max</Label>
        <OptionButtons
          options={[
            { value: 'narrow', label: 'Étroit' },
            { value: 'default', label: 'Normal' },
            { value: 'wide', label: 'Large' },
            { value: 'full', label: 'Plein' },
          ]}
          value={sections.maxWidth || 'default'}
          onChange={(v) => update('sections', 'maxWidth', v)}
        />
      </Section>
    </div>
  );
}
