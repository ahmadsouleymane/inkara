import { useState, useEffect } from 'react';
import { reservationsApi } from '../../api/reservations.js';
import { Bookmark } from 'lucide-react';

export default function AdminReservations() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reservationsApi.getAll()
      .then(setReservations)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const statusLabel = { pending: 'En attente', available: 'Disponible', cancelled: 'Annulée', expired: 'Expirée' };
  const statusBadge = { pending: 'badge-warning', available: 'badge-success', cancelled: 'badge-danger', expired: 'badge-danger' };

  return (
    <div className="lg:ml-64 pt-20 lg:pt-8 p-6">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-3">
        <Bookmark className="w-7 h-7" /> Réservations
      </h1>
      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="skeleton h-14 rounded-xl" />)}</div>
      ) : reservations.length === 0 ? (
        <p className="text-center text-[var(--color-text-light)] py-20">Aucune réservation</p>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)]">
                <th className="text-left py-3 font-medium text-[var(--color-text-light)]">Membre</th>
                <th className="text-left py-3 font-medium text-[var(--color-text-light)]">Livre</th>
                <th className="text-left py-3 font-medium text-[var(--color-text-light)]">Statut</th>
                <th className="text-left py-3 font-medium text-[var(--color-text-light)]">Date</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map(r => (
                <tr key={r._id} className="border-b border-[var(--color-border)] last:border-0">
                  <td className="py-2.5">{r.user?.fullName || '—'}</td>
                  <td className="py-2.5">{r.book?.title || '—'}</td>
                  <td className="py-2.5"><span className={`badge ${statusBadge[r.status]}`}>{statusLabel[r.status]}</span></td>
                  <td className="py-2.5 text-[var(--color-text-light)]">{new Date(r.createdAt).toLocaleDateString('fr-FR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
