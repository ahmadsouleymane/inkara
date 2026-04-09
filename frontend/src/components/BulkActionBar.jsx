import { useState } from 'react';
import { Trash2, FolderInput, X, CheckSquare, Printer } from 'lucide-react';
import { api } from '../api/client.js';
import { downloadAllLabels } from '../utils/bookLabel.js';
import toast from 'react-hot-toast';

export default function BulkActionBar({ selectedIds, categories = [], onDone, onClear, books = [] }) {
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [targetCategory, setTargetCategory] = useState('');
  const [loading, setLoading] = useState(false);

  const count = selectedIds.length;
  if (count === 0) return null;

  const handleDelete = async () => {
    if (!confirm(`Supprimer ${count} livre(s) ?`)) return;
    setLoading(true);
    try {
      await api.delete('/api/books/bulk/delete', { bookIds: selectedIds });
      toast.success(`${count} livre(s) supprimé(s)`);
      onDone();
    } catch {
      toast.error('Erreur suppression');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = async () => {
    if (!targetCategory) return;
    setLoading(true);
    try {
      await api.put('/api/books/bulk/category', { bookIds: selectedIds, category: targetCategory });
      toast.success(`${count} livre(s) déplacé(s)`);
      setShowCategoryPicker(false);
      setTargetCategory('');
      onDone();
    } catch {
      toast.error('Erreur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-xl px-4 py-3 flex items-center gap-3 animate-in slide-in-from-bottom">
      <div className="flex items-center gap-2 text-sm font-medium">
        <CheckSquare className="w-4 h-4 text-[var(--color-primary)]" />
        {count} sélectionné{count > 1 ? 's' : ''}
      </div>

      <div className="w-px h-6 bg-[var(--color-border)]" />

      {showCategoryPicker ? (
        <div className="flex items-center gap-2">
          <select
            value={targetCategory}
            onChange={(e) => setTargetCategory(e.target.value)}
            className="input text-sm py-1"
          >
            <option value="">Choisir une catégorie</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <button onClick={handleCategoryChange} disabled={!targetCategory || loading} className="btn btn-primary text-sm py-1">
            Déplacer
          </button>
          <button onClick={() => setShowCategoryPicker(false)} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <>
          <button
            onClick={() => {
              const selected = books.filter((b) => selectedIds.includes(b._id));
              if (selected.length === 0) { toast.error('Aucun livre sélectionné'); return; }
              downloadAllLabels(selected);
              toast.success(`Téléchargement de ${selected.length} étiquette(s)`);
            }}
            disabled={loading}
            className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg hover:bg-[var(--color-bg)] transition-colors cursor-pointer bg-transparent border-none"
          >
            <Printer className="w-4 h-4" /> Étiquettes
          </button>
          <button
            onClick={() => setShowCategoryPicker(true)}
            disabled={loading}
            className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg hover:bg-[var(--color-bg)] transition-colors cursor-pointer bg-transparent border-none"
          >
            <FolderInput className="w-4 h-4" /> Changer catégorie
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors cursor-pointer bg-transparent border-none"
          >
            <Trash2 className="w-4 h-4" /> Supprimer
          </button>
        </>
      )}

      <div className="w-px h-6 bg-[var(--color-border)]" />

      <button onClick={onClear} className="text-xs text-[var(--color-text-light)] hover:underline">
        Désélectionner
      </button>
    </div>
  );
}
