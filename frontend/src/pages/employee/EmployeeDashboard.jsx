import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { loansApi } from '../../api/loans.js';
import { BookCopy, AlertTriangle, Clock, TrendingUp, ArrowRight, ScanLine, UserCheck } from 'lucide-react';

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loansApi.getDashboardStats()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="lg:ml-64 pt-20 lg:pt-8 p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <div key={i} className="skeleton h-28 rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="lg:ml-64 pt-20 lg:pt-8 p-6">
      <h1 className="text-2xl font-bold mb-6">Bonjour, {user?.fullName}</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
            <Clock className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <p className="text-2xl font-bold">{stats?.dueToday || 0}</p>
            <p className="text-sm text-[var(--color-text-light)]">À rendre aujourd'hui</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <p className="text-2xl font-bold">{stats?.overdue || 0}</p>
            <p className="text-sm text-[var(--color-text-light)]">En retard</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <BookCopy className="w-6 h-6 text-[var(--color-primary)]" />
          </div>
          <div>
            <p className="text-2xl font-bold">{stats?.activeLoans || 0}</p>
            <p className="text-sm text-[var(--color-text-light)]">Emprunts actifs</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold">{stats?.todayLoans || 0}</p>
            <p className="text-sm text-[var(--color-text-light)]">Emprunts du jour</p>
          </div>
        </div>
      </div>

      <h2 className="text-lg font-semibold mb-4">Actions rapides</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/employee/pret" className="card hover:shadow-md transition-shadow no-underline text-[var(--color-text)] flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <ScanLine className="w-6 h-6 text-[var(--color-primary)]" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold">Prêt / Retour</h3>
            <p className="text-sm text-[var(--color-text-light)]">Gérer les emprunts et retours</p>
          </div>
          <ArrowRight className="w-5 h-5 text-[var(--color-text-light)]" />
        </Link>
        <Link to="/employee/presence" className="card hover:shadow-md transition-shadow no-underline text-[var(--color-text)] flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <UserCheck className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold">Présence</h3>
            <p className="text-sm text-[var(--color-text-light)]">Enregistrer les entrées/sorties</p>
          </div>
          <ArrowRight className="w-5 h-5 text-[var(--color-text-light)]" />
        </Link>
        <Link to="/emprunts" className="card hover:shadow-md transition-shadow no-underline text-[var(--color-text)] flex items-center gap-4">
          <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center">
            <BookCopy className="w-6 h-6 text-cyan-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold">Tous les emprunts</h3>
            <p className="text-sm text-[var(--color-text-light)]">Voir l'historique complet</p>
          </div>
          <ArrowRight className="w-5 h-5 text-[var(--color-text-light)]" />
        </Link>
      </div>
    </div>
  );
}
