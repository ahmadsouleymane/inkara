import { useState, useEffect } from 'react';
import { categoriesApi } from '../../api/categories.js';
import { Tag, Plus, Trash2, Edit, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');

  useEffect(() => { categoriesApi.getAll().then(setCategories).catch(console.error); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    try {
      const cat = await categoriesApi.create({ name: newName.trim() });
      setCategories([...categories, cat]);
      setNewName('');
      toast.success('Catégorie ajoutée');
    } catch (err) { toast.error(err.message); }
  };

  const handleUpdate = async (id) => {
    try {
      const updated = await categoriesApi.update(id, { name: editName });
      setCategories(categories.map(c => c._id === id ? updated : c));
      setEditingId(null);
      toast.success('Catégorie modifiée');
    } catch (err) { toast.error(err.message); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cette catégorie ?')) return;
    try {
      await categoriesApi.delete(id);
      setCategories(categories.filter(c => c._id !== id));
      toast.success('Catégorie supprimée');
    } catch (err) { toast.error(err.message); }
  };

  return (
    <div className="lg:ml-64 pt-20 lg:pt-8 p-6">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-3">
        <Tag className="w-7 h-7" /> Catégories
      </h1>
      <form onSubmit={handleAdd} className="card mb-6 flex gap-3">
        <input className="input flex-1" placeholder="Nouvelle catégorie" value={newName} onChange={(e) => setNewName(e.target.value)} />
        <button type="submit" className="btn-primary flex items-center gap-2"><Plus className="w-4 h-4" /> Ajouter</button>
      </form>
      <div className="card space-y-2">
        {categories.length === 0 ? (
          <p className="text-center text-[var(--color-text-light)] py-8">Aucune catégorie</p>
        ) : categories.map(cat => (
          <div key={cat._id} className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg">
            {editingId === cat._id ? (
              <div className="flex items-center gap-2 flex-1">
                <input className="input flex-1" value={editName} onChange={(e) => setEditName(e.target.value)} autoFocus />
                <button onClick={() => handleUpdate(cat._id)} className="text-blue-600 cursor-pointer bg-transparent border-none p-1"><Check className="w-4 h-4" /></button>
                <button onClick={() => setEditingId(null)} className="text-gray-400 cursor-pointer bg-transparent border-none p-1"><X className="w-4 h-4" /></button>
              </div>
            ) : (
              <>
                <span className="font-medium">{cat.name}</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => { setEditingId(cat._id); setEditName(cat.name); }} className="text-[var(--color-text-light)] hover:text-[var(--color-primary)] cursor-pointer bg-transparent border-none p-1"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(cat._id)} className="text-[var(--color-text-light)] hover:text-red-500 cursor-pointer bg-transparent border-none p-1"><Trash2 className="w-4 h-4" /></button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
