import { useState, useEffect } from 'react';
import { presenceApi } from '../../api/presence.js';
import { UserCheck, UserX, Search, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function EmployeePresence() {
  const [userId, setUserId] = useState('');
  const [presences, setPresences] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchToday = () => {
    presenceApi.getToday()
      .then(setPresences)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchToday(); }, []);

  const handleCheckIn = async () => {
    if (!userId.trim()) return toast.error('Entrez un identifiant utilisateur');
    try {
      await presenceApi.checkIn({ userId: userId.trim() });
      toast.success('Entrée enregistrée');
      setUserId('');
      fetchToday();
    } catch (err) {
      toast.error(err.message || 'Erreur');
    }
  };

  const handleCheckOut = async () => {
    if (!userId.trim()) return toast.error('Entrez un identifiant utilisateur');
    try {
      await presenceApi.checkOut({ userId: userId.trim() });
      toast.success('Sortie enregistrée');
      setUserId('');
      fetchToday();
    } catch (err) {
      toast.error(err.message || 'Erreur');
    }
  };

  const formatTime = (d) => d ? new Date(d).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '—';

  return (
    <div className="lg:ml-64 pt-20 lg:pt-8 p-6">
      <h1 className="text-2xl font-bold mb-6">Gestion de présence</h1>

      <div className="card mb-6">
        <h2 className="font-semibold mb-4 flex items-center gap-2">
          <Search className="w-5 h-5" />
          Scanner / Saisir un membre
        </h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            className="input flex-1"
            placeholder="ID utilisateur ou scan QR code..."
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCheckIn()}
          />
          <button onClick={handleCheckIn} className="btn-primary flex items-center gap-2">
            <UserCheck className="w-4 h-4" />
            Entrée
          </button>
          <button onClick={handleCheckOut} className="btn-secondary flex items-center gap-2">
            <UserX className="w-4 h-4" />
            Sortie
          </button>
        </div>
      </div>

      <div className="card">
        <h2 className="font-semibold mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Présences du jour ({presences.length})
        </h2>
        {loading ? (
          <div className="skeleton h-32 rounded-lg" />
        ) : presences.length === 0 ? (
          <p className="text-center text-[var(--color-text-light)] py-8">Aucune présence enregistrée aujourd'hui</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)]">
                  <th className="text-left py-2 font-medium text-[var(--color-text-light)]">Membre</th>
                  <th className="text-left py-2 font-medium text-[var(--color-text-light)]">Entrée</th>
                  <th className="text-left py-2 font-medium text-[var(--color-text-light)]">Sortie</th>
                  <th className="text-left py-2 font-medium text-[var(--color-text-light)]">Statut</th>
                </tr>
              </thead>
              <tbody>
                {presences.map((p) => (
                  <tr key={p._id} className="border-b border-[var(--color-border)] last:border-0">
                    <td className="py-2.5">{p.user?.fullName || p.user?.email || '—'}</td>
                    <td className="py-2.5">{formatTime(p.checkIn)}</td>
                    <td className="py-2.5">{formatTime(p.checkOut)}</td>
                    <td className="py-2.5">
                      <span className={`badge ${p.checkOut ? 'badge-success' : 'badge-info'}`}>
                        {p.checkOut ? 'Sorti' : 'Présent'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
