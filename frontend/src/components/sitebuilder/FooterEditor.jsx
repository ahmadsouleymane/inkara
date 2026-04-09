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

export default function FooterEditor({ theme, onChange }) {
  const footer = theme?.footer || {};

  const update = (key, val) => {
    onChange({ ...theme, footer: { ...footer, [key]: val } });
  };

  // Columns management
  const columns = footer.columns || [];
  const addColumn = () => update('columns', [...columns, { title: '', links: [{ label: '', url: '' }] }]);
  const removeColumn = (i) => update('columns', columns.filter((_, j) => j !== i));
  const updateColumn = (i, key, val) => {
    const n = [...columns];
    n[i] = { ...n[i], [key]: val };
    update('columns', n);
  };
  const addLink = (colIdx) => {
    const n = [...columns];
    n[colIdx] = { ...n[colIdx], links: [...(n[colIdx].links || []), { label: '', url: '' }] };
    update('columns', n);
  };
  const updateLink = (colIdx, linkIdx, field, val) => {
    const n = [...columns];
    const links = [...(n[colIdx].links || [])];
    links[linkIdx] = { ...links[linkIdx], [field]: val };
    n[colIdx] = { ...n[colIdx], links };
    update('columns', n);
  };
  const removeLink = (colIdx, linkIdx) => {
    const n = [...columns];
    n[colIdx] = { ...n[colIdx], links: n[colIdx].links.filter((_, j) => j !== linkIdx) };
    update('columns', n);
  };

  // Social icons
  const socialIcons = footer.socialIcons || [];
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
            { id: 'simple', label: 'Simple', desc: 'Logo + copyright' },
            { id: 'columns', label: 'Colonnes', desc: 'Liens en colonnes' },
            { id: 'centered', label: 'Centré', desc: 'Tout centré' },
          ].map((l) => (
            <button
              key={l.id}
              onClick={() => update('layout', l.id)}
              className={`p-2.5 rounded-xl border-2 text-center transition-all cursor-pointer bg-white ${
                (footer.layout || 'simple') === l.id ? 'border-[var(--color-primary)] shadow-sm' : 'border-gray-100 hover:border-gray-200'
              }`}
            >
              <p className="text-[10px] font-semibold text-gray-600">{l.label}</p>
              <p className="text-[9px] text-gray-400">{l.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Columns (for columns layout) */}
      {(footer.layout === 'columns' || footer.layout === 'centered') && (
        <div>
          <Label>Colonnes de liens</Label>
          <div className="space-y-3">
            {columns.map((col, ci) => (
              <div key={ci} className="bg-gray-50 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Colonne {ci + 1}</span>
                  <button onClick={() => removeColumn(ci)} className="p-1 text-red-400 hover:bg-red-50 rounded-lg cursor-pointer bg-transparent border-none"><Trash2 className="w-3 h-3" /></button>
                </div>
                <input
                  type="text"
                  value={col.title || ''}
                  onChange={(e) => updateColumn(ci, 'title', e.target.value)}
                  placeholder="Titre de colonne"
                  className="w-full px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-lg"
                />
                {(col.links || []).map((link, li) => (
                  <div key={li} className="flex gap-1.5 items-center">
                    <input type="text" value={link.label} onChange={(e) => updateLink(ci, li, 'label', e.target.value)} placeholder="Label" className="flex-1 px-2 py-1 text-xs bg-white border border-gray-200 rounded-lg" />
                    <input type="text" value={link.url} onChange={(e) => updateLink(ci, li, 'url', e.target.value)} placeholder="URL" className="flex-1 px-2 py-1 text-xs bg-white border border-gray-200 rounded-lg" />
                    <button onClick={() => removeLink(ci, li)} className="p-0.5 text-red-300 hover:text-red-500 bg-transparent border-none cursor-pointer"><Trash2 className="w-2.5 h-2.5" /></button>
                  </div>
                ))}
                <button onClick={() => addLink(ci)} className="text-[10px] text-[var(--color-primary)] bg-transparent border-none cursor-pointer">+ Lien</button>
              </div>
            ))}
            <button onClick={addColumn} className="flex items-center gap-1 text-xs font-medium text-[var(--color-primary)] bg-transparent border-none cursor-pointer">
              <Plus className="w-3.5 h-3.5" /> Ajouter une colonne
            </button>
          </div>
        </div>
      )}

      {/* Newsletter */}
      <Toggle value={footer.showNewsletter || false} onChange={(v) => update('showNewsletter', v)} label="Section newsletter" />
      {footer.showNewsletter && (
        <input
          type="text"
          value={footer.newsletterTitle || ''}
          onChange={(e) => update('newsletterTitle', e.target.value)}
          placeholder="Titre newsletter (ex: Restez informé)"
          className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg"
        />
      )}

      {/* Copyright */}
      <div>
        <Label>Copyright</Label>
        <input
          type="text"
          value={footer.copyrightText || ''}
          onChange={(e) => update('copyrightText', e.target.value)}
          placeholder="© 2024 Ma Bibliothèque. Tous droits réservés."
          className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg"
        />
      </div>

      {/* Colors */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-gray-400">Fond :</span>
          <input type="color" value={footer.backgroundColor || '#1e293b'} onChange={(e) => update('backgroundColor', e.target.value)} className="w-7 h-7 rounded-lg border border-gray-200 cursor-pointer p-0.5" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-gray-400">Texte :</span>
          <input type="color" value={footer.textColor || '#e2e8f0'} onChange={(e) => update('textColor', e.target.value)} className="w-7 h-7 rounded-lg border border-gray-200 cursor-pointer p-0.5" />
        </div>
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
