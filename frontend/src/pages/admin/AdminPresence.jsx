import { useState, useEffect } from 'react';
import { presenceApi } from '../../api/presence.js';
import { UserCheck, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminPresence() {
  const [presences, setPresences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState('');

  const fetchToday = () => {
    presenceApi.getToday()
      .then(setPresences)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchToday(); }, []);

  const handleCheckIn = async (e) => {
    e.preventDefault();
    if (!userId.trim()) return;
    try {
      await presenceApi.checkIn({ userId });
      toast.success('Entrée enregistrée');
      setUserId('');
      fetchToday();
    } catch (err) { toast.error(err.message); }
  };

  const handleCheckOut = async (id) => {
    try {
      await presenceApi.checkOut(id);
      toast.success('Sortie enregistrée');
      fetchToday();
    } catch (err) { toast.error(err.message); }
  };

  return (
    <div className="lg:ml-64 pt-20 lg:pt-8 p-6">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-3">
        <UserCheck className="w-7 h-7" /> Présence
      </h1>

      <form onSubmit={handleCheckIn} className="card mb-6 flex gap-3">
        <input className="input flex-1" placeholder="ID utilisateur" value={userId} onChange={(e) => setUserId(e.target.value)} />
        <button type="submit" className="btn-primary">Enregistrer entrée</button>
      </form>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="skeleton h-14 rounded-xl" />)}</div>
      ) : presences.length === 0 ? (
        <p className="text-center text-[var(--color-text-light)] py-12">Aucune entrée aujourd'hui</p>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)]">
                <th className="text-left py-3 font-medium text-[var(--color-text-light)]">Membre</th>
                <th className="text-left py-3 font-medium text-[var(--color-text-light)]">Entrée</th>
                <th className="text-left py-3 font-medium text-[var(--color-text-light)]">Sortie</th>
                <th className="text-right py-3 font-medium text-[var(--color-text-light)]">Action</th>
              </tr>
            </thead>
            <tbody>
              {presences.map(p => (
                <tr key={p._id} className="border-b border-[var(--color-border)] last:border-0">
                  <td className="py-2.5 font-medium">{p.user?.fullName || '—'}</td>
                  <td className="py-2.5">{new Date(p.checkIn).toLocaleTimeString('fr-FR')}</td>
                  <td className="py-2.5">{p.checkOut ? new Date(p.checkOut).toLocaleTimeString('fr-FR') : <span className="badge badge-success">Présent</span>}</td>
                  <td className="py-2.5 text-right">
                    {!p.checkOut && (
                      <button onClick={() => handleCheckOut(p._id)} className="inline-flex items-center gap-1 text-xs font-medium text-orange-600 hover:text-orange-700 cursor-pointer bg-transparent border-none">
                        <LogOut className="w-4 h-4" /> Sortie
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
