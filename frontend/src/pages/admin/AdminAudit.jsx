import { useState, useEffect } from 'react';
import { auditApi } from '../../api/audit.js';
import { ClipboardList } from 'lucide-react';

export default function AdminAudit() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    auditApi.getAll('limit=50')
      .then(data => setLogs(data.logs || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="lg:ml-64 pt-20 lg:pt-8 p-6">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-3">
        <ClipboardList className="w-7 h-7" /> Journal d'audit
      </h1>
      {loading ? (
        <div className="space-y-3">{[1,2,3,4,5].map(i => <div key={i} className="skeleton h-14 rounded-xl" />)}</div>
      ) : logs.length === 0 ? (
        <p className="text-center text-[var(--color-text-light)] py-20">Aucun log</p>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)]">
                <th className="text-left py-3 font-medium text-[var(--color-text-light)]">Utilisateur</th>
                <th className="text-left py-3 font-medium text-[var(--color-text-light)]">Action</th>
                <th className="text-left py-3 font-medium text-[var(--color-text-light)]">Entité</th>
                <th className="text-left py-3 font-medium text-[var(--color-text-light)]">Date</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log._id} className="border-b border-[var(--color-border)] last:border-0">
                  <td className="py-2.5">{log.user?.fullName || '—'}</td>
                  <td className="py-2.5"><span className="badge badge-info">{log.action}</span></td>
                  <td className="py-2.5">{log.entity || '—'}</td>
                  <td className="py-2.5 text-[var(--color-text-light)]">{new Date(log.createdAt).toLocaleString('fr-FR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
