import { useState, useEffect } from 'react';
import { api } from '../../api/client.js';
import { Send, Users, Mail, Megaphone } from 'lucide-react';
import toast from 'react-hot-toast';

const AUDIENCES = [
  { value: 'all', label: 'Tous les membres', icon: Users },
  { value: 'members', label: 'Membres uniquement', icon: Users },
  { value: 'staff', label: 'Personnel (bibliothécaires + admins)', icon: Users },
];

export default function Broadcast() {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [audience, setAudience] = useState('all');
  const [sendEmail, setSendEmail] = useState(true);
  const [sending, setSending] = useState(false);
  const [audienceCount, setAudienceCount] = useState(0);
  const [result, setResult] = useState(null);

  useEffect(() => {
    api.get(`/api/broadcast/audience-count?audience=${audience}`)
      .then((data) => setAudienceCount(data.count))
      .catch(() => setAudienceCount(0));
  }, [audience]);

  const handleSend = async () => {
    if (!subject.trim() || !body.trim()) {
      toast.error('Sujet et message requis');
      return;
    }
    if (!confirm(`Envoyer ce message à ${audienceCount} personne(s) ?`)) return;

    setSending(true);
    try {
      const data = await api.post('/api/broadcast', { subject, body, audience, sendEmail });
      setResult(data);
      toast.success(data.message);
      setSubject('');
      setBody('');
    } catch (err) {
      toast.error(err.message || 'Erreur envoi');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Megaphone className="w-6 h-6 text-[var(--color-primary)]" />
        <div>
          <h1 className="text-2xl font-bold">Diffusion</h1>
          <p className="text-sm text-[var(--color-text-light)]">Envoyer un message à vos membres</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Audience */}
        <div className="card">
          <h2 className="text-sm font-semibold mb-3">Audience</h2>
          <div className="grid grid-cols-3 gap-2">
            {AUDIENCES.map((a) => (
              <button
                key={a.value}
                onClick={() => setAudience(a.value)}
                className={`p-3 rounded-lg border text-left transition-colors ${
                  audience === a.value
                    ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5'
                    : 'border-[var(--color-border)] hover:border-[var(--color-text-light)]'
                }`}
              >
                <a.icon className="w-4 h-4 mb-1 text-[var(--color-primary)]" />
                <p className="text-sm font-medium">{a.label}</p>
              </button>
            ))}
          </div>
          <p className="text-xs text-[var(--color-text-light)] mt-2">
            {audienceCount} destinataire{audienceCount > 1 ? 's' : ''}
          </p>
        </div>

        {/* Message */}
        <div className="card space-y-3">
          <h2 className="text-sm font-semibold">Message</h2>
          <div>
            <label className="block text-xs text-[var(--color-text-light)] mb-1">Sujet</label>
            <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Objet du message" className="input" />
          </div>
          <div>
            <label className="block text-xs text-[var(--color-text-light)] mb-1">Corps du message</label>
            <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Votre message..." className="input resize-y" rows={6} />
          </div>
        </div>

        {/* Options */}
        <div className="card">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={sendEmail} onChange={(e) => setSendEmail(e.target.checked)} className="accent-[var(--color-primary)]" />
            <Mail className="w-4 h-4" style={{ color: 'var(--color-text-light)' }} />
            <span className="text-sm">Envoyer aussi par email</span>
          </label>
        </div>

        {/* Preview */}
        {(subject || body) && (
          <div className="card" style={{ backgroundColor: 'var(--color-bg)' }}>
            <h2 className="text-xs font-semibold text-[var(--color-text-light)] mb-2">Prévisualisation</h2>
            <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
              <h3 className="font-semibold mb-2">{subject || '(Sans sujet)'}</h3>
              <p className="text-sm whitespace-pre-wrap">{body || '(Aucun contenu)'}</p>
            </div>
          </div>
        )}

        {/* Send button */}
        <button onClick={handleSend} disabled={sending || !subject.trim() || !body.trim()} className="btn-primary w-full flex items-center justify-center gap-2">
          <Send className="w-4 h-4" /> {sending ? 'Envoi en cours...' : `Envoyer à ${audienceCount} personne(s)`}
        </button>

        {/* Result */}
        {result && (
          <div className="card bg-green-50 border-green-200">
            <p className="text-sm font-medium text-green-800">{result.message}</p>
            <div className="flex gap-4 mt-2 text-xs text-green-600">
              <span>In-app: {result.stats?.inApp}</span>
              <span>Email: {result.stats?.email}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
