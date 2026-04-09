import { useState, useCallback } from 'react';
import { qrApi } from '../../api/qr.js';
import QRScanner from '../../components/QRScanner.jsx';
import { ScanLine, CheckCircle, XCircle, BookOpen, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';

export default function InventoryScanner() {
  const [scannedBooks, setScannedBooks] = useState([]);
  const [scanning, setScanning] = useState(true);
  const [lastScanned, setLastScanned] = useState(null);

  const extractBookId = (text) => {
    const match = text.match(/\/scan\/book\/([a-f0-9]{24})/);
    return match ? match[1] : null;
  };

  const handleScan = useCallback(async (text) => {
    const bookId = extractBookId(text);
    if (!bookId) return;

    // Éviter les scans en double
    if (scannedBooks.find(b => b._id === bookId)) {
      toast('Déjà scanné', { icon: '📋' });
      return;
    }

    try {
      const book = await qrApi.scanBook(bookId);
      const entry = { ...book, scannedAt: new Date().toISOString(), found: true };
      setScannedBooks(prev => [entry, ...prev]);
      setLastScanned(entry);
      toast.success(`"${book.title}" scanné`);
    } catch (err) {
      const entry = { _id: bookId, title: 'Livre inconnu', found: false, scannedAt: new Date().toISOString(), error: err.message };
      setScannedBooks(prev => [entry, ...prev]);
      setLastScanned(entry);
      toast.error('Livre non trouvé dans la base');
    }
  }, [scannedBooks]);

  const reset = () => {
    setScannedBooks([]);
    setLastScanned(null);
  };

  const foundCount = scannedBooks.filter(b => b.found).length;
  const notFoundCount = scannedBooks.filter(b => !b.found).length;

  return (
    <div className="lg:ml-64 pt-20 lg:pt-8 p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ScanLine className="w-7 h-7" />
          Scanner d'inventaire
        </h1>
        <button onClick={reset} className="btn-secondary flex items-center gap-2 text-sm">
          <RotateCcw className="w-4 h-4" />
          Réinitialiser
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scanner */}
        <div className="card">
          <h2 className="font-semibold mb-4">Caméra</h2>
          <QRScanner
            onScan={handleScan}
            active={scanning}
            onError={(msg) => toast.error(msg)}
          />
          <button
            onClick={() => setScanning(!scanning)}
            className={`w-full mt-4 ${scanning ? 'btn-secondary' : 'btn-primary'}`}
          >
            {scanning ? 'Mettre en pause' : 'Reprendre le scan'}
          </button>
        </div>

        {/* Stats + dernier scanné */}
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="card text-center py-3">
              <p className="text-2xl font-bold">{scannedBooks.length}</p>
              <p className="text-xs text-[var(--color-text-light)]">Scannés</p>
            </div>
            <div className="card text-center py-3">
              <p className="text-2xl font-bold text-blue-600">{foundCount}</p>
              <p className="text-xs text-[var(--color-text-light)]">Trouvés</p>
            </div>
            <div className="card text-center py-3">
              <p className="text-2xl font-bold text-red-600">{notFoundCount}</p>
              <p className="text-xs text-[var(--color-text-light)]">Non trouvés</p>
            </div>
          </div>

          {lastScanned && (
            <div className={`card border-2 ${lastScanned.found ? 'border-green-300' : 'border-red-300'}`}>
              <div className="flex items-center gap-3">
                {lastScanned.found ? (
                  <CheckCircle className="w-8 h-8 text-green-500 shrink-0" />
                ) : (
                  <XCircle className="w-8 h-8 text-red-500 shrink-0" />
                )}
                <div>
                  <p className="font-semibold">{lastScanned.title}</p>
                  {lastScanned.author?.length > 0 && (
                    <p className="text-sm text-[var(--color-text-light)]">{lastScanned.author.join(', ')}</p>
                  )}
                  {lastScanned.category && (
                    <p className="text-xs text-[var(--color-text-light)]">
                      {lastScanned.category} — {lastScanned.availableCopies}/{lastScanned.copies} dispo.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Liste des livres scannés */}
      {scannedBooks.length > 0 && (
        <div className="card mt-6">
          <h2 className="font-semibold mb-4">Livres scannés ({scannedBooks.length})</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)]">
                  <th className="text-left py-2 font-medium text-[var(--color-text-light)]">Statut</th>
                  <th className="text-left py-2 font-medium text-[var(--color-text-light)]">Titre</th>
                  <th className="text-left py-2 font-medium text-[var(--color-text-light)]">Catégorie</th>
                  <th className="text-left py-2 font-medium text-[var(--color-text-light)]">Heure</th>
                </tr>
              </thead>
              <tbody>
                {scannedBooks.map((book, i) => (
                  <tr key={`${book._id}-${i}`} className="border-b border-[var(--color-border)] last:border-0">
                    <td className="py-2">
                      {book.found ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500" />
                      )}
                    </td>
                    <td className="py-2 font-medium">{book.title}</td>
                    <td className="py-2 text-[var(--color-text-light)]">{book.category || '—'}</td>
                    <td className="py-2 text-[var(--color-text-light)]">
                      {new Date(book.scannedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
