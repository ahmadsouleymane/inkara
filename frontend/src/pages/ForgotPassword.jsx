import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../api/auth.js';
import { Mail, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.forgotPassword({ email });
      setSent(true);
      toast.success('Email de réinitialisation envoyé');
    } catch (err) {
      toast.error(err.message || 'Erreur lors de l\'envoi');
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
              <Mail className="w-6 h-6 text-[var(--color-primary)]" />
            </div>
            <h1 className="text-xl font-bold">Mot de passe oublié</h1>
            <p className="text-sm text-[var(--color-text-light)] mt-1">
              Entrez votre email pour recevoir un lien de réinitialisation
            </p>
          </div>

          {sent ? (
            <div className="text-center py-4">
              <p className="text-[var(--color-success)] font-medium mb-2">Email envoyé !</p>
              <p className="text-sm text-[var(--color-text-light)]">
                Vérifiez votre boîte de réception et suivez les instructions.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  className="input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  required
                />
              </div>
              <button type="submit" className="btn-primary w-full" disabled={loading}>
                {loading ? 'Envoi...' : 'Envoyer le lien'}
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link to="/connexion" className="text-sm text-[var(--color-primary)] no-underline inline-flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" />
              Retour à la connexion
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
