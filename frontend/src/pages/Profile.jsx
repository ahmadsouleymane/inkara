import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { authApi } from '../api/auth.js';
import { loansApi } from '../api/loans.js';
import { User, BookCopy, Heart, QrCode, BarChart3 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loans, setLoans] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [tab, setTab] = useState('loans');

  useEffect(() => {
    if (user?._id) {
      authApi.getUserStats(user._id).then(setStats).catch(console.error);
      loansApi.getUserLoans(user._id).then(setLoans).catch(console.error);
      authApi.getFavorites().then(setFavorites).catch(console.error);
    }
  }, [user]);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:7080';

  return (
    <div className="lg:ml-64 pt-20 lg:pt-8 p-6">
      {/* Profil header */}
      <div className="card mb-6">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold" style={{ backgroundColor: 'rgba(1,20,220,0.15)', color: 'var(--color-primary)' }}>
            {user?.fullName?.charAt(0)?.toUpperCase()}
          </div>
          <div className="text-center sm:text-left flex-1">
            <h1 className="text-2xl font-bold">{user?.fullName}</h1>
            <p className="text-[var(--color-text-light)]">{user?.email}</p>
            <span className="badge badge-info mt-2 capitalize">{user?.role}</span>
          </div>
          {user?.qrCode && (
            <div className="flex-shrink-0">
              <img src={user.qrCode} alt="QR Code" className="w-24 h-24 rounded-lg border border-[var(--color-border)]" />
              <p className="text-xs text-center text-[var(--color-text-light)] mt-1">Mon QR Code</p>
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="card text-center">
            <p className="text-2xl font-bold text-[var(--color-primary)]">{stats.totalLoans}</p>
            <p className="text-xs text-[var(--color-text-light)]">Total emprunts</p>
          </div>
          <div className="card text-center">
            <p className="text-2xl font-bold text-blue-600">{stats.activeLoans}</p>
            <p className="text-xs text-[var(--color-text-light)]">En cours</p>
          </div>
          <div className="card text-center">
            <p className="text-2xl font-bold text-blue-600">{stats.returnedLoans}</p>
            <p className="text-xs text-[var(--color-text-light)]">Retournés</p>
          </div>
          <div className="card text-center">
            <p className="text-2xl font-bold text-red-600">{stats.lateLoans}</p>
            <p className="text-xs text-[var(--color-text-light)]">En retard</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { key: 'loans', label: 'Mes emprunts', icon: BookCopy },
          { key: 'favorites', label: 'Favoris', icon: Heart },
        ].map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setTab(key)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer border-none ${tab === key ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--color-surface)] text-[var(--color-text-light)] border border-[var(--color-border)] hover:bg-gray-100'}`}>
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      {/* Content */}
      {tab === 'loans' && (
        <div className="card">
          {loans.length === 0 ? (
            <p className="text-center text-[var(--color-text-light)] py-8">Aucun emprunt</p>
          ) : (
            <div className="space-y-3">
              {loans.map(loan => (
                <div key={loan._id} className="flex items-center gap-4 py-3 border-b border-[var(--color-border)] last:border-0">
                  <div className="w-10 h-14 rounded overflow-hidden flex-shrink-0" style={{ backgroundColor: 'var(--color-bg)' }}>
                    {loan.book?.cover ? (
                      <img src={loan.book.cover.startsWith('http') ? loan.book.cover : `${API_URL}${loan.book.cover}`} alt="" className="w-full h-full object-cover" />
                    ) : null}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{loan.book?.title}</p>
                    <p className="text-xs text-[var(--color-text-light)]">{loan.book?.author?.join(', ')}</p>
                  </div>
                  <span className={`badge text-xs ${loan.status === 'returned' ? 'badge-success' : loan.status === 'late' ? 'badge-danger' : 'badge-info'}`}>
                    {loan.status === 'borrowed' ? 'En cours' : loan.status === 'returned' ? 'Retourné' : 'En retard'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'favorites' && (
        <div className="card">
          {favorites.length === 0 ? (
            <p className="text-center text-[var(--color-text-light)] py-8">Aucun favori</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {favorites.map(book => (
                <div key={book._id} className="flex items-center gap-4 p-3 rounded-lg" style={{ backgroundColor: 'var(--color-bg)' }}>
                  <div className="w-10 h-14 rounded overflow-hidden flex-shrink-0" style={{ backgroundColor: 'var(--color-border)' }}>
                    {book.cover ? (
                      <img src={book.cover.startsWith('http') ? book.cover : `${API_URL}${book.cover}`} alt="" className="w-full h-full object-cover" />
                    ) : null}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{book.title}</p>
                    <p className="text-xs text-[var(--color-text-light)]">{book.author?.join(', ')}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
