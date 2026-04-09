import { useState, useEffect } from 'react';
import { Trophy, Lock } from 'lucide-react';
import { api as client } from '../api/client.js';

export default function Achievements() {
  const [badges, setBadges] = useState([]);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      client.get('/api/gamification/all-badges'),
      client.get('/api/gamification/progress'),
    ]).then(([b, p]) => {
      setBadges(b);
      setProgress(p);
    }).finally(() => setLoading(false));
  }, []);

  const earnedCount = badges.filter(b => b.earned).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
          <Trophy className="w-5 h-5 text-amber-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>Mes Badges</h1>
          <p className="text-sm" style={{ color: 'var(--color-text-light)' }}>{earnedCount} / {badges.length} badges débloqués</p>
        </div>
      </div>

      {/* Barre de progression globale */}
      <div className="rounded-2xl p-5" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>Progression globale</span>
          <span className="text-sm font-bold text-[var(--color-primary)]">{Math.round((earnedCount / badges.length) * 100)}%</span>
        </div>
        <div className="w-full h-3 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-border)' }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${(earnedCount / badges.length) * 100}%`, backgroundColor: 'var(--color-primary)' }}
          />
        </div>
        <div className="mt-3 grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>{progress?.totalLoans || 0}</p>
            <p className="text-xs" style={{ color: 'var(--color-text-light)' }}>Emprunts</p>
          </div>
          <div>
            <p className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>{progress?.reviews || 0}</p>
            <p className="text-xs" style={{ color: 'var(--color-text-light)' }}>Avis</p>
          </div>
          <div>
            <p className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>{progress?.daysMember || 0}</p>
            <p className="text-xs" style={{ color: 'var(--color-text-light)' }}>Jours membre</p>
          </div>
        </div>
      </div>

      {/* Grille des badges */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {badges.map((badge) => {
          const prog = progress?.progress?.[badge.badge];
          const pct = prog ? Math.min(100, Math.round((prog.current / prog.target) * 100)) : 0;

          return (
            <div
              key={badge.badge}
              className={`relative rounded-2xl border p-5 text-center transition-all ${
                badge.earned
                  ? 'border-amber-200 shadow-sm'
                  : 'opacity-60'
              }`}
              style={{ backgroundColor: 'var(--color-surface)', borderColor: badge.earned ? undefined : 'var(--color-border)' }}
            >
              {/* Icon */}
              <div className="text-4xl mb-3">
                {badge.earned ? badge.icon : <Lock className="w-8 h-8 mx-auto" style={{ color: 'var(--color-border)' }} />}
              </div>

              {/* Label */}
              <h3 className="text-sm font-bold mb-1" style={{ color: 'var(--color-text)' }}>{badge.label}</h3>
              <p className="text-[10px] mb-3" style={{ color: 'var(--color-text-light)' }}>{badge.description}</p>

              {/* Progress */}
              {!badge.earned && prog && (
                <div>
                  <div className="w-full h-1.5 rounded-full overflow-hidden mb-1" style={{ backgroundColor: 'var(--color-border)' }}>
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${pct}%`, backgroundColor: badge.color || 'var(--color-primary)' }}
                    />
                  </div>
                  <p className="text-[10px]" style={{ color: 'var(--color-text-light)' }}>{prog.current} / {prog.target}</p>
                </div>
              )}

              {/* Date obtention */}
              {badge.earned && badge.awardedAt && (
                <p className="text-[10px] text-amber-600 font-medium mt-1">
                  Obtenu le {new Date(badge.awardedAt).toLocaleDateString('fr-FR')}
                </p>
              )}

              {/* Badge couleur */}
              {badge.earned && (
                <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs" style={{ backgroundColor: badge.color }}>
                  ✓
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
