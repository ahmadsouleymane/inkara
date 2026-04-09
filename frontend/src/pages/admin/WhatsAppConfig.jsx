import { useState, useEffect, useRef } from 'react';
import { MessageCircle, Power, PowerOff, Send, RefreshCw, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { api as client } from '../../api/client.js';

export default function WhatsAppConfig() {
  const [status, setStatus] = useState({ connected: false, status: 'disconnected', qr: null });
  const [loading, setLoading] = useState(false);
  const [testPhone, setTestPhone] = useState('');
  const [testMsg, setTestMsg] = useState('');
  const pollRef = useRef(null);

  const fetchStatus = async () => {
    try {
      const { data } = await client.get('/api/whatsapp/status');
      setStatus(data);
    } catch {}
  };

  useEffect(() => {
    fetchStatus();
    return () => clearInterval(pollRef.current);
  }, []);

  const handleConnect = async () => {
    setLoading(true);
    try {
      await client.post('/api/whatsapp/init');
      // Poll pour le QR
      pollRef.current = setInterval(async () => {
        const { data } = await client.get('/api/whatsapp/status');
        setStatus(data);
        if (data.status === 'connected') {
          clearInterval(pollRef.current);
          toast.success('WhatsApp connecté !');
        }
      }, 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await client.post('/api/whatsapp/disconnect');
      setStatus({ connected: false, status: 'disconnected', qr: null });
      clearInterval(pollRef.current);
      toast.success('WhatsApp déconnecté');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
    }
  };

  const handleSendTest = async () => {
    if (!testPhone || !testMsg) return toast.error('Remplissez tous les champs');
    try {
      await client.post('/api/whatsapp/send', { phone: testPhone, message: testMsg });
      toast.success('Message envoyé !');
      setTestMsg('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur envoi');
    }
  };

  const statusBadge = {
    connected: { label: 'Connecté', color: 'text-green-600 bg-green-50', icon: CheckCircle },
    qr_ready: { label: 'QR prêt', color: 'text-amber-600 bg-amber-50', icon: RefreshCw },
    connecting: { label: 'Connexion...', color: 'text-blue-600 bg-blue-50', icon: Loader2 },
    disconnected: { label: 'Déconnecté', color: 'text-gray-500 bg-gray-100', icon: XCircle },
    logged_out: { label: 'Déconnecté', color: 'text-red-500 bg-red-50', icon: XCircle },
  };

  const badge = statusBadge[status.status] || statusBadge.disconnected;
  const BadgeIcon = badge.icon;

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
          <MessageCircle className="w-5 h-5 text-green-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-800">WhatsApp</h1>
          <p className="text-sm text-gray-500">Envoyez des notifications via WhatsApp</p>
        </div>
      </div>

      {/* Status */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-700">Statut de connexion</h2>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${badge.color}`}>
            <BadgeIcon className="w-3.5 h-3.5" /> {badge.label}
          </span>
        </div>

        {/* QR Code pour scanner */}
        {status.qr && (
          <div className="mb-4 p-4 bg-gray-50 rounded-xl text-center">
            <p className="text-sm text-gray-600 mb-3">Scannez ce QR code avec WhatsApp sur votre téléphone :</p>
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(status.qr)}`}
              alt="WhatsApp QR"
              className="mx-auto w-64 h-64 rounded-lg"
            />
            <p className="text-xs text-gray-400 mt-2">WhatsApp {'>'} Appareils connectés {'>'} Connecter un appareil</p>
          </div>
        )}

        <div className="flex gap-3">
          {!status.connected ? (
            <button
              onClick={handleConnect}
              disabled={loading || status.status === 'connecting'}
              className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors border-none cursor-pointer"
            >
              <Power className="w-4 h-4" /> Connecter WhatsApp
            </button>
          ) : (
            <button
              onClick={handleDisconnect}
              className="flex items-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 rounded-xl text-sm font-medium hover:bg-red-100 transition-colors border-none cursor-pointer"
            >
              <PowerOff className="w-4 h-4" /> Déconnecter
            </button>
          )}
          <button
            onClick={fetchStatus}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors border-none cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" /> Rafraîchir
          </button>
        </div>
      </div>

      {/* Test message */}
      {status.connected && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-700 mb-4">Envoyer un message test</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Numéro de téléphone</label>
              <input
                type="tel"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                placeholder="237612345678"
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
              />
              <p className="text-[10px] text-gray-400 mt-1">Format international sans + (ex: 237612345678)</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Message</label>
              <textarea
                value={testMsg}
                onChange={(e) => setTestMsg(e.target.value)}
                placeholder="Message de test..."
                rows={3}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 resize-y"
              />
            </div>
            <button
              onClick={handleSendTest}
              className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 transition-colors border-none cursor-pointer"
            >
              <Send className="w-4 h-4" /> Envoyer
            </button>
          </div>
        </div>
      )}

      {/* Info */}
      <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-700">
        <p className="font-medium mb-1">Comment ça marche ?</p>
        <ul className="list-disc list-inside space-y-1 text-xs text-blue-600">
          <li>Connectez votre numéro WhatsApp en scannant le QR code</li>
          <li>Les rappels de prêt, retards et amendes seront envoyés automatiquement</li>
          <li>Les membres doivent avoir un numéro de téléphone dans leur profil</li>
          <li>Les broadcasts admin sont aussi envoyés par WhatsApp</li>
        </ul>
      </div>
    </div>
  );
}
