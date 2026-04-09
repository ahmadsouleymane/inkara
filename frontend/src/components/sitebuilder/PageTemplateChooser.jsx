import { useState } from 'react';
import { X } from 'lucide-react';
import { PAGE_TEMPLATES, TEMPLATE_CATEGORIES } from './pageTemplates.js';

export default function PageTemplateChooser({ onSelect, onClose }) {
  const [selectedId, setSelectedId] = useState('blank');

  const handleConfirm = () => {
    const template = PAGE_TEMPLATES.find((t) => t.id === selectedId);
    onSelect(template);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Choisir un template</h2>
            <p className="text-xs text-gray-400 mt-0.5">Commencez avec une structure pré-construite</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg cursor-pointer bg-transparent border-none">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Templates grid */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {TEMPLATE_CATEGORIES.map((cat) => (
            <div key={cat}>
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-3">{cat}</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {PAGE_TEMPLATES.filter((t) => t.category === cat).map((t) => {
                  const Icon = t.icon;
                  const isSelected = selectedId === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setSelectedId(t.id)}
                      className={`p-4 rounded-xl border-2 text-left transition-all cursor-pointer bg-white ${
                        isSelected
                          ? 'border-[var(--color-primary)] shadow-md ring-2 ring-[var(--color-primary)]/20'
                          : 'border-gray-100 hover:border-gray-200 hover:shadow-sm'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${isSelected ? 'bg-[var(--color-primary)]/10' : 'bg-gray-50'}`}>
                        <Icon className="w-5 h-5" style={{ color: isSelected ? 'var(--color-primary)' : '#94a3b8' }} />
                      </div>
                      <p className="text-sm font-semibold text-gray-800 mb-0.5">{t.label}</p>
                      <p className="text-[10px] text-gray-400 leading-relaxed">{t.description}</p>
                      {t.blocks.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {t.blocks.slice(0, 4).map((b, i) => (
                            <span key={i} className="text-[8px] px-1.5 py-0.5 bg-gray-100 rounded-md text-gray-400 font-medium">{b.type}</span>
                          ))}
                          {t.blocks.length > 4 && (
                            <span className="text-[8px] px-1.5 py-0.5 bg-gray-100 rounded-md text-gray-400 font-medium">+{t.blocks.length - 4}</span>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          <p className="text-xs text-gray-400">
            {PAGE_TEMPLATES.find((t) => t.id === selectedId)?.blocks.length || 0} bloc(s) pré-configurés
          </p>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer bg-transparent border-none">
              Annuler
            </button>
            <button
              onClick={handleConfirm}
              className="px-6 py-2.5 text-sm font-semibold text-white rounded-xl cursor-pointer border-none hover:opacity-90 transition-opacity"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              Utiliser ce template
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
