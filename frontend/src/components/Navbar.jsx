import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import {
  Library, LayoutDashboard, BookOpen, BookCopy, Users, Bell, Settings,
  LogOut, Menu, X, CalendarDays, User, UserCheck, ClipboardList,
  DollarSign, Shield, Upload, Tag, BookMarked, Globe, BarChart3, ChevronDown,
  Blocks, List, Megaphone, QrCode, Crown, FileChartColumn
} from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/connexion');
  };

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  // Navigation groups by role
  const getNavGroups = () => {
    const role = user?.role;

    if (role === 'superadmin') {
      return [
        {
          links: [
            { path: '/superadmin', label: 'Dashboard', icon: BarChart3 },
            { path: '/superadmin/organizations', label: 'Bibliothèques', icon: Library },
            { path: '/superadmin/users', label: 'Utilisateurs', icon: Users },
            { path: '/superadmin/audit', label: 'Audit', icon: Shield },
          ],
        },
      ];
    }

    if (role === 'owner' || role === 'admin') {
      return [
        {
          label: 'Principal',
          links: [
            { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { path: '/livres', label: 'Livres', icon: BookOpen },
            { path: '/emprunts', label: 'Emprunts', icon: BookCopy },
            { path: '/membres', label: 'Membres', icon: Users },
          ],
        },
        {
          label: 'Gestion',
          links: [
            { path: '/evenements', label: 'Événements', icon: CalendarDays },
            { path: '/categories', label: 'Catégories', icon: Tag },
            { path: '/reservations', label: 'Réservations', icon: ClipboardList },
            { path: '/amendes', label: 'Amendes', icon: DollarSign },
            { path: '/reading-lists', label: 'Listes de lecture', icon: List },
            { path: '/qr-manager', label: 'Codes QR', icon: QrCode },
            { path: '/broadcast', label: 'Diffusion', icon: Megaphone },
          ],
        },
        {
          label: 'Analytique',
          links: [
            { path: '/analytics', label: 'Analytics', icon: BarChart3 },
            { path: '/reports', label: 'Rapports', icon: FileChartColumn },
          ],
        },
        {
          label: 'Site public',
          links: [
            { path: '/site-builder', label: 'Éditeur de site', icon: Blocks },
            { path: '/site-config', label: 'Configuration', icon: Globe },
          ],
        },
        {
          label: 'Configuration',
          links: [
            { path: '/plan', label: 'Mon plan', icon: Crown },
            { path: '/parametres', label: 'Paramètres', icon: Settings },
          ],
        },
      ];
    }

    if (role === 'librarian') {
      return [
        {
          links: [
            { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { path: '/livres', label: 'Livres', icon: BookOpen },
            { path: '/emprunts', label: 'Emprunts', icon: BookCopy },
            { path: '/employee/pret', label: 'Prêt/Retour', icon: BookMarked },
            { path: '/employee/presence', label: 'Présence', icon: UserCheck },
            { path: '/reading-lists', label: 'Listes de lecture', icon: List },
            { path: '/inventory', label: 'Inventaire', icon: QrCode },
          ],
        },
      ];
    }

    // member (default)
    return [
      {
        links: [
          { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { path: '/livres', label: 'Livres', icon: BookOpen },
          { path: '/emprunts', label: 'Mes emprunts', icon: BookCopy },
          { path: '/evenements', label: 'Événements', icon: CalendarDays },
          { path: '/reading-lists', label: 'Listes de lecture', icon: List },
          { path: '/notifications', label: 'Notifications', icon: Bell },
          { path: '/notification-preferences', label: 'Préférences', icon: Settings },
        ],
      },
    ];
  };

  const navGroups = getNavGroups();

  const NavLink = ({ path, label, icon: Icon, onClick }) => (
    <Link
      to={path}
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm no-underline transition-colors relative ${
        isActive(path)
          ? 'text-white bg-[#2A2A2A] border-l-3 border-[var(--color-primary)]'
          : 'text-[#999] hover:text-white hover:bg-[#2A2A2A] border-l-3 border-transparent'
      }`}
    >
      <Icon className="w-5 h-5 flex-shrink-0" />
      {label}
    </Link>
  );

  const NavGroups = ({ onLinkClick }) => (
    <>
      {navGroups.map((group, idx) => (
        <div key={idx}>
          {idx > 0 && <div className="border-t border-[#2A2A2A] my-3" />}
          {group.label && (
            <p className="text-[#666] text-xs font-semibold uppercase tracking-wider px-3 mb-2">
              {group.label}
            </p>
          )}
          <div className="space-y-1">
            {group.links.map((link) => (
              <NavLink key={link.path} {...link} onClick={onLinkClick} />
            ))}
          </div>
        </div>
      ))}
    </>
  );

  const UserProfile = () => (
    <div className="border-t border-[#2A2A2A] p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 bg-[var(--color-primary)] rounded-full flex items-center justify-center text-sm font-semibold text-white flex-shrink-0">
          {user?.fullName?.charAt(0)?.toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-medium truncate">{user?.fullName}</p>
          <p className="text-[#666] text-xs capitalize">{user?.role}</p>
        </div>
      </div>
      <button
        onClick={handleLogout}
        className="flex items-center gap-2 text-sm text-[#666] hover:text-[var(--color-coral)] transition-colors w-full cursor-pointer bg-transparent border-none p-0"
      >
        <LogOut className="w-4 h-4" />
        Déconnexion
      </button>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-screen w-64 bg-[#1A1A1A] z-40">
        {/* Logo */}
        <div className="p-6">
          <Link to="/dashboard" className="flex items-center gap-3 no-underline">
            <div className="w-9 h-9 bg-[var(--color-primary)] rounded-lg flex items-center justify-center">
              <Library className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white">SmartLib</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 pb-4 overflow-y-auto">
          <NavGroups />
        </nav>

        {/* User profile */}
        <UserProfile />
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-[#1A1A1A] flex items-center justify-between px-4 z-50">
        <Link to="/dashboard" className="flex items-center gap-2 no-underline">
          <div className="w-8 h-8 bg-[var(--color-primary)] rounded-lg flex items-center justify-center">
            <Library className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-white">SmartLib</span>
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 cursor-pointer bg-transparent border-none text-white"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Mobile Overlay Menu */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-50"
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="absolute top-0 right-0 w-72 h-full bg-[#1A1A1A] p-6 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <div className="flex justify-end mb-6">
              <button
                onClick={() => setMobileOpen(false)}
                className="p-1 cursor-pointer bg-transparent border-none text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Nav links */}
            <nav className="flex-1 overflow-y-auto">
              <NavGroups onLinkClick={() => setMobileOpen(false)} />
            </nav>

            {/* Logout */}
            <div className="mt-6 pt-6 border-t border-[#2A2A2A]">
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-sm text-[#666] hover:text-[var(--color-coral)] cursor-pointer bg-transparent border-none p-0"
              >
                <LogOut className="w-4 h-4" />
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
