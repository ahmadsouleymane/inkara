import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { loansApi } from '../api/loans.js';
import Modal from '../components/Modal.jsx';
import { BookCopy, Plus, RotateCcw, CheckCircle, Search } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Loans() {
  const { user } = useAuth();
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [showBorrowModal, setShowBorrowModal] = useState(false);
  const [borrowForm, setBorrowForm] = useState({ userId: '', bookId: '' });

  const isStaff = ['admin', 'owner', 'librarian'].includes(user?.role);

  const fetchLoans = async () => {
    setLoading(true);
    try {
      if (isStaff) {
        const params = filter ? `status=${filter}` : '';
        const data = await loansApi.getAll(params);
        setLoans(data.loans);
      } else {
        const data = await loansApi.getUserLoans(user._id);
        setLoans(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, [filter]);

  const handleReturn = async (loanId) => {
    try {
      await loansApi.return(loanId);
      toast.success('Retour enregistré');
      fetchLoans();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleRenew = async (loanId) => {
    try {
      await loansApi.renew(loanId);
      toast.success('Emprunt renouvelé');
      fetchLoans();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleBorrow = async (e) => {
    e.preventDefault();
    try {
      await loansApi.borrow(borrowForm);
      toast.success('Emprunt créé');
      setShowBorrowModal(false);
      setBorrowForm({ userId: '', bookId: '' });
      fetchLoans();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const statusLabel = (s) => {
    if (s === 'borrowed') return 'Emprunté';
    if (s === 'returned') return 'Retourné';
    if (s === 'late') return 'En retard';
    return s;
  };

  const statusBadge = (s) => {
    if (s === 'returned') return 'badge-success';
    if (s === 'late') return 'badge-danger';
    return 'badge-info';
  };

  return (
    <div className="lg:ml-64 pt-20 lg:pt-8 p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">
          {isStaff ? 'Gestion des emprunts' : 'Mes emprunts'}
        </h1>
        {isStaff && (
          <button onClick={() => setShowBorrowModal(true)} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Nouvel emprunt
          </button>
        )}
      </div>

      {/* Filtres */}
      {isStaff && (
        <div className="flex gap-2 mb-6">
          {['', 'borrowed', 'late', 'returned'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer border-none ${
                filter === f
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'bg-[var(--color-surface)] text-[var(--color-text-light)] hover:bg-gray-100 border border-[var(--color-border)]'
              }`}
            >
              {f === '' ? 'Tous' : statusLabel(f)}
            </button>
          ))}
        </div>
      )}

      {/* Liste des emprunts */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="skeleton h-16 rounded-xl" />
          ))}
        </div>
      ) : loans.length === 0 ? (
        <div className="text-center py-20">
          <BookCopy className="w-16 h-16 text-[var(--color-text-light)] mx-auto mb-4 opacity-30" />
          <p className="text-[var(--color-text-light)]">Aucun emprunt trouvé</p>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)]">
                {isStaff && <th className="text-left py-3 font-medium text-[var(--color-text-light)]">Membre</th>}
                <th className="text-left py-3 font-medium text-[var(--color-text-light)]">Livre</th>
                <th className="text-left py-3 font-medium text-[var(--color-text-light)]">Emprunté le</th>
                <th className="text-left py-3 font-medium text-[var(--color-text-light)]">Échéance</th>
                <th className="text-left py-3 font-medium text-[var(--color-text-light)]">Statut</th>
                {isStaff && <th className="text-right py-3 font-medium text-[var(--color-text-light)]">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {loans.map((loan) => (
                <tr key={loan._id} className="border-b border-[var(--color-border)] last:border-0">
                  {isStaff && (
                    <td className="py-3 font-medium">{loan.user?.fullName || '—'}</td>
                  )}
                  <td className="py-3">
                    <span className="font-medium">{loan.book?.title || '—'}</span>
                  </td>
                  <td className="py-3 text-[var(--color-text-light)]">
                    {new Date(loan.borrowDate).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="py-3 text-[var(--color-text-light)]">
                    {new Date(loan.dueDate).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="py-3">
                    <span className={`badge ${statusBadge(loan.status)}`}>
                      {statusLabel(loan.status)}
                    </span>
                  </td>
                  {isStaff && (
                    <td className="py-3 text-right">
                      {loan.status !== 'returned' && (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleReturn(loan._id)}
                            className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 cursor-pointer bg-transparent border-none"
                            title="Retourner"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Retour
                          </button>
                          {loan.renewCount < 2 && (
                            <button
                              onClick={() => handleRenew(loan._id)}
                              className="inline-flex items-center gap-1 text-xs font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] cursor-pointer bg-transparent border-none"
                              title="Renouveler"
                            >
                              <RotateCcw className="w-4 h-4" />
                              Renouveler
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal nouvel emprunt */}
      <Modal isOpen={showBorrowModal} onClose={() => setShowBorrowModal(false)} title="Nouvel emprunt">
        <form onSubmit={handleBorrow} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">ID de l'utilisateur</label>
            <input
              className="input"
              placeholder="ID MongoDB de l'utilisateur"
              value={borrowForm.userId}
              onChange={(e) => setBorrowForm({ ...borrowForm, userId: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">ID du livre</label>
            <input
              className="input"
              placeholder="ID MongoDB du livre"
              value={borrowForm.bookId}
              onChange={(e) => setBorrowForm({ ...borrowForm, bookId: e.target.value })}
              required
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary">Créer l'emprunt</button>
            <button type="button" onClick={() => setShowBorrowModal(false)} className="btn-secondary">Annuler</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
