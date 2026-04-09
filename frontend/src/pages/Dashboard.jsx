import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { statsApi } from '../api/stats.js';
import { organizationApi } from '../api/organization.js';
import { loansApi } from '../api/loans.js';
import {
  BookOpen, Users, BookCopy, AlertTriangle, ArrowRight,
  TrendingUp, Download, FileText, Plus, Globe
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

const COLORS = ['#2a9d4e', '#e8a838', '#e06c5a', '#2563eb', '#8b5cf6', '#06b6d4', '#ec4899'];

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [org, setOrg] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        if (user?.role === 'owner' || user?.role === 'admin') {
          const [s, o] = await Promise.all([
            statsApi.getDashboard(),
            organizationApi.getMine(),
          ]);
          setStats(s);
          setOrg(o);
        } else if (user?.role === 'librarian') {
          const s = await loansApi.getDashboardStats();
          setStats(s);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const monthNames = ['Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aou', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthlyData = stats?.monthlyLoans?.map((m) => ({
    name: monthNames[m._id.month - 1],
    emprunts: m.count,
  })) || [];

  const categoryData = stats?.categoryDistribution?.map((c) => ({
    name: c._id,
    value: c.count,
  })) || [];

  if (loading) {
    return (
      <div className="lg:ml-64 pt-20 lg:pt-8 p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton h-28 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────
  // MEMBER — simplified dashboard
  // ──────────────────────────────────────────────
  if (user?.role === 'member') {
    return (
      <div className="lg:ml-64 pt-20 lg:pt-8 p-6">
        <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-text)' }}>
          Bienvenue, {user.fullName}
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            to="/livres"
            className="no-underline"
            style={{ color: 'var(--color-text)' }}
          >
            <div
              className="rounded-xl p-5 flex items-center gap-4 transition-shadow hover:shadow-md"
              style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: 'rgba(42,157,78,0.1)' }}
              >
                <BookOpen className="w-6 h-6" style={{ color: 'var(--color-primary)' }} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Catalogue</h3>
                <p className="text-sm" style={{ color: 'var(--color-text-light)' }}>
                  Parcourir les livres disponibles
                </p>
              </div>
              <ArrowRight className="w-5 h-5" style={{ color: 'var(--color-text-light)' }} />
            </div>
          </Link>

          <Link
            to="/emprunts"
            className="no-underline"
            style={{ color: 'var(--color-text)' }}
          >
            <div
              className="rounded-xl p-5 flex items-center gap-4 transition-shadow hover:shadow-md"
              style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: 'rgba(232,168,56,0.1)' }}
              >
                <BookCopy className="w-6 h-6" style={{ color: 'var(--color-orange)' }} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Mes emprunts</h3>
                <p className="text-sm" style={{ color: 'var(--color-text-light)' }}>
                  Voir l'historique de vos emprunts
                </p>
              </div>
              <ArrowRight className="w-5 h-5" style={{ color: 'var(--color-text-light)' }} />
            </div>
          </Link>
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────
  // LIBRARIAN — operational dashboard
  // ──────────────────────────────────────────────
  if (user?.role === 'librarian') {
    return (
      <div className="lg:ml-64 pt-20 lg:pt-8 p-6">
        <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-text)' }}>
          Tableau de bord
        </h1>

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Emprunts actifs', value: stats?.activeLoans || 0, icon: BookCopy, bg: 'rgba(42,157,78,0.1)', iconColor: 'var(--color-primary)' },
            { label: 'Retours aujourd\'hui', value: stats?.todayReturns || 0, icon: BookOpen, bg: 'rgba(232,168,56,0.1)', iconColor: 'var(--color-orange)' },
            { label: 'En retard', value: stats?.lateLoans || 0, icon: AlertTriangle, bg: 'rgba(224,108,90,0.1)', iconColor: 'var(--color-coral)' },
            { label: 'Reservations', value: stats?.pendingReservations || 0, icon: FileText, bg: 'rgba(37,99,235,0.1)', iconColor: '#2563eb' },
          ].map((card) => (
            <div
              key={card.label}
              className="rounded-xl p-5 flex items-center gap-4"
              style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: card.bg }}
              >
                <card.icon className="w-6 h-6" style={{ color: card.iconColor }} />
              </div>
              <div>
                <p className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>{card.value}</p>
                <p className="text-sm" style={{ color: 'var(--color-text-light)' }}>{card.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div className="flex flex-wrap gap-3">
          <Link to="/emprunts" className="no-underline">
            <button
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white transition-colors"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              <BookCopy className="w-4 h-4" /> Gerer les emprunts
            </button>
          </Link>
          <Link to="/livres" className="no-underline">
            <button
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white transition-colors"
              style={{ backgroundColor: 'var(--color-dark)' }}
            >
              <BookOpen className="w-4 h-4" /> Catalogue
            </button>
          </Link>
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────
  // OWNER / ADMIN — full dashboard
  // ──────────────────────────────────────────────
  return (
    <div className="lg:ml-64 pt-20 lg:pt-8 p-6">

      {/* Section 1: Welcome banner */}
      <div
        className="rounded-2xl p-6 mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        style={{
          background: 'linear-gradient(135deg, var(--color-primary), #34b85c)',
          color: '#fff',
        }}
      >
        <div>
          <h1 className="text-2xl font-bold mb-1">Bonjour, {user?.fullName}</h1>
          <p className="text-sm opacity-90">Voici le resume de votre bibliotheque</p>
        </div>
        <div className="flex items-center gap-3">
          {org?.isPublished ? (
            <>
              <span
                className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full"
                style={{ backgroundColor: 'rgba(255,255,255,0.25)', color: '#fff' }}
              >
                <Globe className="w-3.5 h-3.5" /> Site publie
              </span>
              <Link
                to={`/lib/${org.slug}`}
                className="text-sm underline"
                style={{ color: '#fff' }}
              >
                Voir le site
              </Link>
            </>
          ) : (
            <>
              <span
                className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full"
                style={{ backgroundColor: 'rgba(232,168,56,0.3)', color: '#fff' }}
              >
                Site non publie
              </span>
              <Link
                to="/site-config"
                className="text-sm underline"
                style={{ color: '#fff' }}
              >
                Publier
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Section 2: KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Livres', value: stats?.totalBooks || 0, icon: BookOpen, bg: 'rgba(42,157,78,0.1)', iconColor: 'var(--color-primary)' },
          { label: 'Utilisateurs', value: stats?.totalUsers || 0, icon: Users, bg: 'rgba(42,157,78,0.1)', iconColor: 'var(--color-primary)' },
          { label: 'Emprunts actifs', value: stats?.activeLoans || 0, icon: BookCopy, bg: 'rgba(232,168,56,0.1)', iconColor: 'var(--color-orange)' },
          {
            label: 'En retard',
            value: stats?.lateLoans || 0,
            icon: AlertTriangle,
            bg: (stats?.lateLoans || 0) > 0 ? 'rgba(224,108,90,0.15)' : 'rgba(224,108,90,0.05)',
            iconColor: 'var(--color-coral)',
            cardBg: (stats?.lateLoans || 0) > 0 ? 'rgba(224,108,90,0.06)' : undefined,
          },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-xl p-5 flex items-center gap-4"
            style={{
              backgroundColor: card.cardBg || 'var(--color-surface)',
              border: '1px solid var(--color-border)',
            }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: card.bg }}
            >
              <card.icon className="w-6 h-6" style={{ color: card.iconColor }} />
            </div>
            <div>
              <p className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>{card.value}</p>
              <p className="text-sm" style={{ color: 'var(--color-text-light)' }}>{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Section 3: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Bar chart — emprunts mensuels */}
        <div
          className="rounded-xl p-5"
          style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
        >
          <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
            <TrendingUp className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
            Emprunts par mois
          </h3>
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="emprunts" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center py-12" style={{ color: 'var(--color-text-light)' }}>
              Aucune donnee disponible
            </p>
          )}
        </div>

        {/* Pie chart — repartition categories */}
        <div
          className="rounded-xl p-5"
          style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
        >
          <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
            <BookOpen className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
            Repartition par categorie
          </h3>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {categoryData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center py-12" style={{ color: 'var(--color-text-light)' }}>
              Aucune donnee disponible
            </p>
          )}
        </div>
      </div>

      {/* Section 4: Quick actions */}
      <div className="flex flex-wrap gap-3 mb-8">
        <Link to="/livres/nouveau" className="no-underline">
          <button
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white transition-colors"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            <Plus className="w-4 h-4" /> Nouveau livre
          </button>
        </Link>
        <Link to="/membres" className="no-underline">
          <button
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-white transition-colors"
            style={{ backgroundColor: 'var(--color-dark)' }}
          >
            <Users className="w-4 h-4" /> Inviter un membre
          </button>
        </Link>
        <div className="flex gap-2">
          {['loans', 'users', 'books'].map((type) => (
            <a
              key={type}
              href={statsApi.getExportUrl(type)}
              className="no-underline flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
              style={{
                border: '1px solid var(--color-border)',
                color: 'var(--color-text)',
                backgroundColor: 'var(--color-surface)',
              }}
              download
            >
              <Download className="w-3.5 h-3.5" />
              {type === 'loans' ? 'Emprunts' : type === 'users' ? 'Utilisateurs' : 'Livres'}
            </a>
          ))}
          <a
            href={statsApi.getPdfExportUrl('loans')}
            className="no-underline flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
            style={{
              border: '1px solid var(--color-border)',
              color: 'var(--color-text)',
              backgroundColor: 'var(--color-surface)',
            }}
            download
          >
            <FileText className="w-3.5 h-3.5" /> PDF
          </a>
        </div>
      </div>

      {/* Section 5: Recent loans */}
      {stats?.recentLoans?.length > 0 && (
        <div
          className="rounded-xl p-5 mb-6"
          style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold" style={{ color: 'var(--color-text)' }}>Emprunts recents</h3>
            <Link
              to="/emprunts"
              className="text-sm no-underline hover:underline"
              style={{ color: 'var(--color-primary)' }}
            >
              Voir tout
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <th className="text-left py-2 font-medium" style={{ color: 'var(--color-text-light)' }}>Membre</th>
                  <th className="text-left py-2 font-medium" style={{ color: 'var(--color-text-light)' }}>Livre</th>
                  <th className="text-left py-2 font-medium" style={{ color: 'var(--color-text-light)' }}>Statut</th>
                  <th className="text-left py-2 font-medium" style={{ color: 'var(--color-text-light)' }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentLoans.map((loan) => (
                  <tr
                    key={loan._id}
                    style={{ borderBottom: '1px solid var(--color-border)' }}
                  >
                    <td className="py-2.5" style={{ color: 'var(--color-text)' }}>
                      {loan.user?.fullName || '\u2014'}
                    </td>
                    <td className="py-2.5" style={{ color: 'var(--color-text)' }}>
                      {loan.book?.title || '\u2014'}
                    </td>
                    <td className="py-2.5">
                      <span
                        className="inline-block text-xs font-medium px-2.5 py-1 rounded-full"
                        style={
                          loan.status === 'returned'
                            ? { backgroundColor: 'rgba(42,157,78,0.1)', color: 'var(--color-primary)' }
                            : loan.status === 'late'
                              ? { backgroundColor: 'rgba(224,108,90,0.1)', color: 'var(--color-coral)' }
                              : { backgroundColor: 'rgba(232,168,56,0.1)', color: 'var(--color-orange)' }
                        }
                      >
                        {loan.status === 'borrowed' ? 'Emprunte' : loan.status === 'returned' ? 'Retourne' : 'En retard'}
                      </span>
                    </td>
                    <td className="py-2.5" style={{ color: 'var(--color-text-light)' }}>
                      {new Date(loan.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Section 6: Popular books */}
      {stats?.popularBooks?.length > 0 && (
        <div
          className="rounded-xl p-5"
          style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
        >
          <h3 className="font-semibold mb-4" style={{ color: 'var(--color-text)' }}>
            Livres les plus empruntes
          </h3>
          <div className="space-y-3">
            {stats.popularBooks.map((book, i) => (
              <div key={i} className="flex items-center gap-3">
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ backgroundColor: 'rgba(42,157,78,0.1)', color: 'var(--color-primary)' }}
                >
                  {i + 1}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{book.title}</p>
                  <p className="text-xs" style={{ color: 'var(--color-text-light)' }}>{book.author?.join(', ')}</p>
                </div>
                <span className="text-sm font-semibold" style={{ color: 'var(--color-primary)' }}>
                  {book.count} emprunts
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
