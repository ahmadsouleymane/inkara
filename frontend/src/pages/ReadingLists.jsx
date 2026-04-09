import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { readingListApi } from '../api/readinglist.js';
import { Plus, BookOpen, List, Eye, EyeOff, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:7080';

export default function ReadingLists() {
  const { user } = useAuth();
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', isPublic: false });

  const canEdit = ['admin', 'owner', 'librarian'].includes(user?.role);

  const load = async () => {
    try {
      const data = await readingListApi.getAll();
      setLists(data);
    } catch {
      toast.error('Erreur chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!form.title.trim()) return;
    try {
      await readingListApi.create(form);
      toast.success('Liste créée');
      setForm({ title: '', description: '', isPublic: false });
      setShowCreate(false);
      load();
    } catch (err) {
      toast.error(err.message || 'Erreur');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cette liste ?')) return;
    try {
      await readingListApi.remove(id);
      toast.success('Liste supprimée');
      load();
    } catch {
      toast.error('Erreur');
    }
  };

  if (loading) {
    return (
      <div className="lg:ml-64 pt-20 lg:pt-8 p-6 flex justify-center">
        <div className="w-8 h-8 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="lg:ml-64 pt-20 lg:pt-8 p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Listes de lecture</h1>
        {canEdit && (
          <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Nouvelle liste
          </button>
        )}
      </div>

      {showCreate && (
        <div className="card mb-6">
          <div className="space-y-3">
            <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Titre de la liste" className="input" autoFocus />
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description (optionnel)" className="input resize-y" rows={2} />
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={form.isPublic} onChange={(e) => setForm({ ...form, isPublic: e.target.checked })} className="accent-[var(--color-primary)]" />
              Visible sur le site public
            </label>
            <div className="flex gap-2">
              <button onClick={handleCreate} className="btn-primary">Créer</button>
              <button onClick={() => setShowCreate(false)} className="btn-secondary">Annuler</button>
            </div>
          </div>
        </div>
      )}

      {lists.length === 0 ? (
        <div className="text-center py-20">
          <List className="w-16 h-16 text-[var(--color-text-light)] mx-auto mb-4 opacity-30" />
          <p className="text-[var(--color-text-light)]">Aucune liste de lecture</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {lists.map((list) => (
            <div key={list._id} className="card">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <Link to={`/reading-lists/${list._id}`} className="font-semibold text-lg hover:underline no-underline text-[var(--color-text)]">
                    {list.title}
                  </Link>
                  {list.description && <p className="text-sm text-[var(--color-text-light)] mt-1 line-clamp-2">{list.description}</p>}
                </div>
                {list.isPublic ? <Eye className="w-4 h-4 text-blue-500 shrink-0" /> : <EyeOff className="w-4 h-4 text-gray-400 shrink-0" />}
              </div>

              {/* Book thumbnails */}
              <div className="flex -space-x-2 mb-3">
                {list.books?.slice(0, 5).map((book) => (
                  <div key={book._id} className="w-10 h-14 rounded-md overflow-hidden border-2 border-white bg-gray-100 flex items-center justify-center">
                    {book.cover ? (
                      <img src={book.cover.startsWith('http') ? book.cover : `${API_URL}${book.cover}`} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <BookOpen className="w-4 h-4 text-gray-300" />
                    )}
                  </div>
                ))}
                {(list.books?.length || 0) > 5 && (
                  <div className="w-10 h-14 rounded-md border-2 border-white bg-gray-100 flex items-center justify-center text-xs text-gray-500">
                    +{list.books.length - 5}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between text-xs text-[var(--color-text-light)]">
                <span>{list.books?.length || 0} livre{(list.books?.length || 0) > 1 ? 's' : ''} — par {list.createdBy?.fullName}</span>
                {canEdit && (
                  <button onClick={() => handleDelete(list._id)} className="text-red-500 hover:underline">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
