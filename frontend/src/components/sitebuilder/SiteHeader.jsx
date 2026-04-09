import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Library, Search, Menu, X } from 'lucide-react';

const SOCIAL_ICONS = {
  Facebook: '📘', Instagram: '📸', Twitter: '🐦', LinkedIn: '💼',
  YouTube: '📺', TikTok: '🎵', WhatsApp: '💬',
};

export default function SiteHeader({ theme, org, pages, currentPage, slug }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const header = theme?.header || {};
  const nav = theme?.navigation || {};
  const primary = theme?.colors?.primary || '#0114dc';

  const bgColor = header.backgroundColor || theme?.colors?.background || '#ffffff';
  const textColor = theme?.colors?.text || '#1a1a1a';
  const layout = header.layout || 'default';
  const logoPos = header.logoPosition || 'left';

  const navLinks = (nav.links?.length > 0)
    ? nav.links.sort((a, b) => a.order - b.order)
    : pages.map((p) => ({ label: p.title, pageSlug: p.slug }));

  const Logo = () => (
    <Link to={`/lib/${slug}`} className="flex items-center gap-2 no-underline">
      {org?.logo ? (
        <img src={org.logo.startsWith('http') ? org.logo : `${import.meta.env.VITE_API_URL || 'http://localhost:7080'}${org.logo}`} alt={org.name} className="h-8 w-8 rounded-lg object-cover" />
      ) : (
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${primary}15` }}>
          <Library className="w-4 h-4" style={{ color: primary }} />
        </div>
      )}
      <span className="font-bold text-sm" style={{ color: textColor, fontFamily: theme?.fonts?.heading }}>{org?.name}</span>
    </Link>
  );

  const NavItems = () => (
    <div className="hidden md:flex items-center gap-1">
      {navLinks.map((link, i) => (
        <Link
          key={i}
          to={`/lib/${slug}/${link.pageSlug}`}
          className="px-3 py-2 text-sm rounded-lg transition-colors no-underline"
          style={{
            color: currentPage?.slug === link.pageSlug ? primary : `${textColor}99`,
            fontWeight: currentPage?.slug === link.pageSlug ? 600 : 400,
          }}
        >
          {link.label}
        </Link>
      ))}
    </div>
  );

  const Actions = () => (
    <div className="hidden md:flex items-center gap-2">
      {nav.showSearch !== false && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg text-xs text-gray-400 border border-gray-100">
          <Search className="w-3.5 h-3.5" /> Rechercher
        </div>
      )}
      {header.ctaButton?.show && header.ctaButton?.text && (
        <a
          href={header.ctaButton.link || '#'}
          className="px-4 py-2 rounded-xl text-white text-xs font-semibold no-underline"
          style={{ backgroundColor: primary }}
        >
          {header.ctaButton.text}
        </a>
      )}
      {(nav.showLogin ?? true) && (
        <span className="text-xs font-medium px-3 py-2 rounded-lg" style={{ color: primary }}>Connexion</span>
      )}
    </div>
  );

  const SocialRow = () => {
    const icons = header.socialIcons?.filter((s) => s.url) || [];
    if (!icons.length) return null;
    return (
      <div className="flex items-center gap-2">
        {icons.map((s, i) => (
          <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" className="text-xs opacity-70 hover:opacity-100 no-underline">
            {SOCIAL_ICONS[s.platform] || '🔗'}
          </a>
        ))}
      </div>
    );
  };

  return (
    <>
      {/* Topbar */}
      {header.showTopbar && header.topbarText && (
        <div className="text-center py-2 px-4 text-xs font-medium" style={{ backgroundColor: header.topbarBgColor || '#1e293b', color: '#ffffff' }}>
          {header.topbarText}
        </div>
      )}

      {/* Main Header */}
      <header
        className={`border-b border-gray-100 ${nav.style === 'fixed' ? 'sticky top-0 z-50' : ''}`}
        style={{ backgroundColor: nav.style === 'transparent' ? 'transparent' : bgColor }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {layout === 'centered' ? (
            /* Centered layout */
            <div className="py-3">
              <div className="flex justify-center mb-2"><Logo /></div>
              <div className="flex items-center justify-center gap-4">
                <NavItems />
                <SocialRow />
              </div>
            </div>
          ) : layout === 'split' ? (
            /* Split layout */
            <div className="flex items-center justify-between h-16">
              <Logo />
              <div className="flex items-center gap-4">
                <NavItems />
                <div className="w-px h-6 bg-gray-200" />
                <SocialRow />
                <Actions />
              </div>
            </div>
          ) : (
            /* Default layout */
            <div className="flex items-center justify-between h-14">
              <div className="flex items-center gap-6">
                <Logo />
                <NavItems />
              </div>
              <div className="flex items-center gap-3">
                <SocialRow />
                <Actions />
                {/* Mobile menu button */}
                <button
                  onClick={() => setMobileOpen(!mobileOpen)}
                  className="md:hidden p-2 rounded-lg bg-transparent border-none cursor-pointer"
                >
                  {mobileOpen ? <X className="w-5 h-5" style={{ color: textColor }} /> : <Menu className="w-5 h-5" style={{ color: textColor }} />}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <div className="md:hidden border-t border-gray-100 py-3 px-4 space-y-1" style={{ backgroundColor: bgColor }}>
            {navLinks.map((link, i) => (
              <Link
                key={i}
                to={`/lib/${slug}/${link.pageSlug}`}
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2.5 text-sm rounded-lg no-underline"
                style={{ color: currentPage?.slug === link.pageSlug ? primary : textColor }}
              >
                {link.label}
              </Link>
            ))}
            {header.ctaButton?.show && header.ctaButton?.text && (
              <a href={header.ctaButton.link || '#'} className="block px-3 py-2.5 text-sm font-semibold rounded-lg no-underline" style={{ color: primary }}>
                {header.ctaButton.text}
              </a>
            )}
          </div>
        )}
      </header>
    </>
  );
}
