import { useState, useEffect, useCallback } from 'react';
import { loansApi } from '../../api/loans.js';
import { api } from '../../api/client.js';
import QRScanner from '../../components/QRScanner.jsx';
import {
  BookCopy, RotateCcw, UserCheck, BookOpen, Camera, ArrowLeft,
  CheckCircle, AlertCircle, Keyboard, Search,
} from 'lucide-react';
import toast from 'react-hot-toast';

const STEPS = {
  MODE: 'mode',
  SCAN_MEMBER: 'scan_member',
  SCAN_BOOK: 'scan_book',
  CONFIRM: 'confirm',
  RESULT: 'result',
};

export default function EmployeeLoan() {
  const [step, setStep] = useState(STEPS.MODE);
  const [mode, setMode] = useState(null); // 'borrow' | 'return'
  const [scannerActive, setScannerActive] = useState(false);
  const [scanMode, setScanMode] = useState('camera'); // 'camera' | 'manual'

  // Member
  const [member, setMember] = useState(null);
  const [manualMemberId, setManualMemberId] = useState('');

  // Book
  const [book, setBook] = useState(null);
  const [manualBookId, setManualBookId] = useState('');

  // Result
  const [result, setResult] = useState(null);
  const [processing, setProcessing] = useState(false);

  // Recent loans
  const [recentLoans, setRecentLoans] = useState([]);

  const fetchRecent = () => {
    loansApi.getAll('limit=10&sort=-createdAt')
      .then((data) => setRecentLoans(data.loans || data))
      .catch(console.error);
  };

  useEffect(() => { fetchRecent(); }, []);

  // === Navigation ===
  const startBorrow = () => { setMode('borrow'); setStep(STEPS.SCAN_MEMBER); setScannerActive(true); };
  const startReturn = () => { setMode('return'); setStep(STEPS.SCAN_MEMBER); setScannerActive(true); };
  const goBack = () => {
    setScannerActive(false);
    if (step === STEPS.SCAN_MEMBER) { setStep(STEPS.MODE); setMember(null); }
    else if (step === STEPS.SCAN_BOOK) { setStep(STEPS.SCAN_MEMBER); setBook(null); setScannerActive(true); }
    else if (step === STEPS.CONFIRM) { setStep(STEPS.SCAN_BOOK); setScannerActive(true); }
    else { reset(); }
  };

  const reset = () => {
    setStep(STEPS.MODE);
    setMode(null);
    setMember(null);
    setBook(null);
    setResult(null);
    setScannerActive(false);
    setManualMemberId('');
    setManualBookId('');
    setScanMode('camera');
    fetchRecent();
  };

  // === Member identification ===
  const identifyMember = async (userId) => {
    try {
      const data = await api.get(`/api/users/${userId}`);
      if (!data || !data.fullName) throw new Error('Membre non trouvé');
      setMember(data);
      setStep(STEPS.SCAN_BOOK);
      setScannerActive(true);
      setScanMode('camera');
      setManualMemberId('');
      toast.success(`Membre identifié : ${data.fullName}`);
    } catch (err) {
      toast.error(err.message || 'Membre non trouvé');
      setScannerActive(true);
    }
  };

  const handleMemberScan = useCallback((text) => {
    setScannerActive(false);
    // Try to extract userId from QR data
    let userId = null;
    try {
      const parsed = JSON.parse(text);
      userId = parsed.userId || parsed._id;
    } catch {
      if (/^[a-f0-9]{24}$/.test(text)) userId = text;
    }
    if (!userId) {
      toast.error('QR code membre invalide');
      setScannerActive(true);
      return;
    }
    identifyMember(userId);
  }, []);

  const handleManualMember = (e) => {
    e.preventDefault();
    if (!manualMemberId.trim()) return;
    identifyMember(manualMemberId.trim());
  };

  // === Book identification ===
  const identifyBook = async (identifier) => {
    try {
      // Try as book ID first, then as ISBN
      let data;
      if (/^[a-f0-9]{24}$/.test(identifier)) {
        data = await api.get(`/api/books/${identifier}`);
      } else {
        // Search by ISBN
        const results = await api.get(`/api/books?search=${encodeURIComponent(identifier)}&limit=1`);
        data = results.books?.[0];
      }
      if (!data || !data.title) throw new Error('Livre non trouvé');
      setBook(data);
      setStep(STEPS.CONFIRM);
      setScannerActive(false);
      setManualBookId('');
    } catch (err) {
      toast.error(err.message || 'Livre non trouvé');
      setScannerActive(true);
    }
  };

  const handleBookScan = useCallback((text) => {
    setScannerActive(false);
    // QR code: extract book ID from /scan/book/{id}
    const qrMatch = text.match(/\/scan\/book\/([a-f0-9]{24})/);
    if (qrMatch) {
      identifyBook(qrMatch[1]);
      return;
    }
    // Barcode: ISBN
    const isbn = text.replace(/[^0-9X]/gi, '');
    if (isbn.length >= 10) {
      identifyBook(isbn);
      return;
    }
    // Direct ID
    if (/^[a-f0-9]{24}$/.test(text)) {
      identifyBook(text);
      return;
    }
    toast.error('Code non reconnu');
    setScannerActive(true);
  }, []);

  const handleManualBook = (e) => {
    e.preventDefault();
    if (!manualBookId.trim()) return;
    identifyBook(manualBookId.trim());
  };

  // === Execute operation ===
  const handleConfirm = async () => {
    setProcessing(true);
    try {
      if (mode === 'borrow') {
        await loansApi.borrow({ user: member._id, book: book._id });
        setResult({ success: true, message: `"${book.title}" emprunté par ${member.fullName}` });
      } else {
        const data = await loansApi.returnByScan({ isbn: book.isbn, userId: member._id });
        const msg = data.fine
          ? `"${book.title}" retourné. Amende : ${data.fine.amount} (${data.fine.daysLate}j de retard)`
          : `"${book.title}" retourné avec succès`;
        setResult({ success: true, message: msg, fine: data.fine });
      }
      setStep(STEPS.RESULT);
    } catch (err) {
      toast.error(err.message || 'Erreur');
      setResult({ success: false, message: err.message || 'Erreur lors de l\'opération' });
      setStep(STEPS.RESULT);
    } finally {
      setProcessing(false);
    }
  };

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:7080';

  return (
    <div className="lg:ml-64 pt-20 lg:pt-8 p-6">
      <div className="flex items-center gap-3 mb-6">
        {step !== STEPS.MODE && (
          <button onClick={goBack} className="p-2 rounded-lg hover:bg-[var(--color-bg)] cursor-pointer bg-transparent border-none">
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <h1 className="text-2xl font-bold">Prêts & Retours</h1>
      </div>

      <div className="max-w-2xl mx-auto">
        {/* Step indicator */}
        {step !== STEPS.MODE && (
          <div className="flex items-center gap-2 mb-6 text-sm">
            <StepDot active={step === STEPS.SCAN_MEMBER} done={member !== null} label="Membre" />
            <div className="flex-1 h-px bg-[var(--color-border)]" />
            <StepDot active={step === STEPS.SCAN_BOOK} done={book !== null} label="Livre" />
            <div className="flex-1 h-px bg-[var(--color-border)]" />
            <StepDot active={step === STEPS.CONFIRM || step === STEPS.RESULT} done={result?.success} label={mode === 'borrow' ? 'Emprunt' : 'Retour'} />
          </div>
        )}

        {/* MODE SELECTION */}
        {step === STEPS.MODE && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <button
              onClick={startBorrow}
              className="card hover:shadow-md transition-shadow p-8 flex flex-col items-center gap-3 cursor-pointer border-none text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-[var(--color-primary)]/10 flex items-center justify-center">
                <BookCopy className="w-8 h-8 text-[var(--color-primary)]" />
              </div>
              <h2 className="text-lg font-semibold">Nouvel emprunt</h2>
              <p className="text-sm text-[var(--color-text-light)]">Scanner la carte membre puis le livre</p>
            </button>
            <button
              onClick={startReturn}
              className="card hover:shadow-md transition-shadow p-8 flex flex-col items-center gap-3 cursor-pointer border-none text-center"
            >
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'rgba(1,20,220,0.1)' }}>
                <RotateCcw className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-lg font-semibold">Retour de livre</h2>
              <p className="text-sm text-[var(--color-text-light)]">Scanner la carte membre puis le livre à retourner</p>
            </button>
          </div>
        )}

        {/* SCAN MEMBER */}
        {step === STEPS.SCAN_MEMBER && (
          <div className="card">
            <div className="text-center mb-5">
              <UserCheck className="w-12 h-12 mx-auto text-[var(--color-primary)] mb-3" />
              <h2 className="text-lg font-semibold">Identifier le membre</h2>
              <p className="text-sm text-[var(--color-text-light)]">
                Scannez la carte membre QR ou entrez l'identifiant
              </p>
            </div>

            {/* Toggle camera/manual */}
            <div className="flex gap-2 justify-center mb-4">
              <button
                onClick={() => { setScanMode('camera'); setScannerActive(true); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer border-none ${
                  scanMode === 'camera' ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--color-bg)] text-[var(--color-text-light)]'
                }`}
              >
                <Camera className="w-4 h-4" /> Caméra
              </button>
              <button
                onClick={() => { setScanMode('manual'); setScannerActive(false); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer border-none ${
                  scanMode === 'manual' ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--color-bg)] text-[var(--color-text-light)]'
                }`}
              >
                <Keyboard className="w-4 h-4" /> Manuel
              </button>
            </div>

            {scanMode === 'camera' ? (
              <QRScanner onScan={handleMemberScan} active={scannerActive} onError={(msg) => toast.error(msg)} mode="qr" />
            ) : (
              <form onSubmit={handleManualMember} className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-light)]" />
                  <input
                    className="input pl-10"
                    placeholder="ID du membre..."
                    value={manualMemberId}
                    onChange={(e) => setManualMemberId(e.target.value)}
                    autoFocus
                  />
                </div>
                <button type="submit" className="btn-primary w-full">Rechercher</button>
              </form>
            )}
          </div>
        )}

        {/* SCAN BOOK */}
        {step === STEPS.SCAN_BOOK && (
          <div className="card">
            {/* Member badge */}
            {member && (
              <div className="flex items-center gap-3 p-3 mb-4 rounded-lg bg-[var(--color-bg)]">
                <UserCheck className="w-5 h-5 text-[var(--color-primary)]" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{member.fullName}</p>
                  <p className="text-xs text-[var(--color-text-light)]">{member.email}</p>
                </div>
                <span className="badge badge-success text-xs">Identifié</span>
              </div>
            )}

            <div className="text-center mb-5">
              <BookOpen className="w-12 h-12 mx-auto text-[var(--color-primary)] mb-3" />
              <h2 className="text-lg font-semibold">
                {mode === 'borrow' ? 'Scanner le livre à emprunter' : 'Scanner le livre à retourner'}
              </h2>
              <p className="text-sm text-[var(--color-text-light)]">
                Scannez le QR code ou le code-barres ISBN du livre
              </p>
            </div>

            {/* Toggle camera/manual */}
            <div className="flex gap-2 justify-center mb-4">
              <button
                onClick={() => { setScanMode('camera'); setScannerActive(true); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer border-none ${
                  scanMode === 'camera' ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--color-bg)] text-[var(--color-text-light)]'
                }`}
              >
                <Camera className="w-4 h-4" /> Caméra
              </button>
              <button
                onClick={() => { setScanMode('manual'); setScannerActive(false); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer border-none ${
                  scanMode === 'manual' ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--color-bg)] text-[var(--color-text-light)]'
                }`}
              >
                <Keyboard className="w-4 h-4" /> Manuel
              </button>
            </div>

            {scanMode === 'camera' ? (
              <QRScanner onScan={handleBookScan} active={scannerActive} onError={(msg) => toast.error(msg)} mode="both" />
            ) : (
              <form onSubmit={handleManualBook} className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-light)]" />
                  <input
                    className="input pl-10"
                    placeholder="ISBN ou ID du livre..."
                    value={manualBookId}
                    onChange={(e) => setManualBookId(e.target.value)}
                    autoFocus
                  />
                </div>
                <button type="submit" className="btn-primary w-full">Rechercher</button>
              </form>
            )}
          </div>
        )}

        {/* CONFIRM */}
        {step === STEPS.CONFIRM && member && book && (
          <div className="card">
            <h2 className="text-lg font-semibold text-center mb-5">
              {mode === 'borrow' ? 'Confirmer l\'emprunt' : 'Confirmer le retour'}
            </h2>

            {/* Member info */}
            <div className="flex items-center gap-3 p-3 mb-3 rounded-lg bg-[var(--color-bg)]">
              <UserCheck className="w-5 h-5 text-[var(--color-primary)]" />
              <div className="flex-1">
                <p className="text-sm font-medium">{member.fullName}</p>
                <p className="text-xs text-[var(--color-text-light)]">{member.email}</p>
              </div>
            </div>

            {/* Book info */}
            <div className="flex items-center gap-3 p-3 mb-5 rounded-lg bg-[var(--color-bg)]">
              {book.cover ? (
                <img
                  src={book.cover.startsWith('http') ? book.cover : `${API_URL}${book.cover}`}
                  alt={book.title}
                  className="w-12 h-16 object-cover rounded"
                />
              ) : (
                <div className="w-12 h-16 rounded flex items-center justify-center bg-[var(--color-border)]">
                  <BookOpen className="w-5 h-5 text-[var(--color-text-light)]" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{book.title}</p>
                <p className="text-xs text-[var(--color-text-light)]">{book.author?.join?.(', ') || book.author}</p>
                {book.isbn && <p className="text-xs text-[var(--color-text-light)] font-mono">ISBN: {book.isbn}</p>}
              </div>
              {mode === 'borrow' && (
                <span className={`text-xs font-medium px-2 py-1 rounded ${
                  book.availableCopies > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                }`}>
                  {book.availableCopies > 0 ? `${book.availableCopies} dispo.` : 'Indisponible'}
                </span>
              )}
            </div>

            <div className="flex gap-3">
              <button onClick={goBack} className="btn-secondary flex-1">
                Annuler
              </button>
              <button
                onClick={handleConfirm}
                disabled={processing || (mode === 'borrow' && book.availableCopies <= 0)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium text-white cursor-pointer border-none transition-opacity disabled:opacity-40 ${
                  mode === 'borrow' ? 'bg-[var(--color-primary)]' : 'bg-blue-600'
                }`}
              >
                {processing ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : mode === 'borrow' ? (
                  <BookCopy className="w-4 h-4" />
                ) : (
                  <RotateCcw className="w-4 h-4" />
                )}
                {processing ? 'Traitement...' : mode === 'borrow' ? 'Confirmer l\'emprunt' : 'Confirmer le retour'}
              </button>
            </div>
          </div>
        )}

        {/* RESULT */}
        {step === STEPS.RESULT && result && (
          <div className="card text-center">
            {result.success ? (
              <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
            ) : (
              <AlertCircle className="w-16 h-16 mx-auto text-red-500 mb-4" />
            )}
            <h2 className="text-lg font-semibold mb-2">
              {result.success ? 'Opération réussie !' : 'Erreur'}
            </h2>
            <p className="text-[var(--color-text-light)] mb-5">{result.message}</p>

            {result.fine && (
              <div className="rounded-lg p-4 mb-4 text-left" style={{ backgroundColor: 'rgba(255,152,0,0.08)', border: '1px solid rgba(255,152,0,0.2)' }}>
                <p className="text-sm font-medium" style={{ color: '#e65100' }}>
                  Amende : {result.fine.amount} ({result.fine.daysLate} jour(s) de retard)
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => { setBook(null); setResult(null); setStep(STEPS.SCAN_BOOK); setScannerActive(true); setScanMode('camera'); }} className="btn-primary flex-1">
                {mode === 'borrow' ? 'Emprunter un autre' : 'Retourner un autre'}
              </button>
              <button onClick={reset} className="btn-secondary flex-1">
                Terminer
              </button>
            </div>
          </div>
        )}

        {/* RECENT LOANS */}
        {step === STEPS.MODE && (
          <div className="card mt-6">
            <h2 className="font-semibold mb-4">Emprunts récents</h2>
            {recentLoans.length === 0 ? (
              <p className="text-center text-[var(--color-text-light)] py-8">Aucun emprunt récent</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--color-border)]">
                      <th className="text-left py-2 font-medium text-[var(--color-text-light)]">Membre</th>
                      <th className="text-left py-2 font-medium text-[var(--color-text-light)]">Livre</th>
                      <th className="text-left py-2 font-medium text-[var(--color-text-light)]">Statut</th>
                      <th className="text-left py-2 font-medium text-[var(--color-text-light)]">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentLoans.map((loan) => (
                      <tr key={loan._id} className="border-b border-[var(--color-border)] last:border-0">
                        <td className="py-2.5">{loan.user?.fullName || '—'}</td>
                        <td className="py-2.5">{loan.book?.title || '—'}</td>
                        <td className="py-2.5">
                          <span className={`badge ${loan.status === 'returned' ? 'badge-success' : loan.status === 'late' ? 'badge-danger' : 'badge-info'}`}>
                            {loan.status === 'borrowed' ? 'Emprunté' : loan.status === 'returned' ? 'Retourné' : 'En retard'}
                          </span>
                        </td>
                        <td className="py-2.5 text-[var(--color-text-light)]">
                          {new Date(loan.createdAt).toLocaleDateString('fr-FR')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function StepDot({ active, done, label }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
        done ? 'bg-blue-500 text-white' : active ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--color-bg)] text-[var(--color-text-light)]'
      }`}>
        {done ? '✓' : active ? '●' : '○'}
      </div>
      <span className={`text-xs ${active ? 'font-medium text-[var(--color-text)]' : 'text-[var(--color-text-light)]'}`}>
        {label}
      </span>
    </div>
  );
}
