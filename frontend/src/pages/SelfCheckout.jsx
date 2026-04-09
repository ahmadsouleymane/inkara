import { useState, useCallback } from 'react';
import { selfCheckoutApi } from '../api/qr.js';
import QRScanner from '../components/QRScanner.jsx';
import { UserCheck, BookOpen, RotateCcw, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const STEPS = { SCAN_MEMBER: 'scan_member', MENU: 'menu', SCAN_BOOK: 'scan_book', RESULT: 'result' };

export default function SelfCheckout() {
  const [step, setStep] = useState(STEPS.SCAN_MEMBER);
  const [member, setMember] = useState(null);
  const [activeLoans, setActiveLoans] = useState([]);
  const [mode, setMode] = useState(null); // 'borrow' | 'return'
  const [result, setResult] = useState(null);
  const [scannerActive, setScannerActive] = useState(true);

  const extractBookId = (text) => {
    // Extraire l'ID du livre depuis l'URL du QR: /scan/book/{bookId}
    const match = text.match(/\/scan\/book\/([a-f0-9]{24})/);
    return match ? match[1] : null;
  };

  const extractUserId = (text) => {
    // Tenter de parser un JSON {userId: ...} ou un ObjectId direct
    try {
      const parsed = JSON.parse(text);
      return parsed.userId || parsed._id || null;
    } catch {
      return text.match(/^[a-f0-9]{24}$/) ? text : null;
    }
  };

  const handleMemberScan = useCallback(async (text) => {
    setScannerActive(false);
    const userId = extractUserId(text);
    if (!userId) {
      toast.error('QR code membre invalide');
      setScannerActive(true);
      return;
    }

    try {
      const data = await selfCheckoutApi.identify(userId);
      setMember(data.user);
      setActiveLoans(data.activeLoans);
      setStep(STEPS.MENU);
    } catch (err) {
      toast.error(err.message);
      setScannerActive(true);
    }
  }, []);

  const handleBookScan = useCallback(async (text) => {
    setScannerActive(false);
    const bookId = extractBookId(text);
    if (!bookId) {
      toast.error('QR code livre invalide');
      setScannerActive(true);
      return;
    }

    try {
      if (mode === 'borrow') {
        const loan = await selfCheckoutApi.borrow(member._id, bookId);
        setResult({ success: true, message: `"${loan.book?.title}" emprunté avec succès !`, loan });
      } else {
        const data = await selfCheckoutApi.return(member._id, bookId);
        const msg = data.fine
          ? `"${data.loan.book?.title}" retourné. Amende de ${data.fine.amount} (${data.fine.daysLate}j de retard).`
          : `"${data.loan.book?.title}" retourné avec succès !`;
        setResult({ success: true, message: msg, fine: data.fine });
      }
      setStep(STEPS.RESULT);
    } catch (err) {
      toast.error(err.message);
      setScannerActive(true);
    }
  }, [mode, member]);

  const reset = () => {
    setStep(STEPS.SCAN_MEMBER);
    setMember(null);
    setActiveLoans([]);
    setMode(null);
    setResult(null);
    setScannerActive(true);
  };

  const startBorrow = () => { setMode('borrow'); setStep(STEPS.SCAN_BOOK); setScannerActive(true); };
  const startReturn = () => { setMode('return'); setStep(STEPS.SCAN_BOOK); setScannerActive(true); };
  const scanAnother = () => { setStep(STEPS.SCAN_BOOK); setResult(null); setScannerActive(true); };

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[var(--color-primary)]">Borne Libre-Service</h1>
          <p className="text-[var(--color-text-light)] mt-1">SmartLib Self-Checkout</p>
        </div>

        {/* Step 1: Scan membre */}
        {step === STEPS.SCAN_MEMBER && (
          <div className="card text-center">
            <UserCheck className="w-16 h-16 mx-auto text-[var(--color-primary)] mb-4" />
            <h2 className="text-xl font-semibold mb-2">Scannez votre carte membre</h2>
            <p className="text-[var(--color-text-light)] mb-6">Présentez votre QR code devant la caméra</p>
            <QRScanner onScan={handleMemberScan} active={scannerActive} onError={(msg) => toast.error(msg)} />
          </div>
        )}

        {/* Step 2: Menu */}
        {step === STEPS.MENU && member && (
          <div className="card">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-[var(--color-primary)]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <UserCheck className="w-8 h-8 text-[var(--color-primary)]" />
              </div>
              <h2 className="text-xl font-semibold">Bonjour, {member.fullName}</h2>
              <p className="text-sm text-[var(--color-text-light)]">{activeLoans.length} emprunt(s) en cours</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <button onClick={startBorrow} className="btn-primary py-6 flex flex-col items-center gap-2 text-lg">
                <BookOpen className="w-8 h-8" />
                Emprunter
              </button>
              <button onClick={startReturn} className="btn-secondary py-6 flex flex-col items-center gap-2 text-lg">
                <RotateCcw className="w-8 h-8" />
                Retourner
              </button>
            </div>

            {activeLoans.length > 0 && (
              <div>
                <h3 className="font-medium text-sm text-[var(--color-text-light)] mb-2">Vos emprunts en cours :</h3>
                <div className="space-y-2">
                  {activeLoans.map((loan) => (
                    <div key={loan._id} className="flex items-center gap-3 p-2 bg-[var(--color-bg)] rounded">
                      <BookOpen className="w-4 h-4 text-[var(--color-text-light)]" />
                      <span className="text-sm flex-1 truncate">{loan.book?.title}</span>
                      <span className={`text-xs px-2 py-0.5 rounded ${loan.status === 'late' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                        {loan.status === 'late' ? 'En retard' : 'En cours'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button onClick={reset} className="w-full mt-4 text-center text-sm text-[var(--color-text-light)] hover:underline">
              Changer d'utilisateur
            </button>
          </div>
        )}

        {/* Step 3: Scan livre */}
        {step === STEPS.SCAN_BOOK && (
          <div className="card text-center">
            <BookOpen className="w-16 h-16 mx-auto text-[var(--color-primary)] mb-4" />
            <h2 className="text-xl font-semibold mb-2">
              {mode === 'borrow' ? 'Scannez le livre à emprunter' : 'Scannez le livre à retourner'}
            </h2>
            <p className="text-[var(--color-text-light)] mb-6">Présentez le QR code du livre devant la caméra</p>
            <QRScanner onScan={handleBookScan} active={scannerActive} onError={(msg) => toast.error(msg)} />
            <button onClick={() => { setStep(STEPS.MENU); setScannerActive(false); }} className="mt-4 text-sm text-[var(--color-text-light)] hover:underline flex items-center gap-1 mx-auto">
              <ArrowLeft className="w-4 h-4" /> Retour au menu
            </button>
          </div>
        )}

        {/* Step 4: Résultat */}
        {step === STEPS.RESULT && result && (
          <div className="card text-center">
            {result.success ? (
              <CheckCircle className="w-20 h-20 mx-auto text-green-500 mb-4" />
            ) : (
              <AlertCircle className="w-20 h-20 mx-auto text-red-500 mb-4" />
            )}
            <h2 className="text-xl font-semibold mb-2">{result.success ? 'Opération réussie !' : 'Erreur'}</h2>
            <p className="text-[var(--color-text-light)] mb-6">{result.message}</p>

            {result.fine && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                <p className="text-orange-700 font-medium">Amende : {result.fine.amount} ({result.fine.daysLate} jour(s) de retard)</p>
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={scanAnother} className="btn-primary flex-1">
                {mode === 'borrow' ? 'Emprunter un autre livre' : 'Retourner un autre livre'}
              </button>
              <button onClick={reset} className="btn-secondary flex-1">
                Terminer
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
