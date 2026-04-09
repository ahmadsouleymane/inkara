import { useState, useEffect } from 'react';
import { statsApi } from '../../api/stats.js';
import { BarChart3, TrendingUp, Users, BookOpen, Activity, Clock } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import toast from 'react-hot-toast';

const COLORS = ['#0114dc', '#2196F3', '#FF9800', '#E91E63', '#9C27B0', '#00BCD4', '#FFC107', '#795548'];
const MONTHS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

export default function Analytics() {
  const [tab, setTab] = useState('kpis');
  const [kpis, setKpis] = useState(null);
  const [trends, setTrends] = useState(null);
  const [members, setMembers] = useState(null);
  const [collection, setCollection] = useState(null);
  const [circulation, setCirculation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTab(tab);
  }, [tab]);

  const loadTab = async (t) => {
    setLoading(true);
    try {
      switch (t) {
        case 'kpis': if (!kpis) setKpis(await statsApi.getKPIs()); break;
        case 'trends': if (!trends) setTrends(await statsApi.getTrends()); break;
        case 'members': if (!members) setMembers(await statsApi.getMembers()); break;
        case 'collection': if (!collection) setCollection(await statsApi.getCollection()); break;
        case 'circulation': if (!circulation) setCirculation(await statsApi.getCirculation()); break;
      }
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  const tabs = [
    { key: 'kpis', label: 'KPIs', icon: BarChart3 },
    { key: 'trends', label: 'Tendances', icon: TrendingUp },
    { key: 'members', label: 'Membres', icon: Users },
    { key: 'collection', label: 'Collection', icon: BookOpen },
    { key: 'circulation', label: 'Circulation', icon: Activity },
  ];

  return (
    <div className="lg:ml-64 pt-20 lg:pt-8 p-6">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <BarChart3 className="w-7 h-7" />
        Analytics avancés
      </h1>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 overflow-x-auto pb-2">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              tab === key ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--color-surface)] text-[var(--color-text-light)] hover:bg-[var(--color-bg)]'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-48 rounded-lg" />)}
        </div>
      ) : (
        <>
          {/* KPIs */}
          {tab === 'kpis' && kpis && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <KPICard label="Taux de circulation" value={`${kpis.circulationRate}%`} color="text-blue-600" />
                <KPICard label="Ratio de rotation" value={kpis.turnoverRatio} color="text-blue-600" />
                <KPICard label="Taux de retard" value={`${kpis.lateRate}%`} color="text-red-500" />
                <KPICard label="Durée moy. prêt" value={`${kpis.avgLoanDuration}j`} color="text-purple-600" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <KPICard label="Total livres" value={kpis.totalBooks} />
                <KPICard label="Total exemplaires" value={kpis.totalCopies} />
                <KPICard label="Disponibles" value={kpis.availableCopies} color="text-blue-600" />
                <KPICard label="Emprunts actifs" value={kpis.activeLoans} color="text-blue-600" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <KPICard label="Total emprunts" value={kpis.totalLoans} />
                <KPICard label="En retard" value={kpis.lateLoans} color="text-red-500" />
                <KPICard label="Retournés" value={kpis.returnedLoans} color="text-blue-600" />
              </div>
            </div>
          )}

          {/* Tendances */}
          {tab === 'trends' && trends && (
            <div className="space-y-6">
              <div className="card">
                <h2 className="font-semibold mb-4">Emprunts par mois</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={trends.loans.map(m => ({ name: `${MONTHS[m._id.month - 1]} ${m._id.year}`, total: m.total, evolution: m.evolution }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" fontSize={12} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="total" fill="#0114dc" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="card">
                <h2 className="font-semibold mb-4">Nouveaux membres par mois</h2>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={trends.members.map(m => ({ name: `${MONTHS[m._id.month - 1]} ${m._id.year}`, count: m.count }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" fontSize={12} />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="#2196F3" strokeWidth={2} dot={{ fill: '#2196F3' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Membres */}
          {tab === 'members' && members && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <KPICard label="Total membres" value={members.totalMembers} />
                <KPICard label="Actifs (30j)" value={members.activeMembers} color="text-blue-600" />
                <KPICard label="Inactifs" value={members.inactiveMembers} color="text-orange-500" />
              </div>
              <div className="card">
                <h2 className="font-semibold mb-4">Top 10 emprunteurs</h2>
                <div className="space-y-2">
                  {members.topBorrowers.map((b, i) => (
                    <div key={b._id} className="flex items-center gap-3 p-2 rounded bg-[var(--color-bg)]">
                      <span className="w-6 h-6 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center text-xs font-bold">{i + 1}</span>
                      <span className="flex-1 font-medium text-sm">{b.fullName}</span>
                      <span className="text-sm text-[var(--color-text-light)]">{b.count} emprunts</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Collection */}
          {tab === 'collection' && collection && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card">
                  <h2 className="font-semibold mb-4">Par catégorie</h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie data={collection.categoryDistribution.map(c => ({ name: c._id || 'Autre', value: c.count }))} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                        {collection.categoryDistribution.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="card">
                  <h2 className="font-semibold mb-4">Par état</h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie data={collection.conditionDistribution.map(c => ({ name: c._id || 'Inconnu', value: c.count }))} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                        {collection.conditionDistribution.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              {collection.ageAnalysis.length > 0 && (
                <div className="card">
                  <h2 className="font-semibold mb-4">Analyse par décennie</h2>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={collection.ageAnalysis.map(a => ({ name: a._id, count: a.count }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" fontSize={12} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#9C27B0" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}

          {/* Circulation */}
          {tab === 'circulation' && circulation && (
            <div className="space-y-6">
              <div className="card">
                <h2 className="font-semibold mb-4">Activité quotidienne (30 derniers jours)</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={circulation.dailyActivity.map(d => ({ date: d._id.slice(5), emprunts: d.loans, retours: d.returns }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" fontSize={11} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="emprunts" stroke="#0114dc" strokeWidth={2} />
                    <Line type="monotone" dataKey="retours" stroke="#2196F3" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              {circulation.dailyPresence.length > 0 && (
                <div className="card">
                  <h2 className="font-semibold mb-4">Fréquentation (30 derniers jours)</h2>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={circulation.dailyPresence.map(d => ({ date: d._id.slice(5), visiteurs: d.count }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" fontSize={11} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="visiteurs" fill="#FF9800" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function KPICard({ label, value, color = 'text-[var(--color-text)]' }) {
  return (
    <div className="card text-center py-4">
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-[var(--color-text-light)] mt-1">{label}</p>
    </div>
  );
}
