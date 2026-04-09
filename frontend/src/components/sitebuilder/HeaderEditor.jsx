import { Plus, Trash2 } from 'lucide-react';

const PLATFORMS = ['Facebook', 'Instagram', 'Twitter', 'LinkedIn', 'YouTube', 'TikTok', 'WhatsApp'];

function Label({ children }) {
  return <p className="text-[11px] font-medium text-gray-500 mb-1.5">{children}</p>;
}

function Toggle({ value, onChange, label }) {
  return (
    <label className="flex items-center justify-between cursor-pointer py-1">
      <span className="text-xs text-gray-600">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={`relative w-10 h-5.5 rounded-full transition-colors cursor-pointer border-none ${value ? 'bg-[var(--color-primary)]' : 'bg-gray-200'}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-4.5 h-4.5 bg-white rounded-full shadow-sm transition-transform ${value ? 'translate-x-[18px]' : 'translate-x-0'}`} />
      </button>
    </label>
  );
}

export default function HeaderEditor({ theme, onChange }) {
  const header = theme?.header || {};

  const update = (key, val) => {
    onChange({ ...theme, header: { ...header, [key]: val } });
  };

  const updateCta = (key, val) => {
    update('ctaButton', { ...header.ctaButton, [key]: val });
  };

  const socialIcons = header.socialIcons || [];
  const addSocial = () => update('socialIcons', [...socialIcons, { platform: 'Facebook', url: '' }]);
  const updateSocial = (i, field, val) => {
    const n = [...socialIcons];
    n[i] = { ...n[i], [field]: val };
    update('socialIcons', n);
  };
  const removeSocial = (i) => update('socialIcons', socialIcons.filter((_, j) => j !== i));

  return (
    <div className="space-y-4">
      {/* Layout */}
      <div>
        <Label>Disposition</Label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'default', label: 'Standard', preview: '[ Logo  ====  Nav ]' },
            { id: 'centered', label: 'Centré', preview: '[  Nav  Logo  Nav  ]' },
            { id: 'split', label: 'Séparé', preview: '[ Logo ][ === Nav ]' },
          ].map((l) => (
            <button
              key={l.id}
              onClick={() => update('layout', l.id)}
              className={`p-2.5 rounded-xl border-2 text-center transition-all cursor-pointer bg-white ${
                (header.layout || 'default') === l.id ? 'border-[var(--color-primary)] shadow-sm' : 'border-gray-100 hover:border-gray-200'
              }`}
            >
              <p className="text-[9px] font-mono text-gray-400 mb-1">{l.preview}</p>
              <p className="text-[10px] font-semibold text-gray-600">{l.label}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Logo position */}
      <div>
        <Label>Position du logo</Label>
        <div className="flex bg-gray-100 rounded-lg p-0.5 gap-0.5">
          {['left', 'center'].map((pos) => (
            <button
              key={pos}
              onClick={() => update('logoPosition', pos)}
              className={`flex-1 px-3 py-1.5 text-[10px] font-medium rounded-md transition-all cursor-pointer border-none ${
                (header.logoPosition || 'left') === pos ? 'bg-white shadow-sm text-gray-800' : 'text-gray-400 bg-transparent'
              }`}
            >
              {pos === 'left' ? 'Gauche' : 'Centre'}
            </button>
          ))}
        </div>
      </div>

      {/* Topbar */}
      <div className="space-y-2">
        <Toggle value={header.showTopbar || false} onChange={(v) => update('showTopbar', v)} label="Barre supérieure" />
        {header.showTopbar && (
          <>
            <input
              type="text"
              value={header.topbarText || ''}
              onChange={(e) => update('topbarText', e.target.value)}
              placeholder="Texte de la barre (ex: Nouveau ! Horaires étendus)"
              className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg"
            />
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-400">Couleur fond :</span>
              <input
                type="color"
                value={header.topbarBgColor || '#1e293b'}
                onChange={(e) => update('topbarBgColor', e.target.value)}
                className="w-7 h-7 rounded-lg border border-gray-200 cursor-pointer p-0.5"
              />
            </div>
          </>
        )}
      </div>

      {/* CTA Button */}
      <div className="space-y-2">
        <Toggle value={header.ctaButton?.show || false} onChange={(v) => updateCta('show', v)} label="Bouton CTA" />
        {header.ctaButton?.show && (
          <div className="space-y-2">
            <input
              type="text"
              value={header.ctaButton?.text || ''}
              onChange={(e) => updateCta('text', e.target.value)}
              placeholder="Texte du bouton (ex: S'inscrire)"
              className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg"
            />
            <input
              type="text"
              value={header.ctaButton?.link || ''}
              onChange={(e) => updateCta('link', e.target.value)}
              placeholder="Lien (ex: /inscription)"
              className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg"
            />
          </div>
        )}
      </div>

      {/* Background color */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-gray-400">Couleur de fond :</span>
        <input
          type="color"
          value={header.backgroundColor || '#ffffff'}
          onChange={(e) => update('backgroundColor', e.target.value)}
          className="w-7 h-7 rounded-lg border border-gray-200 cursor-pointer p-0.5"
        />
        {header.backgroundColor && (
          <button onClick={() => update('backgroundColor', '')} className="text-[10px] text-gray-400 hover:text-red-400 bg-transparent border-none cursor-pointer">reset</button>
        )}
      </div>

      {/* Social Icons */}
      <div>
        <Label>Réseaux sociaux</Label>
        <div className="space-y-2">
          {socialIcons.map((s, i) => (
            <div key={i} className="flex gap-2 items-center">
              <select value={s.platform} onChange={(e) => updateSocial(i, 'platform', e.target.value)} className="text-xs bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5">
                {PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
              <input type="text" value={s.url} onChange={(e) => updateSocial(i, 'url', e.target.value)} placeholder="https://..." className="flex-1 px-2 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg" />
              <button onClick={() => removeSocial(i)} className="p-1 text-red-400 hover:bg-red-50 rounded-lg cursor-pointer bg-transparent border-none"><Trash2 className="w-3 h-3" /></button>
            </div>
          ))}
          <button onClick={addSocial} className="flex items-center gap-1 text-xs font-medium text-[var(--color-primary)] bg-transparent border-none cursor-pointer">
            <Plus className="w-3.5 h-3.5" /> Ajouter
          </button>
        </div>
      </div>
    </div>
  );
}
