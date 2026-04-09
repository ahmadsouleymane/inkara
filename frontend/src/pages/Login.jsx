import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { Library, Eye, EyeOff, BookOpen, Users, Globe } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success('Connexion réussie');
      navigate(user.role === 'superadmin' ? '/superadmin' : '/dashboard');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left half - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-[var(--color-dark)] flex-col items-center justify-center relative p-12">
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Library className="w-10 h-10 text-white" />
            <span className="text-3xl font-bold text-white">SmartLib</span>
          </div>
          <h2 className="text-4xl font-bold text-white mb-4">La bibliothèque du futur</h2>
          <p className="text-gray-400 text-lg max-w-sm mx-auto">
            Gérez votre bibliothèque simplement et efficacement.
          </p>
        </div>

        <div className="absolute bottom-12 left-12 right-12">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[var(--color-primary)]" />
              <span className="text-gray-300 text-sm">Catalogue en ligne</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[var(--color-primary)]" />
              <span className="text-gray-300 text-sm">Gestion des emprunts</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[var(--color-primary)]" />
              <span className="text-gray-300 text-sm">Site personnalisé</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right half - Login form */}
      <div className="w-full lg:w-1/2 bg-[var(--color-bg)] flex items-center justify-center p-8">
        <div className="bg-[var(--color-surface)] rounded-2xl p-8 shadow-sm w-full max-w-md">
          <h1 className="text-2xl font-bold text-[var(--color-text)] mb-1">Connexion</h1>
          <p className="text-sm text-[var(--color-text-light)] mb-6">Bienvenue sur SmartLib</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1.5">Email</label>
              <input
                type="email"
                className="input"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Mot de passe</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input pr-10"
                  placeholder="Votre mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-light)] cursor-pointer bg-transparent border-none"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="text-right mt-1.5">
                <Link to="/mot-de-passe-oublie" className="text-sm text-[var(--color-primary)] no-underline hover:underline">
                  Mot de passe oublié ?
                </Link>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>

            <p className="text-center text-sm text-[var(--color-text-light)]">
              Pas encore de compte ?{' '}
              <Link to="/inscription" className="text-[var(--color-primary)] font-medium no-underline hover:underline">
                Créer une bibliothèque
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
