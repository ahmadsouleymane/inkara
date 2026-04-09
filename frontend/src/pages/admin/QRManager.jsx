import { useState, useEffect } from 'react';
import { booksApi } from '../../api/books.js';
import { qrApi } from '../../api/qr.js';
import { QrCode, Download, CheckSquare, Square, RefreshCw, Printer } from 'lucide-react';
import toast from 'react-hot-toast';

export default function QRManager() {
  const [books, setBooks] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const data = await booksApi.getAll(`page=${page}&limit=50`);
      setBooks(data.books);
      setTotal(data.total);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBooks(); }, [page]);

  const toggleSelect = (id) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  const selectAll = () => {
    if (selected.size === books.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(books.map(b => b._id)));
    }
  };

  const handleGenerateBatch = async () => {
    const ids = selected.size > 0 ? [...selected] : books.map(b => b._id);
    if (ids.length === 0) return;

    try {
      setGenerating(true);
      await qrApi.generateBatch(ids);
      toast.success(`${ids.length} QR codes générés`);
      setSelected(new Set());
      fetchBooks();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerateAll = async () => {
    try {
      setGenerating(true);
      const result = await qrApi.generateAll();
      toast.success(result.message);
      fetchBooks();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleDownloadPdf = async () => {
    const ids = selected.size > 0 ? [...selected] : null;
    const url = qrApi.getPdfUrl(ids);
    const token = localStorage.getItem('smartlib_token');
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:7080'}${url}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Erreur de téléchargement');
      const blob = await response.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'qr-codes.pdf';
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const booksWithQR = books.filter(b => b.qrCode);
  const booksWithoutQR = books.filter(b => !b.qrCode);

  return (
    <div className="lg:ml-64 pt-20 lg:pt-8 p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <QrCode className="w-7 h-7" />
          Gestionnaire QR Codes
        </h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="card text-center">
          <p className="text-3xl font-bold text-[var(--color-primary)]">{total}</p>
          <p className="text-sm text-[var(--color-text-light)]">Total livres</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-bold text-blue-600">{booksWithQR.length}</p>
          <p className="text-sm text-[var(--color-text-light)]">Avec QR code</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-bold text-orange-500">{booksWithoutQR.length}</p>
          <p className="text-sm text-[var(--color-text-light)]">Sans QR code</p>
        </div>
      </div>

      {/* Actions */}
      <div className="card mb-6">
        <div className="flex flex-wrap gap-3">
          <button onClick={handleGenerateAll} disabled={generating} className="btn-primary flex items-center gap-2">
            <RefreshCw className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />
            Générer tous les manquants
          </button>
          <button
            onClick={handleGenerateBatch}
            disabled={generating || selected.size === 0}
            className="btn-secondary flex items-center gap-2"
          >
            <QrCode className="w-4 h-4" />
            Générer la sélection ({selected.size})
          </button>
          <button onClick={handleDownloadPdf} className="btn-secondary flex items-center gap-2">
            <Printer className="w-4 h-4" />
            Télécharger planche PDF
          </button>
        </div>
      </div>

      {/* Liste des livres */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Livres ({books.length})</h2>
          <button onClick={selectAll} className="text-sm text-[var(--color-primary)] hover:underline">
            {selected.size === books.length ? 'Tout désélectionner' : 'Tout sélectionner'}
          </button>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-14 rounded-lg" />)}
          </div>
        ) : (
          <div className="space-y-2">
            {books.map((book) => (
              <div
                key={book._id}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-[var(--color-bg)] cursor-pointer transition-colors"
                onClick={() => toggleSelect(book._id)}
              >
                <button className="text-[var(--color-primary)]">
                  {selected.has(book._id) ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                </button>

                {book.cover ? (
                  <img src={book.cover.startsWith('http') ? book.cover : `${import.meta.env.VITE_API_URL || 'http://localhost:7080'}${book.cover}`} alt="" className="w-10 h-14 object-cover rounded" />
                ) : (
                  <div className="w-10 h-14 bg-[var(--color-border)] rounded flex items-center justify-center">
                    <QrCode className="w-5 h-5 text-[var(--color-text-light)]" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{book.title}</p>
                  <p className="text-sm text-[var(--color-text-light)]">{book.author?.join(', ')}</p>
                </div>

                {book.qrCode ? (
                  <img src={book.qrCode} alt="QR" className="w-12 h-12" />
                ) : (
                  <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded">Pas de QR</span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {total > 50 && (
          <div className="flex justify-center gap-2 mt-4 pt-4 border-t border-[var(--color-border)]">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary text-sm">
              Précédent
            </button>
            <span className="px-3 py-1.5 text-sm text-[var(--color-text-light)]">
              Page {page} / {Math.ceil(total / 50)}
            </span>
            <button onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(total / 50)} className="btn-secondary text-sm">
              Suivant
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
