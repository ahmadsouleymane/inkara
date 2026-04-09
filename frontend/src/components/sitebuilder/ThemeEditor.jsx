import { Palette, Type, Monitor, Navigation, ChevronRight, Paintbrush, PanelTop, PanelBottom } from 'lucide-react';
import { useState } from 'react';
import GlobalStylesEditor from './GlobalStylesEditor.jsx';
import HeaderEditor from './HeaderEditor.jsx';
import FooterEditor from './FooterEditor.jsx';

const TEMPLATES = [
  { id: 'classic', label: 'Classique', description: 'Traditionnel et élégant', emoji: '📚' },
  { id: 'modern', label: 'Moderne', description: 'Épuré et contemporain', emoji: '✨' },
  { id: 'minimal', label: 'Minimal', description: 'Simple et lisible', emoji: '🎯' },
  { id: 'academic', label: 'Académique', description: 'Formel et institutionnel', emoji: '🎓' },
];

const FONT_OPTIONS = [
  'Inter', 'Roboto', 'Lora', 'Playfair Display', 'Merriweather', 'Open Sans', 'Montserrat', 'Source Serif Pro',
];

const COLOR_PRESETS = [
  { name: 'Émeraude', colors: { primary: '#10b981', secondary: '#6366f1', accent: '#f59e0b', background: '#ffffff', text: '#1a1a1a' } },
  { name: 'Océan', colors: { primary: '#3b82f6', secondary: '#8b5cf6', accent: '#06b6d4', background: '#ffffff', text: '#1e293b' } },
  { name: 'Corail', colors: { primary: '#f43f5e', secondary: '#ec4899', accent: '#f97316', background: '#ffffff', text: '#1a1a1a' } },
  { name: 'Sombre', colors: { primary: '#8b5cf6', secondary: '#6366f1', accent: '#14b8a6', background: '#0f172a', text: '#f1f5f9' } },
];

