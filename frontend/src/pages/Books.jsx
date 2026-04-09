import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { booksApi } from '../api/books.js';
import { categoriesApi } from '../api/categories.js';
import { Plus, Search, BookOpen, Filter } from 'lucide-react';
import BulkActionBar from '../components/BulkActionBar.jsx';

export default function Books() {
  const { user } = useAuth();
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedIds, setSelectedIds] = useState([]);

  const canEdit = ['admin', 'owner', 'librarian'].includes(user?.role);
  const isAdmin = ['admin', 'owner'].includes(user?.role);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (search) params.set('search', search);
      if (category) params.set('category', category);

      const data = await booksApi.getAll(params.toString());
      setBooks(data.books);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [page, category]);

  useEffect(() => {
    categoriesApi.getAll().then(setCategories).catch(console.error);
  }, []);

  // Recherche avec délai
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchBooks();
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const toggleSelect = (id) => {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === books.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(books.map((b) => b._id));
    }
  };

  const handleBulkDone = () => {
    setSelectedIds([]);
    fetchBooks();
  };

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:7080';

  return (
    <div className="lg:ml-64 pt-20 lg:pt-8 p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Livres</h1>
        <div className="flex items-center gap-2">
          {isAdmin && books.length > 0 && (
            <button onClick={toggleSelectAll} className="btn-secondary text-sm">
              {selectedIds.length === books.length ? 'Désélectionner' : 'Tout sélectionner'}
            </button>
          )}
          {canEdit && (
            <Link to="/livres/nouveau" className="btn-primary flex items-center gap-2 no-underline">
              <Plus className="w-4 h-4" />
              Ajouter
            </Link>
          )}
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="card mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-light)]" />
            <input
              type="text"
              className="input pl-10"
              placeholder="Rechercher par titre, auteur ou ISBN..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-light)]" />
            <select
              className="input pl-10 pr-8 appearance-none cursor-pointer"
              value={category}
              onChange={(e) => { setCategory(e.target.value); setPage(1); }}
            >
              <option value="">Toutes les catégories</option>
              {categories.map((c) => (
                <option key={c._id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grille de livres */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="skeleton h-72 rounded-xl" />
          ))}
        </div>
      ) : books.length === 0 ? (
        <div className="text-center py-20">
          <BookOpen className="w-16 h-16 text-[var(--color-text-light)] mx-auto mb-4 opacity-30" />
          <p className="text-[var(--color-text-light)]">Aucun livre trouvé</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {books.map((book) => (
              <div key={book._id} className="relative">
                {/* Checkbox for bulk select */}
                {isAdmin && (
                  <div className="absolute top-2 left-2 z-10">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(book._id)}
                      onChange={() => toggleSelect(book._id)}
                      className="w-4 h-4 accent-[var(--color-primary)] cursor-pointer rounded"
                    />
                  </div>
                )}
                <Link
                  to={`/livres/${book._id}`}
                  className={`card hover:shadow-md transition-shadow no-underline text-[var(--color-text)] overflow-hidden p-0 block ${
                    selectedIds.includes(book._id) ? 'ring-2 ring-[var(--color-primary)]' : ''
                  }`}
                >
                  {/* Couverture */}
                  <div className="h-48 flex items-center justify-center overflow-hidden" style={{ backgroundColor: 'var(--color-bg)' }}>
                    {book.cover ? (
                      <img
                        src={book.cover.startsWith('http') ? book.cover : `${API_URL}${book.cover}`}
                        alt={book.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <BookOpen className="w-12 h-12" style={{ color: 'var(--color-border)' }} />
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-sm line-clamp-2 mb-1">{book.title}</h3>
                    <p className="text-xs text-[var(--color-text-light)] mb-2">{book.author?.join(', ')}</p>
                    <div className="flex items-center justify-between">
                      <span className="badge badge-info text-xs">{book.category}</span>
                      <span className={`text-xs font-medium ${book.availableCopies > 0 ? 'text-green-600' : 'text-red-500'}`}>
                        {book.availableCopies > 0 ? `${book.availableCopies} dispo.` : 'Indisponible'}
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-secondary text-sm disabled:opacity-50"
              >
                Précédent
              </button>
              <span className="text-sm text-[var(--color-text-light)]">
                Page {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="btn-secondary text-sm disabled:opacity-50"
              >
                Suivant
              </button>
            </div>
          )}
        </>
      )}

      {/* Bulk action bar */}
      <BulkActionBar
        selectedIds={selectedIds}
        categories={categories.map((c) => c.name)}
        books={books}
        onDone={handleBulkDone}
        onClear={() => setSelectedIds([])}
      />
    </div>
  );
}
