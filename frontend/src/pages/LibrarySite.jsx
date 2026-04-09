import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { organizationApi } from '../api/organization.js';
import { sitebuilderApi } from '../api/sitebuilder.js';
import { buildBlockStyle, buildBlockClass, BlockOverlay, useScrollAnimation } from '../components/sitebuilder/blockStyleUtils.jsx';
import SiteHeader from '../components/sitebuilder/SiteHeader.jsx';
import SiteFooter from '../components/sitebuilder/SiteFooter.jsx';
import {
  Library, Search, MapPin, Clock, Phone, Mail, Globe, Calendar,
  BookOpen, ChevronLeft, ChevronRight, Users, Star, BarChart3,
  HelpCircle, ChevronDown, ChevronUp, Image as ImageIcon,
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:7080';

// ===== Public block renderers =====

function HeroBlock({ props, theme, org, slug }) {
  const primary = theme?.colors?.primary || '#0114dc';
  return (
    <section className="relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${primary}22 0%, ${primary}08 100%)` }}>
      <div className="max-w-6xl mx-auto px-4 py-16 md:py-24">
        <div className="max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: theme?.colors?.text || '#1A1A1A' }}>
            {props.title || `Bienvenue à ${org?.name || 'la bibliothèque'}`}
          </h1>
          {props.subtitle && <p className="text-lg opacity-70 mb-8">{props.subtitle}</p>}
          <div className="flex flex-wrap gap-4">
            {props.buttonText && (
              <Link
                to={`/lib/${slug}/${props.buttonLink || 'catalogue'}`}
                className="px-6 py-3 rounded-lg text-white font-medium no-underline flex items-center gap-2"
                style={{ backgroundColor: primary }}
              >
                <BookOpen className="w-5 h-5" /> {props.buttonText}
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function CatalogBlock({ props, theme, slug }) {
  const primary = theme?.colors?.primary || '#0114dc';
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const params = new URLSearchParams({ page, limit: 12 });
    if (search) params.set('search', search);
    if (category) params.set('category', category);
    organizationApi.getPublicBooks(slug, params.toString()).then((data) => {
      setBooks(data.books);
      setTotalPages(data.totalPages);
      const cats = [...new Set(data.books.map((b) => b.category).filter(Boolean))];
      setCategories((prev) => [...new Set([...prev, ...cats])]);
    }).catch(() => {});
  }, [slug, page, search, category]);

  return (
    <section className="max-w-6xl mx-auto px-4 py-12">
      <h2 className="text-2xl font-bold mb-6">{props.title || 'Catalogue'}</h2>
      {(props.showSearch || props.showFilters) && (
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          {props.showSearch !== false && (
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="Rechercher un livre..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm" />
            </div>
          )}
          {props.showFilters !== false && categories.length > 0 && (
            <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }} className="px-3 py-2.5 rounded-lg border border-gray-200 text-sm min-w-[180px]">
              <option value="">Toutes les catégories</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          )}
        </div>
      )}
      {books.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p>Aucun livre trouvé.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {books.map((book) => (
            <div key={book._id} className="bg-white rounded-xl overflow-hidden border border-gray-200 hover:shadow-md transition-shadow">
              <div className="aspect-[3/4] bg-gray-100 flex items-center justify-center">
                {book.cover ? (
                  <img src={book.cover.startsWith('http') ? book.cover : `${API_URL}${book.cover}`} alt={book.title} className="w-full h-full object-cover" />
                ) : (
                  <BookOpen className="w-10 h-10 text-gray-300" />
                )}
              </div>
              <div className="p-3">
                <h3 className="font-semibold text-sm line-clamp-2 mb-1">{book.title}</h3>
                <p className="text-xs text-gray-500 mb-2">{Array.isArray(book.author) ? book.author.join(', ') : book.author}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">{book.category}</span>
                  <span className={`text-xs font-medium ${book.availableCopies > 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {book.availableCopies > 0 ? 'Disponible' : 'Emprunté'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-lg border border-gray-200 bg-white disabled:opacity-40">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm text-gray-500 px-3">Page {page} / {totalPages}</span>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 rounded-lg border border-gray-200 bg-white disabled:opacity-40">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </section>
  );
}

function EventsBlock({ props, slug }) {
  const [events, setEvents] = useState([]);
  useEffect(() => {
    organizationApi.getPublicEvents(slug).then(setEvents).catch(() => {});
  }, [slug]);

  return (
    <section className="max-w-6xl mx-auto px-4 py-12">
      <h2 className="text-2xl font-bold mb-6">{props.title || 'Événements'}</h2>
      {events.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Calendar className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p>Aucun événement à venir.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {events.slice(0, props.count || 6).map((ev) => (
            <div key={ev._id} className="bg-white rounded-xl border border-gray-200 overflow-hidden flex">
              {ev.poster && (
                <div className="w-32 shrink-0">
                  <img src={ev.poster.startsWith('http') ? ev.poster : `${API_URL}${ev.poster}`} alt={ev.title} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="p-4 flex-1">
                <h3 className="font-semibold mb-1">{ev.title}</h3>
                <p className="text-xs text-gray-500 mb-2 line-clamp-2">{ev.description}</p>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {new Date(ev.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  {ev.location && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {ev.location}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function TextBlock({ props }) {
  return (
    <section className="max-w-6xl mx-auto px-4 py-12">
      {props.title && <h2 className="text-2xl font-bold mb-4">{props.title}</h2>}
      <div className="prose max-w-none">
        <p className="whitespace-pre-wrap">{props.content || ''}</p>
      </div>
    </section>
  );
}

function ImageBlock({ props }) {
  return (
    <section className="max-w-6xl mx-auto px-4 py-12">
      {props.url ? (
        <img src={props.url} alt={props.caption || ''} className="w-full rounded-xl object-cover max-h-[500px]" />
      ) : null}
      {props.caption && <p className="text-sm text-gray-500 text-center mt-3">{props.caption}</p>}
    </section>
  );
}

function ContactBlock({ props, org }) {
  const address = props.address || org?.address;
  const phone = props.phone || org?.phone;
  const email = props.email || org?.email;

  return (
    <section className="max-w-6xl mx-auto px-4 py-12">
      <h2 className="text-2xl font-bold mb-6">{props.title || 'Contact'}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          {address && <div className="flex items-start gap-3 text-sm"><MapPin className="w-4 h-4 mt-0.5 text-gray-400 shrink-0" /><span>{address}</span></div>}
          {phone && <div className="flex items-center gap-3 text-sm"><Phone className="w-4 h-4 text-gray-400 shrink-0" /><span>{phone}</span></div>}
          {email && <div className="flex items-center gap-3 text-sm"><Mail className="w-4 h-4 text-gray-400 shrink-0" /><a href={`mailto:${email}`} className="text-blue-600 no-underline">{email}</a></div>}
          {org?.website && <div className="flex items-center gap-3 text-sm"><Globe className="w-4 h-4 text-gray-400 shrink-0" /><a href={org.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 no-underline">{org.website}</a></div>}
        </div>
      </div>
    </section>
  );
}

function FeaturedBooksBlock({ props, theme, slug }) {
  const primary = theme?.colors?.primary || '#0114dc';
  const [books, setBooks] = useState([]);
  useEffect(() => {
    organizationApi.getPublicBooks(slug, `limit=${props.count || 6}`).then((data) => setBooks(data.books || [])).catch(() => {});
  }, [slug, props.count]);

  return (
    <section className="max-w-6xl mx-auto px-4 py-12">
      <h2 className="text-2xl font-bold mb-6">{props.title || 'Livres vedettes'}</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {books.map((book) => (
          <div key={book._id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="aspect-[3/4] bg-gray-100 flex items-center justify-center">
              {book.cover ? (
                <img src={book.cover.startsWith('http') ? book.cover : `${API_URL}${book.cover}`} alt={book.title} className="w-full h-full object-cover" />
              ) : (
                <Star className="w-8 h-8" style={{ color: primary }} />
              )}
            </div>
            <div className="p-3">
              <h3 className="font-semibold text-sm line-clamp-2 mb-1">{book.title}</h3>
              <p className="text-xs text-gray-500">{Array.isArray(book.author) ? book.author.join(', ') : book.author}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function StatsBlock({ props, theme, slug }) {
  const primary = theme?.colors?.primary || '#0114dc';
  const [stats, setStats] = useState(null);
  useEffect(() => {
    organizationApi.getPublicBooks(slug, 'limit=1').then((data) => {
      setStats({ books: data.total || 0 });
    }).catch(() => {});
  }, [slug]);

  return (
    <section className="max-w-6xl mx-auto px-4 py-12">
      <h2 className="text-2xl font-bold mb-6">{props.title || 'En chiffres'}</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
          <BookOpen className="w-6 h-6 mx-auto mb-2" style={{ color: primary }} />
          <p className="text-2xl font-bold">{stats?.books ?? '—'}</p>
          <p className="text-sm text-gray-500">Livres</p>
        </div>
      </div>
    </section>
  );
}

function HoursBlock({ props }) {
  const schedule = props.schedule || [
    { day: 'Lundi', hours: '9h – 18h' },
    { day: 'Mardi', hours: '9h – 18h' },
    { day: 'Mercredi', hours: '9h – 20h' },
    { day: 'Jeudi', hours: '9h – 18h' },
    { day: 'Vendredi', hours: '9h – 18h' },
    { day: 'Samedi', hours: '10h – 17h' },
    { day: 'Dimanche', hours: 'Fermé' },
  ];
  return (
    <section className="max-w-6xl mx-auto px-4 py-12">
      <h2 className="text-2xl font-bold mb-6">{props.title || "Horaires d'ouverture"}</h2>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden max-w-md">
        {schedule.map((d, i) => (
          <div key={d.day} className={`flex items-center justify-between px-4 py-3 ${i > 0 ? 'border-t border-gray-100' : ''}`}>
            <span className="font-medium text-sm">{d.day}</span>
            <span className="text-sm text-gray-500 flex items-center gap-2"><Clock className="w-3.5 h-3.5" /> {d.hours}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function FAQBlock({ props, theme }) {
  const [openIndex, setOpenIndex] = useState(null);
  const primary = theme?.colors?.primary || '#0114dc';
  const items = props.items || [];
  if (items.length === 0) return null;

  return (
    <section className="max-w-6xl mx-auto px-4 py-12">
      <h2 className="text-2xl font-bold mb-6">{props.title || 'FAQ'}</h2>
      <div className="max-w-2xl space-y-2">
        {items.map((item, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <button onClick={() => setOpenIndex(openIndex === i ? null : i)} className="w-full flex items-center justify-between px-4 py-3 bg-transparent border-none cursor-pointer text-left">
              <span className="font-medium text-sm flex items-center gap-2">
                <HelpCircle className="w-4 h-4" style={{ color: primary }} />
                {item.question}
              </span>
              {openIndex === i ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
            </button>
            {openIndex === i && <div className="px-4 pb-3 text-sm text-gray-600 pl-10">{item.answer}</div>}
          </div>
        ))}
      </div>
    </section>
  );
}

function GalleryBlock({ props }) {
  const images = props.images || [];
  if (images.length === 0) return null;
  return (
    <section className="max-w-6xl mx-auto px-4 py-12">
      <h2 className="text-2xl font-bold mb-6">{props.title || 'Galerie'}</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {images.map((img, i) => (
          <img key={i} src={img.url} alt={img.caption || ''} className="w-full aspect-square object-cover rounded-xl" />
        ))}
      </div>
    </section>
  );
}

function ReadingListsBlock({ props, theme, slug }) {
  const primary = theme?.colors?.primary || '#0114dc';
  const [lists, setLists] = useState([]);
  useEffect(() => {
    fetch(`${API_URL}/api/organization/public/${slug}/reading-lists`)
      .then((r) => r.json()).then(setLists).catch(() => {});
  }, [slug]);

  if (lists.length === 0) return null;

  return (
    <section className="max-w-6xl mx-auto px-4 py-12">
      <h2 className="text-2xl font-bold mb-6">{props.title || 'Listes de lecture'}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {lists.map((list) => (
          <div key={list._id} className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="font-semibold mb-1">{list.title}</h3>
            {list.description && <p className="text-sm text-gray-500 mb-3 line-clamp-2">{list.description}</p>}
            <div className="flex -space-x-2">
              {list.books?.slice(0, 5).map((book) => (
                <div key={book._id} className="w-10 h-14 rounded-md overflow-hidden border-2 border-white bg-gray-100 flex items-center justify-center">
                  {book.cover ? (
                    <img src={book.cover.startsWith('http') ? book.cover : `${API_URL}${book.cover}`} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <BookOpen className="w-4 h-4 text-gray-300" />
                  )}
                </div>
              ))}
              {(list.books?.length || 0) > 5 && (
                <div className="w-10 h-14 rounded-md border-2 border-white bg-gray-100 flex items-center justify-center text-xs text-gray-500">
                  +{list.books.length - 5}
                </div>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-2">{list.books?.length || 0} livre{(list.books?.length || 0) > 1 ? 's' : ''}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function VideoBlockPublic({ props }) {
  const getEmbedUrl = (url) => {
    if (!url) return null;
    const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
    if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    return url;
  };
  const embedUrl = getEmbedUrl(props.url);
  if (!embedUrl) return null;
  return (
    <section className="max-w-6xl mx-auto px-4 py-12">
      {props.title && <h2 className="text-2xl font-bold mb-4">{props.title}</h2>}
      <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
        <iframe src={embedUrl} className="absolute inset-0 w-full h-full rounded-xl" frameBorder="0" allowFullScreen />
      </div>
      {props.description && <p className="text-sm text-gray-500 text-center mt-3">{props.description}</p>}
    </section>
  );
}

function DividerBlockPublic({ props }) {
  return (
    <div className={`px-4 ${props.spacing === 'large' ? 'py-16' : props.spacing === 'small' ? 'py-4' : 'py-8'}`}>
      {props.style === 'dots' ? (
        <div className="flex justify-center gap-2">{[0,1,2].map(i => <div key={i} className="w-2 h-2 rounded-full bg-gray-300" />)}</div>
      ) : props.style === 'space' ? <div /> : <hr className="border-gray-200 max-w-6xl mx-auto" />}
    </div>
  );
}

function CTABannerBlockPublic({ props, theme }) {
  const primary = theme?.colors?.primary || '#0114dc';
  return (
    <section className="max-w-6xl mx-auto px-4 py-12">
      <div className="rounded-2xl p-10 text-center" style={{ background: `linear-gradient(135deg, ${primary}, ${primary}cc)` }}>
        <h2 className="text-3xl font-bold text-white mb-3">{props.title || 'Rejoignez-nous'}</h2>
        <p className="text-white/80 mb-6">{props.subtitle}</p>
        {props.buttonText && (
          <a href={props.buttonLink || '#'} className="inline-block px-8 py-3 bg-white rounded-xl font-semibold text-sm no-underline" style={{ color: primary }}>{props.buttonText}</a>
        )}
      </div>
    </section>
  );
}

function TestimonialsBlockPublic({ props, theme }) {
  const primary = theme?.colors?.primary || '#0114dc';
  const items = props.items || [];
  if (items.length === 0) return null;
  return (
    <section className="max-w-6xl mx-auto px-4 py-12">
      <h2 className="text-2xl font-bold mb-6 text-center">{props.title || 'Témoignages'}</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {items.map((t, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-600 italic mb-4">"{t.quote}"</p>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: primary }}>{t.name?.charAt(0)}</div>
              <div><p className="text-sm font-semibold">{t.name}</p><p className="text-xs text-gray-400">{t.role}</p></div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function TeamBlockPublic({ props, theme }) {
  const primary = theme?.colors?.primary || '#0114dc';
  const members = props.members || [];
  if (members.length === 0) return null;
  return (
    <section className="max-w-6xl mx-auto px-4 py-12">
      <h2 className="text-2xl font-bold mb-6 text-center">{props.title || 'Notre équipe'}</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        {members.map((m, i) => (
          <div key={i} className="text-center">
            <div className="w-20 h-20 mx-auto rounded-full mb-3 flex items-center justify-center overflow-hidden" style={{ backgroundColor: `${primary}15` }}>
              {m.photo ? <img src={m.photo} alt={m.name} className="w-full h-full object-cover" /> : <span className="text-2xl font-bold" style={{ color: primary }}>{m.name?.charAt(0)}</span>}
            </div>
            <h3 className="font-semibold text-sm">{m.name}</h3>
            <p className="text-xs text-gray-500">{m.role}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function CountdownBlockPublic({ props, theme }) {
  const primary = theme?.colors?.primary || '#0114dc';
  const targetDate = props.date ? new Date(props.date) : null;
  if (!targetDate) return null;
  const diff = Math.max(0, targetDate - new Date());
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return (
    <section className="max-w-6xl mx-auto px-4 py-12 text-center">
      <h2 className="text-2xl font-bold mb-2">{props.title}</h2>
      {props.subtitle && <p className="text-sm text-gray-500 mb-6">{props.subtitle}</p>}
      <div className="flex justify-center gap-4">
        {[{ v: days, l: 'Jours' }, { v: hours, l: 'Heures' }, { v: minutes, l: 'Min' }].map(({ v, l }) => (
          <div key={l} className="bg-white rounded-xl border border-gray-200 p-4 min-w-[80px]">
            <p className="text-2xl font-bold" style={{ color: primary }}>{v}</p>
            <p className="text-xs text-gray-400">{l}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function MapBlockPublic({ props }) {
  return (
    <section className="max-w-6xl mx-auto px-4 py-12">
      {props.title && <h2 className="text-2xl font-bold mb-4">{props.title}</h2>}
      <div className="rounded-xl overflow-hidden border border-gray-200 h-72">
        <iframe src={`https://www.openstreetmap.org/export/embed.html?bbox=${props.bbox || '2.3,48.85,2.36,48.87'}&layer=mapnik&marker=${props.lat || '48.8566'},${props.lng || '2.3522'}`} className="w-full h-full border-0" loading="lazy" />
      </div>
      {props.address && <p className="text-sm text-gray-500 text-center mt-3">{props.address}</p>}
    </section>
  );
}

function SocialLinksBlockPublic({ props, theme }) {
  const primary = theme?.colors?.primary || '#0114dc';
  const links = props.links || [];
  if (links.length === 0) return null;
  const icons = { Facebook: '📘', Instagram: '📸', Twitter: '🐦', LinkedIn: '💼', YouTube: '🎬', TikTok: '🎵', WhatsApp: '💬' };
  return (
    <section className="max-w-6xl mx-auto px-4 py-8 text-center">
      {props.title && <h2 className="text-2xl font-bold mb-4">{props.title}</h2>}
      <div className="flex justify-center gap-3">
        {links.map((l, i) => (
          <a key={i} href={l.url} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-xl flex items-center justify-center text-xl hover:scale-110 transition-transform no-underline" style={{ backgroundColor: `${primary}10` }}>
            {icons[l.platform] || '🔗'}
          </a>
        ))}
      </div>
    </section>
  );
}

function NewArrivalsBlockPublic({ props, theme, slug }) {
  const primary = theme?.colors?.primary || '#0114dc';
  const [books, setBooks] = useState([]);
  useEffect(() => {
    organizationApi.getPublicBooks(slug, `limit=${props.count || 6}&sort=createdAt`).then((data) => setBooks(data.books || [])).catch(() => {});
  }, [slug, props.count]);

  return (
    <section className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">{props.title || 'Nouveautés'}</h2>
        <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ backgroundColor: `${primary}10`, color: primary }}>NEW</span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {books.map((book) => (
          <div key={book._id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="aspect-[3/4] bg-gray-100 flex items-center justify-center">
              {book.cover ? <img src={book.cover.startsWith('http') ? book.cover : `${API_URL}${book.cover}`} alt={book.title} className="w-full h-full object-cover" /> : <BookOpen className="w-8 h-8 text-gray-300" />}
            </div>
            <div className="p-3">
              <h3 className="font-semibold text-sm line-clamp-2 mb-1">{book.title}</h3>
              <p className="text-xs text-gray-500">{Array.isArray(book.author) ? book.author.join(', ') : book.author}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ===== Nouveaux blocs publics (Phase 4) =====

function NewsletterBlockPublic({ props, theme }) {
  const primary = theme?.colors?.primary || '#0114dc';
  return (
    <section className="py-16 px-8 text-center" style={{ background: `linear-gradient(135deg, ${primary}08, ${primary}03)` }}>
      <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: theme?.fonts?.heading, color: theme?.colors?.text }}>{props.title || 'Restez informé'}</h2>
      <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">{props.subtitle || 'Recevez nos actualités par email'}</p>
      <form className="max-w-md mx-auto flex gap-2" onSubmit={(e) => e.preventDefault()}>
        <input type="email" placeholder={props.placeholder || 'votre@email.com'} className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2" style={{ '--tw-ring-color': primary }} />
        <button type="submit" className="px-6 py-3 rounded-xl text-white text-sm font-semibold border-none cursor-pointer hover:opacity-90 transition-opacity" style={{ backgroundColor: primary }}>{props.buttonText || "S'inscrire"}</button>
      </form>
      {props.disclaimer && <p className="text-[10px] text-gray-400 mt-3">{props.disclaimer}</p>}
    </section>
  );
}

function PricingBlockPublic({ props, theme }) {
  const primary = theme?.colors?.primary || '#0114dc';
  const plans = props.plans || [];
  if (!plans.length) return null;
  return (
    <section className="py-16 px-8">
      <h2 className="text-2xl font-bold mb-10 text-center" style={{ fontFamily: theme?.fonts?.heading, color: theme?.colors?.text }}>{props.title || 'Nos tarifs'}</h2>
      <div className="grid gap-6 max-w-4xl mx-auto" style={{ gridTemplateColumns: `repeat(${Math.min(plans.length, 3)}, 1fr)` }}>
        {plans.map((plan, i) => (
          <div key={i} className={`rounded-2xl p-6 text-center transition-shadow hover:shadow-lg ${plan.highlighted ? 'border-2 shadow-lg' : 'border border-gray-200'}`} style={plan.highlighted ? { borderColor: primary } : {}}>
            <h3 className="font-bold text-lg mb-2" style={{ color: theme?.colors?.text }}>{plan.name}</h3>
            <div className="text-3xl font-extrabold mb-1" style={{ color: plan.highlighted ? primary : theme?.colors?.text }}>{plan.price}<span className="text-sm font-normal text-gray-400">{plan.period}</span></div>
            <ul className="text-sm text-gray-500 space-y-2 my-6 text-left">
              {(plan.features || []).map((f, j) => <li key={j} className="flex items-start gap-2"><span style={{ color: primary }}>✓</span> {f}</li>)}
            </ul>
            <button className="w-full py-2.5 rounded-xl text-sm font-semibold border-none cursor-pointer" style={plan.highlighted ? { backgroundColor: primary, color: 'white' } : { backgroundColor: '#f3f4f6', color: '#374151' }}>{plan.buttonText || 'Choisir'}</button>
          </div>
        ))}
      </div>
    </section>
  );
}

function AccordionBlockPublic({ props, theme }) {
  const [openIndexes, setOpenIndexes] = useState([]);
  const primary = theme?.colors?.primary || '#0114dc';
  const items = props.items || [];
  const toggle = (i) => {
    if (props.allowMultiple) setOpenIndexes((p) => p.includes(i) ? p.filter((x) => x !== i) : [...p, i]);
    else setOpenIndexes((p) => p.includes(i) ? [] : [i]);
  };
  return (
    <section className="py-16 px-8">
      {props.title && <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: theme?.fonts?.heading, color: theme?.colors?.text }}>{props.title}</h2>}
      <div className="max-w-2xl mx-auto space-y-2">
        {items.map((item, i) => (
          <div key={i} className="border border-gray-200 rounded-xl overflow-hidden">
            <button onClick={() => toggle(i)} className="w-full flex items-center justify-between px-5 py-4 bg-white border-none cursor-pointer text-left hover:bg-gray-50 transition-colors">
              <span className="font-semibold text-sm" style={{ color: theme?.colors?.text }}>{item.title}</span>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${openIndexes.includes(i) ? 'rotate-180' : ''}`} />
            </button>
            {openIndexes.includes(i) && <div className="px-5 pb-4 text-sm text-gray-600 leading-relaxed">{item.content}</div>}
          </div>
        ))}
      </div>
    </section>
  );
}

function TabsBlockPublic({ props, theme }) {
  const [activeTab, setActiveTab] = useState(0);
  const primary = theme?.colors?.primary || '#0114dc';
  const tabs = props.tabs || [];
  if (!tabs.length) return null;
  return (
    <section className="py-16 px-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex border-b border-gray-200 mb-6 gap-1 overflow-x-auto">
          {tabs.map((tab, i) => (
            <button key={i} onClick={() => setActiveTab(i)} className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors cursor-pointer bg-transparent border-x-0 border-t-0 whitespace-nowrap ${activeTab === i ? '' : 'border-transparent text-gray-400 hover:text-gray-600'}`} style={activeTab === i ? { borderColor: primary, color: primary } : {}}>
              {tab.label}
            </button>
          ))}
        </div>
        <div className="text-sm text-gray-600 leading-relaxed">{tabs[activeTab]?.content}</div>
      </div>
    </section>
  );
}

function CounterBlockPublic({ props, theme }) {
  const primary = theme?.colors?.primary || '#0114dc';
  const counters = props.counters || [];
  if (!counters.length) return null;
  return (
    <section className="py-16 px-8">
      {props.title && <h2 className="text-2xl font-bold mb-10 text-center" style={{ fontFamily: theme?.fonts?.heading, color: theme?.colors?.text }}>{props.title}</h2>}
      <div className="grid gap-8 max-w-3xl mx-auto" style={{ gridTemplateColumns: `repeat(${Math.min(counters.length, 4)}, 1fr)` }}>
        {counters.map((c, i) => (
          <div key={i} className="text-center">
            <p className="text-4xl font-extrabold" style={{ color: primary }}>{c.prefix}{c.value}{c.suffix}</p>
            <p className="text-sm text-gray-500 mt-1">{c.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function MarqueeBlockPublic({ props, theme }) {
  const primary = theme?.colors?.primary || '#0114dc';
  const speed = props.speed === 'slow' ? '30s' : props.speed === 'fast' ? '10s' : '20s';
  const text = props.text || '';
  if (!text) return null;
  return (
    <section className="overflow-hidden py-3" style={{ backgroundColor: props.backgroundColor || `${primary}10`, color: props.textColor || primary }}>
      <div className="whitespace-nowrap inline-block" style={{ animation: `marquee ${speed} linear infinite`, ...(props.pauseOnHover !== false ? {} : {}) }}>
        <span className="text-sm font-medium px-8">{text}</span>
        <span className="text-sm font-medium px-8">{text}</span>
      </div>
      <style>{`@keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }`}</style>
    </section>
  );
}

function EmbedBlockPublic({ props }) {
  if (!props.url) return null;
  return (
    <section className="py-16 px-8">
      {props.title && <h2 className="text-xl font-bold mb-4">{props.title}</h2>}
      <div className="rounded-2xl overflow-hidden" style={{ height: `${props.height || 400}px` }}>
        <iframe src={props.url} className="w-full h-full border-none" title={props.title || 'Embed'} sandbox="allow-scripts allow-same-origin" loading="lazy" />
      </div>
    </section>
  );
}

function SpacerBlockPublic({ props }) {
  return (
    <div className="flex items-center justify-center px-8" style={{ height: `${props.height || 40}px` }}>
      {props.showLine && <div className="w-full border-t" style={{ borderColor: props.lineColor || '#e5e7eb' }} />}
    </div>
  );
}

function LogoCloudBlockPublic({ props, theme }) {
  const logos = props.logos || [];
  if (!logos.length) return null;
  return (
    <section className="py-16 px-8">
      {props.title && <h2 className="text-2xl font-bold mb-10 text-center" style={{ fontFamily: theme?.fonts?.heading, color: theme?.colors?.text }}>{props.title}</h2>}
      <div className="flex flex-wrap items-center justify-center gap-10 max-w-4xl mx-auto">
        {logos.map((logo, i) => (
          <a key={i} href={logo.link || '#'} target="_blank" rel="noopener noreferrer" className="transition-opacity hover:opacity-100" style={{ opacity: props.grayscale ? 0.6 : 1 }}>
            <img src={logo.url} alt={logo.alt} className="h-12 object-contain" style={props.grayscale ? { filter: 'grayscale(100%)' } : {}} />
          </a>
        ))}
      </div>
    </section>
  );
}

function TimelineBlockPublic({ props, theme }) {
  const primary = theme?.colors?.primary || '#0114dc';
  const events = props.events || [];
  if (!events.length) return null;
  return (
    <section className="py-16 px-8">
      {props.title && <h2 className="text-2xl font-bold mb-12 text-center" style={{ fontFamily: theme?.fonts?.heading, color: theme?.colors?.text }}>{props.title}</h2>}
      <div className="max-w-2xl mx-auto relative">
        <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5" style={{ backgroundColor: `${primary}20` }} />
        {events.map((evt, i) => (
          <div key={i} className={`relative flex items-start gap-6 mb-10 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
            <div className="absolute left-4 md:left-1/2 -translate-x-1/2 w-3 h-3 rounded-full border-2 bg-white z-10" style={{ borderColor: primary }} />
            <div className={`ml-10 md:ml-0 md:w-1/2 ${i % 2 === 0 ? 'md:pr-10 md:text-right' : 'md:pl-10'}`}>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${primary}10`, color: primary }}>{evt.year}</span>
              <h3 className="font-bold mt-2" style={{ color: theme?.colors?.text }}>{evt.title}</h3>
              <p className="text-sm text-gray-500 mt-1">{evt.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function BeforeAfterBlockPublic({ props, theme }) {
  const [position, setPosition] = useState(50);
  if (!props.beforeImage || !props.afterImage) return null;
  return (
    <section className="py-16 px-8">
      {props.title && <h2 className="text-2xl font-bold mb-6 text-center" style={{ fontFamily: theme?.fonts?.heading, color: theme?.colors?.text }}>{props.title}</h2>}
      <div className="max-w-2xl mx-auto relative overflow-hidden rounded-2xl select-none" style={{ aspectRatio: '16/9' }}>
        <img src={props.afterImage} alt={props.afterLabel || 'Après'} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 overflow-hidden" style={{ width: `${position}%` }}>
          <img src={props.beforeImage} alt={props.beforeLabel || 'Avant'} className="absolute inset-0 w-full h-full object-cover" style={{ minWidth: `${10000 / position}%` }} />
        </div>
        <input type="range" min="0" max="100" value={position} onChange={(e) => setPosition(Number(e.target.value))} className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-10" />
        <div className="absolute top-0 bottom-0 w-0.5 bg-white z-5 pointer-events-none" style={{ left: `${position}%` }}>
          <div className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-sm font-bold text-gray-500">↔</div>
        </div>
        <div className="absolute bottom-3 left-3 bg-black/60 text-white text-xs px-2.5 py-1 rounded-lg backdrop-blur-sm">{props.beforeLabel || 'Avant'}</div>
        <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2.5 py-1 rounded-lg backdrop-blur-sm">{props.afterLabel || 'Après'}</div>
      </div>
    </section>
  );
}

const BLOCK_RENDERERS = {
  hero: HeroBlock,
  catalog: CatalogBlock,
  events: EventsBlock,
  text: TextBlock,
  image: ImageBlock,
  contact: ContactBlock,
  'featured-books': FeaturedBooksBlock,
  stats: StatsBlock,
  hours: HoursBlock,
  faq: FAQBlock,
  gallery: GalleryBlock,
  'reading-lists': ReadingListsBlock,
  video: VideoBlockPublic,
  divider: DividerBlockPublic,
  'cta-banner': CTABannerBlockPublic,
  testimonials: TestimonialsBlockPublic,
  team: TeamBlockPublic,
  countdown: CountdownBlockPublic,
  map: MapBlockPublic,
  'social-links': SocialLinksBlockPublic,
  'new-arrivals': NewArrivalsBlockPublic,
  newsletter: NewsletterBlockPublic,
  pricing: PricingBlockPublic,
  accordion: AccordionBlockPublic,
  tabs: TabsBlockPublic,
  counter: CounterBlockPublic,
  marquee: MarqueeBlockPublic,
  embed: EmbedBlockPublic,
  spacer: SpacerBlockPublic,
  'logo-cloud': LogoCloudBlockPublic,
  timeline: TimelineBlockPublic,
  'before-after': BeforeAfterBlockPublic,
};

function RenderBlock({ block, theme, org, slug }) {
  const Renderer = BLOCK_RENDERERS[block.type];
  if (!Renderer) return null;

  const blockStyle = buildBlockStyle(block.styles);
  const blockClass = buildBlockClass(block.styles);
  const animRef = useScrollAnimation(block.styles?.animation);

  return (
    <div
      ref={animRef}
      className={blockClass}
      style={{ ...blockStyle, position: block.styles?.backgroundOverlay ? 'relative' : undefined }}
    >
      <BlockOverlay styles={block.styles} />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <Renderer props={block.props || {}} theme={theme} org={org} slug={slug} />
      </div>
    </div>
  );
}

// ===== Main component =====

export default function LibrarySite() {
  const { slug, pageSlug } = useParams();
  const navigate = useNavigate();
  const [org, setOrg] = useState(null);
  const [theme, setTheme] = useState(null);
  const [pages, setPages] = useState([]);
  const [currentPage, setCurrentPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const primaryColor = theme?.colors?.primary || org?.siteConfig?.primaryColor || '#0114dc';

  // Load org, theme, and pages
  useEffect(() => {
    const loadSite = async () => {
      try {
        const [orgData, themeData, pagesData] = await Promise.all([
          organizationApi.getPublicSite(slug),
          sitebuilderApi.getPublicTheme(slug).catch(() => null),
          sitebuilderApi.getPublicPages(slug).catch(() => []),
        ]);
        setOrg(orgData);
        setTheme(themeData);
        setPages(pagesData);
      } catch {
        setError('Site introuvable ou non publié.');
      } finally {
        setLoading(false);
      }
    };
    loadSite();
  }, [slug]);

  // Resolve current page
  useEffect(() => {
    if (!pages.length) return;
    if (pageSlug) {
      const found = pages.find((p) => p.slug === pageSlug);
      setCurrentPage(found || null);
    } else {
      const home = pages.find((p) => p.isHomepage) || pages[0];
      setCurrentPage(home || null);
    }
  }, [pages, pageSlug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: primaryColor, borderTopColor: 'transparent' }} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50">
        <Library className="w-16 h-16 text-gray-300" />
        <h1 className="text-2xl font-bold">{error}</h1>
        <Link to="/" className="text-sm underline" style={{ color: '#0114dc' }}>Retour à SmartLib</Link>
      </div>
    );
  }

  const bgColor = theme?.colors?.background || '#FFFFFF';
  const textColor = theme?.colors?.text || '#1a1a1a';
  const navStyle = theme?.navigation?.style || 'fixed';

  return (
    <div className="min-h-screen" style={{ backgroundColor: bgColor, color: textColor, fontFamily: theme?.fonts?.body || 'Inter' }}>
      {/* Header */}
      <SiteHeader theme={theme} org={org} pages={pages} currentPage={currentPage} slug={slug} />

      {/* Page content — render blocks */}
      <main>
        {currentPage?.blocks
          ?.sort((a, b) => a.order - b.order)
          .map((block) => (
            <RenderBlock key={block.id} block={block} theme={theme} org={org} slug={slug} />
          ))}

        {(!currentPage || !currentPage.blocks?.length) && (
          <div className="max-w-6xl mx-auto px-4 py-16 text-center text-gray-400">
            <Library className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p>Cette page n'a pas encore de contenu.</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <SiteFooter theme={theme} org={org} slug={slug} />
    </div>
  );
}
