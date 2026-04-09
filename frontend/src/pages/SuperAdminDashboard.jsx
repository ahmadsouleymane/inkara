import { useState, useEffect } from 'react';
import { superadminApi } from '../api/superadmin.js';
import {
  Library, Users, BookCopy, DollarSign, TrendingUp,
  Building2, Pause, ArrowUpRight
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

const PLAN_COLORS = {
  pro: '#0114dc',
  free: '#F28C4E',
  enterprise: '#FF4D5A',
};

const PLAN_BADGE = {
  free: 'badge-info',
  pro: 'badge-success',
  enterprise: 'badge-warning',
};

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    superadminApi.getStats()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleUpdatePlan = async (orgId, plan) => {
    setActionLoading(orgId);
    try {
      await superadminApi.updatePlan(orgId, { plan });
      const updated = await superadminApi.getStats();
      setStats(updated);
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleSuspend = async (orgId) => {
    if (!window.confirm('Suspendre cette organisation ?')) return;
    setActionLoading(orgId);
    try {
      await superadminApi.suspendOrg(orgId);
      const updated = await superadminApi.getStats();
      setStats(updated);
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="lg:ml-64 pt-20 lg:pt-8 p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton h-28 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <div className="skeleton h-72 rounded-xl" />
          <div className="skeleton h-72 rounded-xl" />
        </div>
        <div className="skeleton h-64 rounded-xl mt-6" />
      </div>
    );
  }

  const kpis = [
    {
      label: 'Total bibliothèques',
      value: stats?.totalOrganizations ?? 0,
      icon: Library,
      bg: 'bg-[#DBEAFE]',
      iconColor: 'text-[var(--color-primary)]',
    },
    {
      label: 'Total utilisateurs',
      value: stats?.totalUsers ?? 0,
      icon: Users,
      bg: 'bg-[#FDE8D8]',
      iconColor: 'text-[var(--color-orange)]',
    },
    {
      label: 'Emprunts ce mois',
      value: stats?.monthlyLoans ?? 0,
      icon: BookCopy,
      bg: 'bg-[#DBEAFE]',
      iconColor: 'text-[var(--color-primary)]',
    },
    {
      label: 'MRR',
      value: `${(stats?.mrr ?? 0).toLocaleString('fr-FR')} €`,
      icon: DollarSign,
      bg: 'bg-[#FFE0E2]',
      iconColor: 'text-[var(--color-coral)]',
    },
  ];

  const signupsData = stats?.monthlySignups ?? [];
  const planData = stats?.planDistribution ?? [];

  return (
    <div className="lg:ml-64 pt-20 lg:pt-8 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-dark)]">Super Admin</h1>
          <p className="text-sm text-[var(--color-text-light)] mt-1">
            Vue d'ensemble de la plateforme SmartLib
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-[var(--color-text-light)]">
          <TrendingUp className="w-4 h-4" />
          Mis à jour à l'instant
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="card flex items-center gap-4">
            <div className={`w-12 h-12 ${kpi.bg} rounded-xl flex items-center justify-center`}>
              <kpi.icon className={`w-6 h-6 ${kpi.iconColor}`} />
            </div>
            <div>
              <p className="text-3xl font-bold text-[var(--color-dark)]">{kpi.value}</p>
              <p className="text-sm text-[var(--color-text-light)]">{kpi.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Line Chart — Activity */}
        <div className="card">
          <h2 className="text-lg font-semibold text-[var(--color-dark)] mb-4">
            Activité (30 jours)
          </h2>
          {signupsData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={signupsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: 'var(--color-text-light)' }} />
                <YAxis tick={{ fontSize: 12, fill: 'var(--color-text-light)' }} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  name="Inscriptions"
                  stroke="#0114dc"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#0114dc' }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-[var(--color-text-light)] text-center py-16">
              Aucune donnée disponible
            </p>
          )}
        </div>

        {/* Pie Chart — Plan Distribution */}
        <div className="card">
          <h2 className="text-lg font-semibold text-[var(--color-dark)] mb-4">
            Répartition par plan
          </h2>
          {planData.length > 0 ? (
            <div className="flex items-center">
              <ResponsiveContainer width="60%" height={240}>
                <PieChart>
                  <Pie
                    data={planData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={90}
                    dataKey="value"
                    nameKey="name"
                    paddingAngle={3}
                  >
                    {planData.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={PLAN_COLORS[entry.name] || '#ccc'}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                      borderRadius: '0.5rem',
                      fontSize: '0.875rem',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-3">
                {planData.map((entry) => (
                  <div key={entry.name} className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ background: PLAN_COLORS[entry.name] || '#ccc' }}
                    />
                    <span className="text-sm text-[var(--color-text-light)] capitalize">
                      {entry.name}
                    </span>
                    <span className="text-sm font-semibold text-[var(--color-dark)]">
                      {entry.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-[var(--color-text-light)] text-center py-16">
              Aucune donnée disponible
            </p>
          )}
        </div>
      </div>

      {/* Recent Organizations Table */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[var(--color-dark)] flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Bibliothèques récentes
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)]">
                <th className="text-left py-3 px-4 font-medium text-[var(--color-text-light)]">Nom</th>
                <th className="text-left py-3 px-4 font-medium text-[var(--color-text-light)]">Propriétaire</th>
                <th className="text-left py-3 px-4 font-medium text-[var(--color-text-light)]">Plan</th>
                <th className="text-left py-3 px-4 font-medium text-[var(--color-text-light)]">Statut</th>
                <th className="text-left py-3 px-4 font-medium text-[var(--color-text-light)]">Date</th>
                <th className="text-right py-3 px-4 font-medium text-[var(--color-text-light)]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(stats?.recentOrganizations ?? []).length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-[var(--color-text-light)]">
                    Aucune organisation
                  </td>
                </tr>
              ) : (
                stats.recentOrganizations.map((org) => (
                  <tr
                    key={org._id}
                    className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-cream)]/40 transition-colors"
                  >
                    <td className="py-3 px-4 font-medium text-[var(--color-dark)]">
                      <div className="flex items-center gap-2">
                        {org.name}
                        {org.isPublished && (
                          <ArrowUpRight className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-[var(--color-text-light)]">
                      {org.owner?.fullName ?? '—'}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`badge ${PLAN_BADGE[org.plan] || 'badge-info'}`}>
                        {org.plan}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {org.suspended ? (
                        <span className="badge badge-danger">Suspendu</span>
                      ) : org.isPublished ? (
                        <span className="badge badge-success">Publié</span>
                      ) : (
                        <span className="badge" style={{ background: '#EDEBE7', color: '#7A7468' }}>
                          Non publié
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-[var(--color-text-light)]">
                      {org.createdAt
                        ? new Date(org.createdAt).toLocaleDateString('fr-FR')
                        : '—'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <select
                          className="input py-1 px-2 text-xs w-28"
                          value={org.plan}
                          disabled={actionLoading === org._id}
                          onChange={(e) => handleUpdatePlan(org._id, e.target.value)}
                        >
                          <option value="free">Free</option>
                          <option value="pro">Pro</option>
                          <option value="enterprise">Enterprise</option>
                        </select>
                        <button
                          className="p-1.5 rounded-lg hover:bg-[#FFE0E2] transition-colors text-[var(--color-text-light)] hover:text-[var(--color-coral)]"
                          title="Suspendre"
                          disabled={actionLoading === org._id || org.suspended}
                          onClick={() => handleSuspend(org._id)}
                        >
                          <Pause className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
