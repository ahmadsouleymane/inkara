import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] p-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-[var(--color-primary)] mb-4">404</h1>
        <p className="text-xl font-semibold mb-2">Page introuvable</p>
        <p className="text-[var(--color-text-light)] mb-8">La page que vous cherchez n'existe pas.</p>
        <Link to="/" className="btn-primary inline-flex items-center gap-2 no-underline">
          <Home className="w-4 h-4" />
          Retour à l'accueil
        </Link>
      </div>
    </div>
  );
}
