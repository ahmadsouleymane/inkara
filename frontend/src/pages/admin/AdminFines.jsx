import { useState, useEffect } from 'react';
import { finesApi } from '../../api/fines.js';
import { Banknote, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminFines() {
  const [fines, setFines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  const fetchFines = () => {
    setLoading(true);
    finesApi.getAll(filter ? `status=${filter}` : '')
      .then(data => setFines(data.fines || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchFines(); }, [filter]);

  const handlePay = async (id) => {
    try {
      await finesApi.pay(id);
      toast.success('Amende marquée comme payée');
      fetchFines();
    } catch (err) { toast.error(err.message); }
  };

  return (
    <div className="lg:ml-64 pt-20 lg:pt-8 p-6">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-3">
        <Banknote className="w-7 h-7" /> Amendes
      </h1>

      <div className="flex gap-2 mb-6">
        {['', 'pending', 'paid'].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer border-none ${filter === f ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--color-surface)] text-[var(--color-text-light)] hover:bg-gray-100'}`}>
            {f === '' ? 'Toutes' : f === 'pending' ? 'En attente' : 'Payées'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="skeleton h-14 rounded-xl" />)}</div>
      ) : fines.length === 0 ? (
        <p className="text-center text-[var(--color-text-light)] py-20">Aucune amende</p>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)]">
                <th className="text-left py-3 font-medium text-[var(--color-text-light)]">Membre</th>
                <th className="text-left py-3 font-medium text-[var(--color-text-light)]">Montant</th>
                <th className="text-left py-3 font-medium text-[var(--color-text-light)]">Raison</th>
                <th className="text-left py-3 font-medium text-[var(--color-text-light)]">Statut</th>
                <th className="text-right py-3 font-medium text-[var(--color-text-light)]">Action</th>
              </tr>
            </thead>
            <tbody>
              {fines.map(f => (
                <tr key={f._id} className="border-b border-[var(--color-border)] last:border-0">
                  <td className="py-2.5">{f.user?.fullName || '—'}</td>
                  <td className="py-2.5 font-semibold">{f.amount} FCFA</td>
                  <td className="py-2.5 text-[var(--color-text-light)]">{f.reason || `${f.daysLate} jour(s) de retard`}</td>
                  <td className="py-2.5"><span className={`badge ${f.status === 'paid' ? 'badge-success' : 'badge-warning'}`}>{f.status === 'paid' ? 'Payée' : 'En attente'}</span></td>
                  <td className="py-2.5 text-right">
                    {f.status === 'pending' && (
                      <button onClick={() => handlePay(f._id)} className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 cursor-pointer bg-transparent border-none">
                        <CheckCircle className="w-4 h-4" /> Marquer payée
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
