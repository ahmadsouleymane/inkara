import { useState, useEffect } from 'react';
import { api } from '../../api/client.js';
import { Crown, Check, X, BookOpen, Users, Globe, BarChart3, Mail, MessageSquare, Layout, List, Megaphone } from 'lucide-react';
import toast from 'react-hot-toast';

const FEATURE_LABELS = {
  books: { label: 'Livres', icon: BookOpen },
  members: { label: 'Membres', icon: Users },
  publicSite: { label: 'Site public', icon: Globe },
  customDomain: { label: 'Domaine personnalisé', icon: Globe },
  analytics: { label: 'Analytics', icon: BarChart3 },
  email: { label: 'Notifications email', icon: Mail },
  sms: { label: 'Notifications SMS', icon: MessageSquare },
  siteTemplates: { label: 'Templates de site', icon: Layout },
  readingLists: { label: 'Listes de lecture', icon: List },
  broadcast: { label: 'Diffusion groupée', icon: Megaphone },
};

function FeatureValue({ value }) {
  if (typeof value === 'boolean') {
    return value
      ? <Check className="w-4 h-4 text-blue-500" />
      : <X className="w-4 h-4 text-gray-300" />;
  }
  return <span className="text-sm font-medium">{value}</span>;
}

export default function PlanManager() {
  const [currentPlan, setCurrentPlan] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [planData, compareData] = await Promise.all([
          api.get('/api/plan'),
          api.get('/api/plan/compare'),
        ]);
        setCurrentPlan(planData);
        setPlans(compareData);
      } catch {
        toast.error('Erreur chargement');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="p-6 flex justify-center">
        <div className="w-8 h-8 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const planColors = { free: '#6B7280', pro: '#0114dc', enterprise: '#7C3AED' };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Crown className="w-6 h-6 text-[var(--color-primary)]" />
        <div>
          <h1 className="text-2xl font-bold">Gestion du plan</h1>
          <p className="text-sm text-[var(--color-text-light)]">
            Plan actuel : <span className="font-semibold" style={{ color: planColors[currentPlan?.plan] }}>{currentPlan?.planName}</span>
          </p>
        </div>
      </div>

      {/* Usage */}
      {currentPlan && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[var(--color-text-light)]">Livres</span>
              <span className="text-sm font-medium">
                {currentPlan.usage.books} / {currentPlan.limits.books === Infinity ? '∞' : currentPlan.limits.books}
              </span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${Math.min(100, (currentPlan.usage.books / (currentPlan.limits.books === Infinity ? 1 : currentPlan.limits.books)) * 100)}%`,
                  backgroundColor: 'var(--color-primary)',
                }}
              />
            </div>
          </div>
          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[var(--color-text-light)]">Membres</span>
              <span className="text-sm font-medium">
                {currentPlan.usage.members} / {currentPlan.limits.members === Infinity ? '∞' : currentPlan.limits.members}
              </span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${Math.min(100, (currentPlan.usage.members / (currentPlan.limits.members === Infinity ? 1 : currentPlan.limits.members)) * 100)}%`,
                  backgroundColor: 'var(--color-primary)',
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Plan comparison */}
      <div className="card overflow-hidden p-0">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left p-4 text-sm font-medium text-[var(--color-text-light)]">Fonctionnalité</th>
              {plans.map((p) => (
                <th key={p.id} className="text-center p-4">
                  <div className="flex flex-col items-center">
                    <span className="text-lg font-bold" style={{ color: planColors[p.id] }}>
                      {p.name}
                    </span>
                    {p.isCurrent && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-medium mt-1">
                        Actuel
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Object.entries(FEATURE_LABELS).map(([key, { label, icon: Icon }]) => (
              <tr key={key} className="border-b border-gray-100 last:border-0">
                <td className="p-4">
                  <span className="flex items-center gap-2 text-sm">
                    <Icon className="w-4 h-4 text-gray-400" /> {label}
                  </span>
                </td>
                {plans.map((p) => (
                  <td key={p.id} className="p-4 text-center">
                    <div className="flex justify-center">
                      <FeatureValue value={p.limits[key]} />
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-[var(--color-text-light)] text-center mt-4">
        Pour changer de plan, contactez l'administrateur SmartLib.
      </p>
    </div>
  );
}
