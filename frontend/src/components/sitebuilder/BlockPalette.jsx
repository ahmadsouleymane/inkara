import { useState } from 'react';
import { Image, BookOpen, Calendar, Type, Mail, Star, BarChart3, Clock, HelpCircle, GalleryHorizontalEnd, Layout, List, Search, Sparkles, FileText, MessageSquare, Quote, Users, Video, MapPin, Timer, Minus, Megaphone, Share2, BookPlus, Newspaper, CreditCard, ListCollapse, PanelTop, TrendingUp, MoveHorizontal, Code, Maximize2, Building2, GitBranch, Columns } from 'lucide-react';

const BLOCK_CATEGORIES = [
  {
    label: 'Mise en page',
    blocks: [
      { type: 'hero', label: 'Bannière', icon: Layout, description: 'Bannière d\'accueil avec titre et CTA', color: '#6366f1' },
      { type: 'text', label: 'Texte', icon: Type, description: 'Bloc de texte enrichi', color: '#8b5cf6' },
      { type: 'image', label: 'Image', icon: Image, description: 'Image avec légende', color: '#a855f7' },
      { type: 'gallery', label: 'Galerie', icon: GalleryHorizontalEnd, description: 'Grille de photos', color: '#d946ef' },
      { type: 'video', label: 'Vidéo', icon: Video, description: 'Vidéo YouTube ou Vimeo', color: '#ef4444' },
      { type: 'divider', label: 'Séparateur', icon: Minus, description: 'Séparateur visuel', color: '#94a3b8' },
      { type: 'cta-banner', label: 'CTA Banner', icon: Megaphone, description: 'Bandeau d\'appel à l\'action', color: '#f43f5e' },
      { type: 'accordion', label: 'Accordéon', icon: ListCollapse, description: 'Sections repliables', color: '#7c3aed' },
      { type: 'tabs', label: 'Onglets', icon: PanelTop, description: 'Contenu en onglets', color: '#6366f1' },
      { type: 'marquee', label: 'Bandeau défilant', icon: MoveHorizontal, description: 'Texte défilant', color: '#f97316' },
      { type: 'embed', label: 'Intégration', icon: Code, description: 'Contenu externe (iframe)', color: '#475569' },
      { type: 'spacer', label: 'Espacement', icon: Maximize2, description: 'Espace vertical réglable', color: '#cbd5e1' },
      { type: 'before-after', label: 'Avant / Après', icon: Columns, description: 'Comparaison d\'images', color: '#0ea5e9' },
    ],
  },
  {
    label: 'Bibliothèque',
    blocks: [
      { type: 'catalog', label: 'Catalogue', icon: BookOpen, description: 'Catalogue avec recherche', color: '#14b8a6' },
      { type: 'featured-books', label: 'Livres vedettes', icon: Star, description: 'Sélection mise en avant', color: '#f59e0b' },
      { type: 'new-arrivals', label: 'Nouveautés', icon: BookPlus, description: 'Derniers livres ajoutés', color: '#22c55e' },
      { type: 'reading-lists', label: 'Listes de lecture', icon: List, description: 'Collections thématiques', color: '#10b981' },
      { type: 'events', label: 'Événements', icon: Calendar, description: 'Événements à venir', color: '#3b82f6' },
    ],
  },
  {
    label: 'Informations',
    blocks: [
      { type: 'stats', label: 'Statistiques', icon: BarChart3, description: 'Chiffres clés', color: '#f97316' },
      { type: 'hours', label: 'Horaires', icon: Clock, description: 'Horaires d\'ouverture', color: '#64748b' },
      { type: 'faq', label: 'FAQ', icon: HelpCircle, description: 'Questions fréquentes', color: '#06b6d4' },
      { type: 'contact', label: 'Contact', icon: Mail, description: 'Formulaire et coordonnées', color: '#ec4899' },
      { type: 'map', label: 'Carte', icon: MapPin, description: 'Carte OpenStreetMap', color: '#0ea5e9' },
      { type: 'pricing', label: 'Tarifs', icon: CreditCard, description: 'Tableau de tarification', color: '#16a34a' },
      { type: 'timeline', label: 'Chronologie', icon: GitBranch, description: 'Historique chronologique', color: '#8b5cf6' },
    ],
  },
  {
    label: 'Engagement',
    blocks: [
      { type: 'testimonials', label: 'Témoignages', icon: Quote, description: 'Avis des membres', color: '#7c3aed' },
      { type: 'team', label: 'Équipe', icon: Users, description: 'L\'équipe de la bibliothèque', color: '#0891b2' },
      { type: 'countdown', label: 'Compte à rebours', icon: Timer, description: 'Compteur vers un événement', color: '#e11d48' },
      { type: 'social-links', label: 'Réseaux sociaux', icon: Share2, description: 'Liens réseaux sociaux', color: '#2563eb' },
      { type: 'newsletter', label: 'Newsletter', icon: Newspaper, description: 'Formulaire d\'inscription', color: '#059669' },
      { type: 'counter', label: 'Compteurs', icon: TrendingUp, description: 'Chiffres animés', color: '#d946ef' },
      { type: 'logo-cloud', label: 'Partenaires', icon: Building2, description: 'Logos partenaires', color: '#0891b2' },
    ],
  },
];

// Flat list for export
const BLOCK_TYPES = BLOCK_CATEGORIES.flatMap((cat) => cat.blocks);

export { BLOCK_TYPES };

export default function BlockPalette({ onAdd }) {
  const [search, setSearch] = useState('');
  const query = search.toLowerCase().trim();

  const filteredCategories = BLOCK_CATEGORIES.map((cat) => ({
    ...cat,
    blocks: cat.blocks.filter(
      (b) => b.label.toLowerCase().includes(query) || b.description.toLowerCase().includes(query)
    ),
  })).filter((cat) => cat.blocks.length > 0);

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un bloc..."
          className="w-full pl-8 pr-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)]"
        />
      </div>

      {/* Categories */}
      {filteredCategories.map((cat) => (
        <div key={cat.label}>
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2 px-1">
            {cat.label}
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            {cat.blocks.map(({ type, label, icon: Icon, color }) => (
              <button
                key={type}
                onClick={() => onAdd(type)}
                className="group flex flex-col items-center gap-1.5 p-3 rounded-xl border border-gray-100 bg-white hover:border-gray-300 hover:shadow-sm transition-all text-center cursor-pointer"
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110"
                  style={{ backgroundColor: `${color}14` }}
                >
                  <Icon className="w-4.5 h-4.5" style={{ color }} />
                </div>
                <span className="text-[11px] font-medium text-gray-700 leading-tight">{label}</span>
              </button>
            ))}
          </div>
        </div>
      ))}

      {filteredCategories.length === 0 && (
        <div className="text-center py-6">
          <p className="text-xs text-gray-400">Aucun bloc trouvé</p>
        </div>
      )}
    </div>
  );
}
