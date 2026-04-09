import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { LayoutDashboard, BookOpen, BookCopy, Bell, Users } from 'lucide-react';

export default function BottomNav() {
  const { user } = useAuth();
  const location = useLocation();
  const isActive = (p) => location.pathname === p || location.pathname.startsWith(p + '/');

  const links = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Accueil' },
    { path: '/livres', icon: BookOpen, label: 'Livres' },
    { path: '/emprunts', icon: BookCopy, label: 'Emprunts' },
    { path: '/notifications', icon: Bell, label: 'Notifs' },
  ];

  if (user?.role === 'admin') {
    links.push({ path: '/utilisateurs', icon: Users, label: 'Users' });
  }

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-[var(--color-surface)] border-t border-[var(--color-border)] z-50 flex items-center justify-around h-16 dark:bg-gray-900">
      {links.map(({ path, icon: Icon, label }) => (
        <Link key={path} to={path} className={`flex flex-col items-center gap-0.5 text-xs no-underline transition-colors ${isActive(path) ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-light)]'}`}>
          <Icon className="w-5 h-5" />
          {label}
        </Link>
      ))}
    </nav>
  );
}
