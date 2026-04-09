import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { authApi } from '../api/auth.js';
import { Lock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return toast.error('Les mots de passe ne correspondent pas');
    }
    if (password.length < 6) {
      return toast.error('Le mot de passe doit contenir au moins 6 caractères');
    }
    setLoading(true);
    try {
      await authApi.resetPassword(token, { password });
      toast.success('Mot de passe réinitialisé avec succès');
      navigate('/connexion');
    } catch (err) {
      toast.error(err.message || 'Lien invalide ou expiré');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] px-4">
      <div className="w-full max-w-md">
        <div className="card">
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: 'rgba(1,20,220,0.15)' }}>
              <Lock className="w-6 h-6 text-[var(--color-primary)]" />
            </div>
            <h1 className="text-xl font-bold">Nouveau mot de passe</h1>
            <p className="text-sm text-[var(--color-text-light)] mt-1">
              Choisissez un nouveau mot de passe
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Nouveau mot de passe</label>
              <input
                type="password"
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Confirmer le mot de passe</label>
              <input
                type="password"
                className="input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? 'Réinitialisation...' : 'Réinitialiser'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/connexion" className="text-sm text-[var(--color-primary)] no-underline">
              Retour à la connexion
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
