import { Link } from 'react-router-dom';
import { Library } from 'lucide-react';

const SOCIAL_ICONS = {
  Facebook: '📘', Instagram: '📸', Twitter: '🐦', LinkedIn: '💼',
  YouTube: '📺', TikTok: '🎵', WhatsApp: '💬',
};

export default function SiteFooter({ theme, org, slug }) {
  const footer = theme?.footer || {};
  const primary = theme?.colors?.primary || '#0114dc';
  const bgColor = footer.backgroundColor || '#1e293b';
  const textColor = footer.textColor || '#e2e8f0';
  const layout = footer.layout || 'simple';
  const columns = footer.columns || [];
  const socialIcons = footer.socialIcons?.filter((s) => s.url) || [];
  const copyright = footer.copyrightText || `© ${new Date().getFullYear()} ${org?.name || 'Bibliothèque'}. Tous droits réservés.`;

  const SocialLinks = () => {
    if (!socialIcons.length) return null;
    return (
      <div className="flex items-center gap-3">
        {socialIcons.map((s, i) => (
          <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" className="text-lg opacity-70 hover:opacity-100 transition-opacity no-underline">
            {SOCIAL_ICONS[s.platform] || '🔗'}
          </a>
        ))}
      </div>
    );
  };

  const Newsletter = () => {
    if (!footer.showNewsletter) return null;
    return (
      <div className="mb-8">
        <h3 className="text-sm font-semibold mb-3" style={{ color: textColor }}>{footer.newsletterTitle || 'Restez informé'}</h3>
        <form className="flex gap-2 max-w-sm" onSubmit={(e) => e.preventDefault()}>
          <input type="email" placeholder="votre@email.com" className="flex-1 px-3 py-2 rounded-lg text-sm bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none" />
          <button type="submit" className="px-4 py-2 rounded-lg text-sm font-semibold border-none cursor-pointer" style={{ backgroundColor: primary, color: 'white' }}>OK</button>
        </form>
      </div>
    );
  };

  const LogoBlock = () => (
    <Link to={`/lib/${slug}`} className="flex items-center gap-2 no-underline mb-3">
      {org?.logo ? (
        <img src={org.logo.startsWith('http') ? org.logo : `${import.meta.env.VITE_API_URL || 'http://localhost:7080'}${org.logo}`} alt={org.name} className="h-8 w-8 rounded-lg object-cover" />
      ) : (
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${primary}30` }}>
          <Library className="w-4 h-4" style={{ color: primary }} />
        </div>
      )}
      <span className="font-bold text-sm" style={{ color: textColor, fontFamily: theme?.fonts?.heading }}>{org?.name}</span>
    </Link>
  );

  return (
    <footer style={{ backgroundColor: bgColor, color: textColor }}>
      <div className="max-w-6xl mx-auto px-6 py-12">
        {layout === 'columns' ? (
          /* Columns layout */
          <div>
            <Newsletter />
            <div className="grid gap-8" style={{ gridTemplateColumns: `repeat(${Math.min(columns.length + 1, 4)}, 1fr)` }}>
              {/* Brand column */}
              <div>
                <LogoBlock />
                {org?.description && <p className="text-xs opacity-60 leading-relaxed mb-4">{org.description}</p>}
                <SocialLinks />
              </div>
              {/* Link columns */}
              {columns.map((col, i) => (
                <div key={i}>
                  <h4 className="text-xs font-bold uppercase tracking-wider mb-3 opacity-50">{col.title}</h4>
                  <ul className="space-y-2 list-none p-0 m-0">
                    {(col.links || []).map((link, j) => (
                      <li key={j}>
                        <a href={link.url || '#'} className="text-sm opacity-70 hover:opacity-100 transition-opacity no-underline" style={{ color: textColor }}>
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="border-t mt-8 pt-6 text-xs opacity-40" style={{ borderColor: `${textColor}20` }}>
              {copyright}
            </div>
          </div>
        ) : layout === 'centered' ? (
          /* Centered layout */
          <div className="text-center">
            <div className="flex justify-center"><LogoBlock /></div>
            <Newsletter />
            <div className="flex justify-center mb-4"><SocialLinks /></div>
            {columns.length > 0 && (
              <div className="flex flex-wrap justify-center gap-6 mb-6">
                {columns.flatMap((col) => col.links || []).map((link, i) => (
                  <a key={i} href={link.url || '#'} className="text-sm opacity-70 hover:opacity-100 no-underline" style={{ color: textColor }}>
                    {link.label}
                  </a>
                ))}
              </div>
            )}
            <p className="text-xs opacity-40">{copyright}</p>
          </div>
        ) : (
          /* Simple layout */
          <div>
            <Newsletter />
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <LogoBlock />
              <SocialLinks />
            </div>
            <div className="border-t mt-6 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2" style={{ borderColor: `${textColor}20` }}>
              <p className="text-xs opacity-40">{copyright}</p>
              <p className="text-[10px] opacity-30">Propulsé par SmartLib</p>
            </div>
          </div>
        )}
      </div>
    </footer>
  );
}