function Section({ title, icon: Icon, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-100">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 px-4 cursor-pointer bg-transparent border-none text-left"
      >
        <span className="flex items-center gap-2 text-xs font-bold text-gray-700 uppercase tracking-wide">
          {Icon && <Icon className="w-3.5 h-3.5 text-gray-400" />}
          {title}
        </span>
        <ChevronRight className={`w-3.5 h-3.5 text-gray-400 transition-transform ${open ? 'rotate-90' : ''}`} />
      </button>
      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}

function ColorField({ label, value, onChange }) {
  return (
    <div className="flex items-center gap-3 py-1">
      <div className="relative">
        <input
          type="color"
          value={value || '#000000'}
          onChange={(e) => onChange(e.target.value)}
          className="w-9 h-9 rounded-xl border-2 border-gray-200 cursor-pointer p-0.5 appearance-none"
          style={{ backgroundColor: value || '#000000' }}
        />
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-[10px] text-gray-400 ml-2 font-mono">{value}</span>
      </div>
    </div>
  );
}

export default function ThemeEditor({ theme, onChange }) {
  const updateField = (path, value) => {
    const keys = path.split('.');
    const newTheme = { ...theme };
    let obj = newTheme;
    for (let i = 0; i < keys.length - 1; i++) {
      obj[keys[i]] = { ...obj[keys[i]] };
      obj = obj[keys[i]];
    }
    obj[keys[keys.length - 1]] = value;
    onChange(newTheme);
  };

  const applyColorPreset = (preset) => {
    const newTheme = { ...theme, colors: { ...preset.colors } };
    onChange(newTheme);
  };

  return (
    <div>
      {/* Template */}
      <Section title="Template" icon={Monitor}>
        <div className="grid grid-cols-2 gap-2">
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              onClick={() => updateField('template', t.id)}
              className={`p-3 rounded-xl border-2 text-left transition-all cursor-pointer bg-white ${
                theme.template === t.id
                  ? 'border-[var(--color-primary)] shadow-sm'
                  : 'border-gray-100 hover:border-gray-200'
              }`}
            >
              <span className="text-lg mb-1 block">{t.emoji}</span>
              <p className="text-xs font-semibold text-gray-700">{t.label}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{t.description}</p>
            </button>
          ))}
        </div>
      </Section>

      {/* Colors */}
      <Section title="Couleurs" icon={Palette}>
        {/* Presets */}
        <div className="mb-4">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Palettes prédéfinies</p>
          <div className="flex gap-2">
            {COLOR_PRESETS.map((preset) => (
              <button
                key={preset.name}
                onClick={() => applyColorPreset(preset)}
                className="group flex flex-col items-center gap-1 cursor-pointer bg-transparent border-none p-1"
                title={preset.name}
              >
                <div className="flex -space-x-1">
                  {Object.values(preset.colors).slice(0, 3).map((c, i) => (
                    <div key={i} className="w-5 h-5 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: c }} />
                  ))}
                </div>
                <span className="text-[9px] text-gray-400 group-hover:text-gray-600">{preset.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1">
          <ColorField label="Primaire" value={theme.colors?.primary} onChange={(v) => updateField('colors.primary', v)} />
          <ColorField label="Secondaire" value={theme.colors?.secondary} onChange={(v) => updateField('colors.secondary', v)} />
          <ColorField label="Accent" value={theme.colors?.accent} onChange={(v) => updateField('colors.accent', v)} />
          <ColorField label="Arrière-plan" value={theme.colors?.background} onChange={(v) => updateField('colors.background', v)} />
          <ColorField label="Texte" value={theme.colors?.text} onChange={(v) => updateField('colors.text', v)} />
        </div>
      </Section>

      {/* Fonts */}
      <Section title="Typographie" icon={Type}>
        <div className="space-y-4">
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Police des titres</label>
            <select
              value={theme.fonts?.heading || 'Inter'}
              onChange={(e) => updateField('fonts.heading', e.target.value)}
              className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 cursor-pointer appearance-none"
            >
              {FONT_OPTIONS.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
            <p className="mt-2 text-lg font-bold text-gray-700" style={{ fontFamily: theme.fonts?.heading || 'Inter' }}>
              Aperçu du titre
            </p>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Police du corps</label>
            <select
              value={theme.fonts?.body || 'Inter'}
              onChange={(e) => updateField('fonts.body', e.target.value)}
              className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 cursor-pointer appearance-none"
            >
              {FONT_OPTIONS.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
            <p className="mt-2 text-sm text-gray-500" style={{ fontFamily: theme.fonts?.body || 'Inter' }}>
              Voici un exemple de texte avec cette police.
            </p>
          </div>
        </div>
      </Section>

      {/* Navigation */}
      <Section title="Navigation" icon={Navigation} defaultOpen={false}>
        <div className="space-y-4">
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Style de navigation</label>
            <select
              value={theme.navigation?.style || 'fixed'}
              onChange={(e) => updateField('navigation.style', e.target.value)}
              className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 cursor-pointer appearance-none"
            >
              <option value="fixed">Fixe (reste visible au scroll)</option>
              <option value="static">Statique</option>
              <option value="transparent">Transparent sur la bannière</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="flex items-center justify-between cursor-pointer py-1">
              <span className="text-sm text-gray-600">Barre de recherche</span>
              <button
                type="button"
                onClick={() => updateField('navigation.showSearch', !(theme.navigation?.showSearch ?? true))}
                className={`relative w-10 h-5.5 rounded-full transition-colors cursor-pointer border-none ${(theme.navigation?.showSearch ?? true) ? 'bg-[var(--color-primary)]' : 'bg-gray-200'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-4.5 h-4.5 bg-white rounded-full shadow-sm transition-transform ${(theme.navigation?.showSearch ?? true) ? 'translate-x-[18px]' : 'translate-x-0'}`} />
              </button>
            </label>
            <label className="flex items-center justify-between cursor-pointer py-1">
              <span className="text-sm text-gray-600">Bouton connexion</span>
              <button
                type="button"
                onClick={() => updateField('navigation.showLogin', !(theme.navigation?.showLogin ?? true))}
                className={`relative w-10 h-5.5 rounded-full transition-colors cursor-pointer border-none ${(theme.navigation?.showLogin ?? true) ? 'bg-[var(--color-primary)]' : 'bg-gray-200'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-4.5 h-4.5 bg-white rounded-full shadow-sm transition-transform ${(theme.navigation?.showLogin ?? true) ? 'translate-x-[18px]' : 'translate-x-0'}`} />
              </button>
            </label>
          </div>
        </div>
      </Section>

      {/* Header */}
      <Section title="En-tête" icon={PanelTop} defaultOpen={false}>
        <HeaderEditor theme={theme} onChange={onChange} />
      </Section>

      {/* Footer */}
      <Section title="Pied de page" icon={PanelBottom} defaultOpen={false}>
        <FooterEditor theme={theme} onChange={onChange} />
      </Section>

      {/* Global Styles */}
      <Section title="Styles globaux" icon={Paintbrush} defaultOpen={false}>
        <GlobalStylesEditor theme={theme} onChange={onChange} />
      </Section>
    </div>
  );
}
