import { useState, useEffect } from 'react';
import { notificationsApi } from '../api/notifications.js';
import { Bell, CheckCheck, AlertTriangle, Clock, Info } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    notificationsApi.getAll()
      .then(setNotifications)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllRead();
      setNotifications(notifications.map((n) => ({ ...n, read: true })));
      toast.success('Toutes les notifications marquées comme lues');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await notificationsApi.markRead(id);
      setNotifications(notifications.map((n) => n._id === id ? { ...n, read: true } : n));
    } catch (err) {
      toast.error(err.message);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getIcon = (type) => {
    if (type === 'loan_late') return <AlertTriangle className="w-5 h-5 text-red-500" />;
    if (type === 'loan_due') return <Clock className="w-5 h-5 text-amber-500" />;
    return <Info className="w-5 h-5 text-blue-500" />;
  };

  return (
    <div className="lg:ml-64 pt-20 lg:pt-8 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-[var(--color-text-light)]">{unreadCount} non lue(s)</p>
          )}
        </div>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllRead} className="btn-secondary flex items-center gap-2 text-sm">
            <CheckCheck className="w-4 h-4" />
            Tout marquer comme lu
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="skeleton h-16 rounded-xl" />)}
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-20">
          <Bell className="w-16 h-16 text-[var(--color-text-light)] mx-auto mb-4 opacity-30" />
          <p className="text-[var(--color-text-light)]">Aucune notification</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notif) => (
            <div
              key={notif._id}
              onClick={() => !notif.read && handleMarkRead(notif._id)}
              className={`card flex items-start gap-4 cursor-pointer transition-colors ${
                !notif.read ? 'bg-blue-50/50 border-blue-100' : ''
              }`}
            >
              <div className="mt-0.5">{getIcon(notif.type)}</div>
              <div className="flex-1">
                <p className={`text-sm ${!notif.read ? 'font-semibold' : ''}`}>{notif.message}</p>
                <p className="text-xs text-[var(--color-text-light)] mt-1">
                  {new Date(notif.createdAt).toLocaleDateString('fr-FR', {
                    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
                  })}
                </p>
              </div>
              {!notif.read && (
                <div className="w-2 h-2 bg-[var(--color-primary)] rounded-full mt-2 flex-shrink-0" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
