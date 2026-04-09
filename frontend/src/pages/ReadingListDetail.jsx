import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { readingListApi } from '../api/readinglist.js';
import { booksApi } from '../api/books.js';
import { ArrowLeft, BookOpen, Trash2, Plus, Search, Eye, EyeOff, Pencil } from 'lucide-react';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:7080';

export default function ReadingListDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [list, setList] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', isPublic: false });
  const [showAddBook, setShowAddBook] = useState(false);
  const [bookSearch, setBookSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const canEdit = ['admin', 'owner', 'librarian'].includes(user?.role);

  const load = async () => {
    try {
      const data = await readingListApi.getOne(id);
      setList(data);
      setForm({ title: data.title, description: data.description || '', isPublic: data.isPublic });
    } catch {
      toast.error('Liste introuvable');
      navigate('/reading-lists');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  // Book search with debounce
  useEffect(() => {
    if (!bookSearch.trim()) { setSearchResults([]); return; }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const data = await booksApi.getAll(`search=${encodeURIComponent(bookSearch)}&limit=5`);
        const existingIds = new Set(list?.books?.map((b) => b._id) || []);
        setSearchResults((data.books || []).filter((b) => !existingIds.has(b._id)));
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [bookSearch, list]);

  const handleUpdate = async () => {
    try {
      await readingListApi.update(id, form);
      toast.success('Liste mise à jour');
      setEditing(false);
      load();
    } catch {
      toast.error('Erreur');
    }
  };

  const handleAddBook = async (bookId) => {
    try {
      await readingListApi.addBook(id, bookId);
      toast.success('Livre ajouté');
      setBookSearch('');
      setSearchResults([]);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
    }
  };

  const handleRemoveBook = async (bookId) => {
    try {
      await readingListApi.removeBook(id, bookId);
      toast.success('Livre retiré');
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

  if (!list) return null;

  return (
    <div className="lg:ml-64 pt-20 lg:pt-8 p-6 max-w-4xl">
      {/* Header */}
      <button onClick={() => navigate('/reading-lists')} className="flex items-center gap-1 text-sm text-[var(--color-text-light)] hover:underline mb-4">
        <ArrowLeft className="w-4 h-4" /> Listes de lecture
      </button>

      {editing ? (
        <div className="card mb-6 space-y-3">
          <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input text-lg font-bold" />
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input resize-y" rows={2} placeholder="Description" />
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={form.isPublic} onChange={(e) => setForm({ ...form, isPublic: e.target.checked })} className="accent-[var(--color-primary)]" />
            Visible sur le site public
          </label>
          <div className="flex gap-2">
            <button onClick={handleUpdate} className="btn-primary">Sauvegarder</button>
            <button onClick={() => setEditing(false)} className="btn-secondary">Annuler</button>
          </div>
        </div>
      ) : (
        <div className="mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                {list.title}
                {list.isPublic ? <Eye className="w-4 h-4 text-blue-500" /> : <EyeOff className="w-4 h-4 text-gray-400" />}
              </h1>
              {list.description && <p className="text-[var(--color-text-light)] mt-1">{list.description}</p>}
              <p className="text-xs text-[var(--color-text-light)] mt-2">
                {list.books?.length || 0} livre{(list.books?.length || 0) > 1 ? 's' : ''} — créée par {list.createdBy?.fullName}
              </p>
            </div>
            {canEdit && (
              <div className="flex gap-2">
                <button onClick={() => setEditing(true)} className="btn-secondary flex items-center gap-1 text-sm">
                  <Pencil className="w-3.5 h-3.5" /> Modifier
                </button>
                <button onClick={() => setShowAddBook(!showAddBook)} className="btn-primary flex items-center gap-1 text-sm">
                  <Plus className="w-3.5 h-3.5" /> Ajouter un livre
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add book search */}
      {showAddBook && (
        <div className="card mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-light)]" />
            <input
              type="text"
              value={bookSearch}
              onChange={(e) => setBookSearch(e.target.value)}
              placeholder="Rechercher un livre à ajouter..."
              className="input pl-10"
              autoFocus
            />
          </div>
          {searching && <p className="text-xs text-[var(--color-text-light)] mt-2">Recherche...</p>}
          {searchResults.length > 0 && (
            <div className="mt-3 space-y-2">
              {searchResults.map((book) => (
                <div key={book._id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-[var(--color-bg)] transition-colors">
                  <div className="w-8 h-11 rounded bg-gray-100 overflow-hidden flex items-center justify-center shrink-0">
                    {book.cover ? (
                      <img src={book.cover.startsWith('http') ? book.cover : `${API_URL}${book.cover}`} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <BookOpen className="w-4 h-4 text-gray-300" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{book.title}</p>
                    <p className="text-xs text-[var(--color-text-light)]">{book.author?.join(', ')}</p>
                  </div>
                  <button onClick={() => handleAddBook(book._id)} className="btn-primary text-xs py-1 px-3">
                    Ajouter
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Book list */}
      {list.books?.length === 0 ? (
        <div className="text-center py-16">
          <BookOpen className="w-12 h-12 text-[var(--color-text-light)] mx-auto mb-3 opacity-30" />
          <p className="text-[var(--color-text-light)]">Cette liste est vide</p>
        </div>
      ) : (
        <div className="space-y-2">
          {list.books?.map((book) => (
            <div key={book._id} className="card flex items-center gap-4 p-3">
              <div className="w-12 h-16 rounded-lg bg-gray-100 overflow-hidden flex items-center justify-center shrink-0">
                {book.cover ? (
                  <img src={book.cover.startsWith('http') ? book.cover : `${API_URL}${book.cover}`} alt="" className="w-full h-full object-cover" />
                ) : (
                  <BookOpen className="w-6 h-6 text-gray-300" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <Link to={`/livres/${book._id}`} className="font-semibold text-sm hover:underline no-underline text-[var(--color-text)]">
                  {book.title}
                </Link>
                <p className="text-xs text-[var(--color-text-light)]">{book.author?.join(', ')}</p>
                <div className="flex items-center gap-2 mt-1">
                  {book.category && <span className="badge badge-info text-xs">{book.category}</span>}
                  <span className={`text-xs ${book.availableCopies > 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {book.availableCopies > 0 ? 'Disponible' : 'Indisponible'}
                  </span>
                </div>
              </div>
              {canEdit && (
                <button onClick={() => handleRemoveBook(book._id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
