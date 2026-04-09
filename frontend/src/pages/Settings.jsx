import { useState, useEffect } from 'react';
import { libraryApi } from '../api/library.js';
import { categoriesApi } from '../api/categories.js';
import { Settings as SettingsIcon, Save, Plus, Trash2, Tag } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Settings() {
  const [library, setLibrary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoFile, setLogoFile] = useState(null);

  // Catégories
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');

  useEffect(() => {
    Promise.all([
      libraryApi.get(),
      categoriesApi.getAll(),
    ]).then(([lib, cats]) => {
      setLibrary(lib);
      setCategories(cats);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      Object.entries(library).forEach(([key, value]) => {
        if (key !== '_id' && key !== '__v' && key !== 'singleton' && key !== 'createdAt' && key !== 'updatedAt') {
          formData.append(key, value);
        }
      });
      if (logoFile) {
        formData.append('logo', logoFile);
      }
      const updated = await libraryApi.update(formData);
      setLibrary(updated);
      toast.success('Paramètres enregistrés');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.trim()) return;
    try {
      const cat = await categoriesApi.create({ name: newCategory.trim() });
      setCategories([...categories, cat]);
      setNewCategory('');
      toast.success('Catégorie ajoutée');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDeleteCategory = async (id) => {
    try {
      await categoriesApi.delete(id);
      setCategories(categories.filter((c) => c._id !== id));
      toast.success('Catégorie supprimée');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleChange = (e) => setLibrary({ ...library, [e.target.name]: e.target.value });

  if (loading) {
    return (
      <div className="lg:ml-64 pt-20 lg:pt-8 p-6">
        <div className="skeleton h-96 rounded-xl" />
      </div>
    );
  }

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:7080';

  return (
    <div className="lg:ml-64 pt-20 lg:pt-8 p-6">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-3">
        <SettingsIcon className="w-7 h-7" />
        Paramètres
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profil de la bibliothèque */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSave} className="card space-y-5">
            <h2 className="text-lg font-semibold">Profil de la bibliothèque</h2>
            <p className="text-sm text-[var(--color-text-light)] -mt-3">
              Ces informations apparaîtront sur votre site public.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1.5">Nom de la bibliothèque</label>
                <input name="name" className="input" value={library?.name || ''} onChange={handleChange} />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1.5">Description</label>
                <textarea name="description" className="input min-h-[80px] resize-y" value={library?.description || ''} onChange={handleChange} />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1.5">Logo</label>
                <input type="file" accept="image/*" className="input" onChange={(e) => setLogoFile(e.target.files[0])} />
                {library?.logo && (
                  <img src={library.logo.startsWith('http') ? library.logo : `${API_URL}${library.logo}`} alt="Logo" className="h-16 mt-2 rounded" />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Adresse</label>
                <input name="address" className="input" value={library?.address || ''} onChange={handleChange} />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Téléphone</label>
                <input name="phone" className="input" value={library?.phone || ''} onChange={handleChange} />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Email</label>
                <input name="email" type="email" className="input" value={library?.email || ''} onChange={handleChange} />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Site web</label>
                <input name="website" className="input" value={library?.website || ''} onChange={handleChange} />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1.5">Horaires d'ouverture</label>
                <input name="openingHours" className="input" placeholder="Lun-Ven : 8h-18h, Sam : 9h-13h" value={library?.openingHours || ''} onChange={handleChange} />
              </div>
            </div>

            <hr className="border-[var(--color-border)]" />

            <h2 className="text-lg font-semibold">Paramètres de prêt</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Durée d'emprunt (jours)</label>
                <input name="loanDurationDays" type="number" min="1" className="input" value={library?.loanDurationDays || 14} onChange={handleChange} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Max emprunts par utilisateur</label>
                <input name="maxLoansPerUser" type="number" min="1" className="input" value={library?.maxLoansPerUser || 3} onChange={handleChange} />
              </div>
            </div>

            <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
              <Save className="w-4 h-4" />
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </form>
        </div>

        {/* Catégories */}
        <div>
          <div className="card">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Tag className="w-5 h-5" />
              Catégories
            </h2>

            <form onSubmit={handleAddCategory} className="flex gap-2 mb-4">
              <input
                className="input flex-1"
                placeholder="Nouvelle catégorie"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
              />
              <button type="submit" className="btn-primary p-2">
                <Plus className="w-4 h-4" />
              </button>
            </form>

            <div className="space-y-2">
              {categories.map((cat) => (
                <div key={cat._id} className="flex items-center justify-between py-2 px-3 rounded-lg" style={{ backgroundColor: 'var(--color-bg)' }}>
                  <span className="text-sm">{cat.name}</span>
                  <button
                    onClick={() => handleDeleteCategory(cat._id)}
                    className="text-[var(--color-text-light)] hover:text-red-500 cursor-pointer bg-transparent border-none p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              {categories.length === 0 && (
                <p className="text-sm text-[var(--color-text-light)] text-center py-4">Aucune catégorie</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
