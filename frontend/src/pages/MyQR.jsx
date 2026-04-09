import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { QrCode, Download, ArrowLeft, Wifi, WifiOff } from 'lucide-react';
import { downloadCard } from '../utils/memberCard.js';
import { Link } from 'react-router-dom';

export default function MyQR() {
  const { user } = useAuth();
  const [qrData, setQrData] = useState(null);
  const [userName, setUserName] = useState('');
  const [org, setOrg] = useState(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    // Charger depuis le user connecté ou le cache
    if (user?.qrCode) {
      setQrData(user.qrCode);
      setUserName(user.fullName);
      // Sauvegarder en cache pour accès offline
      localStorage.setItem('smartlib_qr', user.qrCode);
      localStorage.setItem('smartlib_qr_name', user.fullName);
      localStorage.setItem('smartlib_qr_user', JSON.stringify({
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        department: user.department,
        role: user.role,
        membershipId: user.membershipId,
        qrCode: user.qrCode,
      }));
      if (user.organizationId && typeof user.organizationId === 'object') {
        setOrg(user.organizationId);
        localStorage.setItem('smartlib_qr_org', JSON.stringify(user.organizationId));
      }
    } else {
      // Fallback au cache
      const cachedQR = localStorage.getItem('smartlib_qr');
      const cachedName = localStorage.getItem('smartlib_qr_name');
      if (cachedQR) setQrData(cachedQR);
      if (cachedName) setUserName(cachedName);
      const cachedOrg = localStorage.getItem('smartlib_qr_org');
      if (cachedOrg) setOrg(JSON.parse(cachedOrg));
    }

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [user]);

  const handleDownloadCard = async () => {
    const cachedUser = JSON.parse(localStorage.getItem('smartlib_qr_user') || '{}');
    const userData = user || cachedUser;
    await downloadCard(userData, org, org?.siteConfig?.primaryColor || '#0114dc');
  };

  if (!qrData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4" style={{ backgroundColor: 'var(--color-bg)' }}>
        <QrCode className="w-16 h-16 mb-4" style={{ color: 'var(--color-border)' }} />
        <p className="text-center" style={{ color: 'var(--color-text-light)' }}>Aucun QR code disponible.</p>
        <Link to="/dashboard" className="mt-4 text-sm text-[var(--color-primary)] underline">Retour</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex flex-col items-center justify-center p-4">
      {/* Statut connexion */}
      <div className="absolute top-4 right-4">
        {isOffline ? (
          <span className="flex items-center gap-1.5 text-xs text-amber-400 bg-amber-400/10 px-3 py-1.5 rounded-full">
            <WifiOff className="w-3.5 h-3.5" /> Mode hors ligne
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-xs text-blue-400 bg-blue-400/10 px-3 py-1.5 rounded-full">
            <Wifi className="w-3.5 h-3.5" /> En ligne
          </span>
        )}
      </div>

      {/* Retour */}
      <Link to="/dashboard" className="absolute top-4 left-4 text-white/60 hover:text-white transition-colors">
        <ArrowLeft className="w-5 h-5" />
      </Link>

      {/* Contenu */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">{userName}</h1>
        <p className="text-white/50 text-sm">Présentez ce QR code à la bibliothèque</p>
      </div>

      {/* QR Code */}
      <div className="bg-white rounded-3xl p-8 shadow-2xl shadow-black/30 mb-8">
        <img src={qrData} alt="Mon QR Code" className="w-64 h-64 sm:w-80 sm:h-80" />
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={handleDownloadCard}
          className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-medium transition-colors border-none cursor-pointer"
        >
          <Download className="w-4 h-4" /> Télécharger ma carte
        </button>
      </div>

      {/* Info */}
      <p className="text-white/30 text-xs mt-8 text-center max-w-xs">
        Ce QR code est disponible même sans connexion internet. Il est lié à votre compte membre.
      </p>
    </div>
  );
}
