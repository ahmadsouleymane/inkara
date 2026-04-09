import { useState, useEffect } from 'react';
import { api } from '../api/client.js';
import { Bell, Mail, Smartphone, BookOpen, Clock, Calendar, AlertTriangle, Star, Newspaper } from 'lucide-react';
import toast from 'react-hot-toast';

const PREF_ITEMS = [
  { key: 'dueSoonReminder', label: 'Rappels d\'échéance', description: 'Rappel 3 jours avant et le jour même', icon: Clock },
  { key: 'overdueAlert', label: 'Alertes de retard', description: 'Notification quotidienne en cas de retard', icon: AlertTriangle },
  { key: 'reservationAvailable', label: 'Réservation disponible', description: 'Quand un livre réservé devient disponible', icon: BookOpen },
  { key: 'fineCreated', label: 'Amendes', description: 'Notification lors de la création d\'une amende', icon: AlertTriangle },
  { key: 'eventReminder', label: 'Rappels d\'événements', description: 'Rappel la veille d\'un événement', icon: Calendar },
  { key: 'newBooksDigest', label: 'Nouveautés hebdomadaires', description: 'Digest des nouveaux livres ajoutés', icon: Newspaper },
];

export default function NotificationPreferences() {
  const [prefs, setPrefs] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/api/auth/notification-preferences').then(setPrefs).catch(() => toast.error('Erreur chargement'));
  }, []);

  const toggle = (key) => {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const save = async () => {
    setSaving(true);
    try {
      await api.put('/api/auth/notification-preferences', prefs);
      toast.success('Préférences sauvegardées');
    } catch {
      toast.error('Erreur sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  if (!prefs) {
    return (
      <div className="p-6 flex justify-center">
        <div className="w-8 h-8 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Bell className="w-6 h-6 text-[var(--color-primary)]" />
        <div>
          <h1 className="text-2xl font-bold">Préférences de notifications</h1>
          <p className="text-sm text-[var(--color-text-light)]">Choisissez comment et quand être notifié</p>
        </div>
      </div>

      {/* Global toggles */}
      <div className="rounded-xl p-4 mb-6" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
        <h2 className="text-sm font-semibold mb-3">Canaux de notification</h2>
        <div className="space-y-3">
          <label className="flex items-center justify-between cursor-pointer">
            <span className="flex items-center gap-2 text-sm">
              <Smartphone className="w-4 h-4" style={{ color: 'var(--color-text-light)' }} /> Notifications in-app
            </span>
            <input type="checkbox" checked={prefs.inApp !== false} onChange={() => toggle('inApp')} className="accent-[var(--color-primary)] w-4 h-4" />
          </label>
          <label className="flex items-center justify-between cursor-pointer">
            <span className="flex items-center gap-2 text-sm">
              <Mail className="w-4 h-4" style={{ color: 'var(--color-text-light)' }} /> Notifications par email
            </span>
            <input type="checkbox" checked={prefs.email !== false} onChange={() => toggle('email')} className="accent-[var(--color-primary)] w-4 h-4" />
          </label>
        </div>
      </div>

      {/* Per-type toggles */}
      <div className="rounded-xl overflow-hidden mb-6" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
        <h2 className="text-sm font-semibold p-4" style={{ borderBottom: '1px solid var(--color-border)' }}>Types de notifications</h2>
        {PREF_ITEMS.map(({ key, label, description, icon: Icon }, i) => (
          <label
            key={key}
            className="flex items-center justify-between px-4 py-3 cursor-pointer transition-colors"
            style={{ borderTop: i > 0 ? '1px solid var(--color-border)' : 'none' }}
          >
            <div className="flex items-center gap-3">
              <Icon className="w-4 h-4 text-[var(--color-primary)] shrink-0" />
              <div>
                <p className="text-sm font-medium">{label}</p>
                <p className="text-xs text-[var(--color-text-light)]">{description}</p>
              </div>
            </div>
            <input type="checkbox" checked={prefs[key] !== false} onChange={() => toggle(key)} className="accent-[var(--color-primary)] w-4 h-4" />
          </label>
        ))}
      </div>

      <button onClick={save} disabled={saving} className="btn btn-primary w-full">
        {saving ? 'Sauvegarde...' : 'Sauvegarder les préférences'}
      </button>
    </div>
  );
}
