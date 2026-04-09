import { BookOpen, Calendar, Clock, Mail, Phone, MapPin, Star, BarChart3, HelpCircle, Image as ImageIcon, ChevronDown, ChevronUp, Users, BookCopy, ArrowRight, Search } from 'lucide-react';
import { useState } from 'react';
import { buildBlockStyle, buildBlockClass, BlockOverlay } from './blockStyleUtils.jsx';

// ===== Individual block renderers =====

function HeroBlock({ props, theme }) {
  const primary = theme?.colors?.primary || '#0114dc';
  return (
    <section className="relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${primary}18 0%, ${primary}06 50%, #ffffff 100%)` }}>
      <div className="absolute inset-0" style={{ backgroundImage: `radial-gradient(circle at 80% 20%, ${primary}12 0%, transparent 50%), radial-gradient(circle at 20% 80%, ${primary}08 0%, transparent 50%)` }} />
      <div className="relative py-20 md:py-28 px-8 md:px-12">
        <div className="max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-5 leading-tight" style={{ color: theme?.colors?.text || '#1a1a1a', fontFamily: theme?.fonts?.heading }}>
            {props.title || 'Bienvenue à la bibliothèque'}
          </h1>
          {(props.subtitle || !props.title) && (
            <p className="text-lg md:text-xl mb-8 leading-relaxed" style={{ color: `${theme?.colors?.text || '#1a1a1a'}99` }}>
              {props.subtitle || 'Découvrez des milliers de livres, participez à nos événements et rejoignez notre communauté de lecteurs.'}
            </p>
          )}
          <div className="flex flex-wrap gap-3">
            {(props.buttonText || !props.title) && (
              <button className="px-7 py-3.5 rounded-xl text-white font-semibold border-none text-sm shadow-lg" style={{ backgroundColor: primary, boxShadow: `0 4px 14px ${primary}40` }}>
                {props.buttonText || 'Explorer le catalogue'} <ArrowRight className="w-4 h-4 inline ml-1" />
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function CatalogBlock({ props, theme }) {
  const primary = theme?.colors?.primary || '#0114dc';
  return (
    <section className="py-14 px-8">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold" style={{ fontFamily: theme?.fonts?.heading }}>{props.title || 'Notre catalogue'}</h2>
          <p className="text-sm text-gray-500 mt-1">Parcourez notre collection de livres</p>
        </div>
        {props.showSearch !== false && (
          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl border border-gray-200 text-sm text-gray-400">
            <Search className="w-4 h-4" /> Rechercher...
          </div>
        )}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { title: 'Le Petit Prince', author: 'Saint-Exupéry' },
          { title: 'Les Misérables', author: 'Victor Hugo' },
          { title: 'L\'Étranger', author: 'Albert Camus' },
          { title: 'Germinal', author: 'Émile Zola' },
        ].map((book, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
            <div className="aspect-[3/4] flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${['#6366f1', '#ec4899', '#f59e0b', '#10b981'][i]}15, ${['#6366f1', '#ec4899', '#f59e0b', '#10b981'][i]}05)` }}>
              <BookOpen className="w-10 h-10" style={{ color: `${['#6366f1', '#ec4899', '#f59e0b', '#10b981'][i]}50` }} />
            </div>
            <div className="p-3.5">
              <p className="text-sm font-semibold text-gray-800 truncate">{book.title}</p>
              <p className="text-xs text-gray-400 mt-0.5">{book.author}</p>
            </div>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-gray-300 text-center mt-5 uppercase tracking-wider font-medium">Aperçu — Données réelles sur le site public</p>
    </section>
  );
}

function EventsBlock({ props, theme }) {
  const primary = theme?.colors?.primary || '#0114dc';
  const events = [
    { title: 'Club de lecture mensuel', date: '15 Jan', time: '14h00', tag: 'Lecture' },
    { title: 'Atelier d\'écriture créative', date: '22 Jan', time: '10h00', tag: 'Atelier' },
  ];
  return (
    <section className="py-14 px-8">
      <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: theme?.fonts?.heading }}>{props.title || 'Événements à venir'}</h2>
      <p className="text-sm text-gray-500 mb-8">Ne manquez aucun de nos événements</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {events.map((evt, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 flex gap-5 hover:shadow-md transition-shadow">
            <div className="w-14 h-14 rounded-xl flex flex-col items-center justify-center shrink-0" style={{ backgroundColor: `${primary}10` }}>
              <span className="text-lg font-bold" style={{ color: primary }}>{evt.date.split(' ')[0]}</span>
              <span className="text-[10px] font-medium uppercase" style={{ color: `${primary}99` }}>{evt.date.split(' ')[1]}</span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm text-gray-800 mb-1">{evt.title}</h3>
              <div className="flex items-center gap-3 text-xs text-gray-400">
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {evt.time}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ backgroundColor: `${primary}10`, color: primary }}>{evt.tag}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-gray-300 text-center mt-5 uppercase tracking-wider font-medium">Aperçu — Événements réels sur le site public</p>
    </section>
  );
}

function TextBlock({ props, theme }) {
  return (
    <section className="py-14 px-8">
      {props.title && <h2 className="text-2xl font-bold mb-5" style={{ fontFamily: theme?.fonts?.heading }}>{props.title}</h2>}
      <div className="prose prose-gray max-w-none text-gray-600 leading-relaxed">
        <p className="whitespace-pre-wrap">{props.content || 'Commencez à écrire votre contenu ici. Ce bloc accepte du texte libre que vous pouvez personnaliser dans le panneau de droite.'}</p>
      </div>
    </section>
  );
}

function ImageBlock({ props }) {
  return (
    <section className="py-10 px-8">
      {props.url ? (
        <img src={props.url} alt={props.caption || ''} className="w-full rounded-2xl object-cover max-h-[500px] shadow-sm" />
      ) : (
        <div className="w-full h-72 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl flex flex-col items-center justify-center gap-3 border-2 border-dashed border-gray-200">
          <ImageIcon className="w-12 h-12 text-gray-300" />
          <p className="text-xs text-gray-400">Ajoutez une URL d'image dans les propriétés</p>
        </div>
      )}
      {props.caption && <p className="text-sm text-gray-500 text-center mt-4 italic">{props.caption}</p>}
    </section>
  );
}

function ContactBlock({ props, theme }) {
  const primary = theme?.colors?.primary || '#0114dc';
  return (
    <section className="py-14 px-8">
      <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: theme?.fonts?.heading }}>{props.title || 'Nous contacter'}</h2>
      <p className="text-sm text-gray-500 mb-8">N'hésitez pas à nous écrire</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-5">
          {[
            { icon: MapPin, value: props.address || '12 rue des Bibliothèques, 75001 Paris', label: 'Adresse' },
            { icon: Phone, value: props.phone || '01 23 45 67 89', label: 'Téléphone' },
            { icon: Mail, value: props.email || 'contact@bibliotheque.fr', label: 'Email' },
          ].map(({ icon: Icon, value, label }) => (
            <div key={label} className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${primary}10` }}>
                <Icon className="w-4.5 h-4.5" style={{ color: primary }} />
              </div>
              <div>
                <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wide mb-0.5">{label}</p>
                <p className="text-sm text-gray-700">{value}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-gray-50 rounded-2xl p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Nom</label>
            <div className="h-10 bg-white rounded-xl border border-gray-200" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Email</label>
            <div className="h-10 bg-white rounded-xl border border-gray-200" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Message</label>
            <div className="h-24 bg-white rounded-xl border border-gray-200" />
          </div>
          <div className="h-10 rounded-xl" style={{ backgroundColor: primary, opacity: 0.7 }} />
        </div>
      </div>
    </section>
  );
}

function FeaturedBooksBlock({ props, theme }) {
  const primary = theme?.colors?.primary || '#0114dc';
  const count = Math.min(props.count || 6, 6);
  const books = [
    { title: 'Voyage au centre', color: '#6366f1' },
    { title: '1984', color: '#ec4899' },
    { title: 'Don Quichotte', color: '#f59e0b' },
    { title: 'Madame Bovary', color: '#10b981' },
    { title: 'Le Comte de Monte-Cristo', color: '#3b82f6' },
    { title: 'Notre-Dame de Paris', color: '#8b5cf6' },
  ];
  return (
    <section className="py-14 px-8">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold" style={{ fontFamily: theme?.fonts?.heading }}>{props.title || 'Nos recommandations'}</h2>
          <p className="text-sm text-gray-500 mt-1">Sélection de la bibliothèque</p>
        </div>
        <button className="text-sm font-medium flex items-center gap-1 border-none bg-transparent cursor-pointer" style={{ color: primary }}>
          Tout voir <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {books.slice(0, count).map((book, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
            <div className="aspect-[3/4] flex items-center justify-center" style={{ background: `linear-gradient(160deg, ${book.color}18, ${book.color}06)` }}>
              <Star className="w-8 h-8" style={{ color: `${book.color}40` }} />
            </div>
            <div className="p-3.5">
              <p className="text-sm font-semibold text-gray-800 truncate">{book.title}</p>
              <div className="flex items-center gap-1 mt-1">
                {[1,2,3,4,5].map((s) => (
                  <Star key={s} className="w-3 h-3" style={{ color: s <= 4 ? '#f59e0b' : '#e5e7eb', fill: s <= 4 ? '#f59e0b' : 'none' }} />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-gray-300 text-center mt-5 uppercase tracking-wider font-medium">Aperçu — Livres réels sur le site public</p>
    </section>
  );
}

function StatsBlock({ props, theme }) {
  const primary = theme?.colors?.primary || '#0114dc';
  const stats = [
    { label: 'Livres', value: '2,450', icon: BookOpen, color: '#6366f1' },
    { label: 'Membres', value: '380', icon: Users, color: '#ec4899' },
    { label: 'Emprunts/mois', value: '156', icon: BookCopy, color: '#f59e0b' },
    { label: 'Événements', value: '12', icon: Calendar, color: '#10b981' },
  ];
  return (
    <section className="py-14 px-8" style={{ background: `linear-gradient(135deg, ${primary}08, transparent)` }}>
      <h2 className="text-2xl font-bold mb-2 text-center" style={{ fontFamily: theme?.fonts?.heading }}>{props.title || 'La bibliothèque en chiffres'}</h2>
      <p className="text-sm text-gray-500 text-center mb-10">Des chiffres qui parlent d'eux-mêmes</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-6 text-center hover:shadow-md transition-shadow">
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${s.color}10` }}>
              <s.icon className="w-6 h-6" style={{ color: s.color }} />
            </div>
            <p className="text-3xl font-extrabold text-gray-800">{s.value}</p>
            <p className="text-sm text-gray-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-gray-300 text-center mt-5 uppercase tracking-wider font-medium">Aperçu — Statistiques réelles sur le site public</p>
    </section>
  );
}

function HoursBlock({ props, theme }) {
  const primary = theme?.colors?.primary || '#0114dc';
  const days = props.schedule || [
    { day: 'Lundi', hours: '9h – 18h' },
    { day: 'Mardi', hours: '9h – 18h' },
    { day: 'Mercredi', hours: '9h – 20h' },
    { day: 'Jeudi', hours: '9h – 18h' },
    { day: 'Vendredi', hours: '9h – 18h' },
    { day: 'Samedi', hours: '10h – 17h' },
    { day: 'Dimanche', hours: 'Fermé' },
  ];
  const today = new Date().getDay(); // 0=Sun
  const todayIndex = today === 0 ? 6 : today - 1;

  return (
    <section className="py-14 px-8">
      <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: theme?.fonts?.heading }}>{props.title || "Horaires d'ouverture"}</h2>
      <p className="text-sm text-gray-500 mb-8">Venez nous rendre visite</p>
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden max-w-lg shadow-sm">
        {days.map((d, i) => {
          const isToday = i === todayIndex;
          const isClosed = d.hours.toLowerCase().includes('fermé');
          return (
            <div
              key={d.day}
              className={`flex items-center justify-between px-5 py-3.5 ${i > 0 ? 'border-t border-gray-50' : ''}`}
              style={isToday ? { backgroundColor: `${primary}06` } : {}}
            >
              <span className={`text-sm ${isToday ? 'font-bold' : 'font-medium'} ${isClosed ? 'text-gray-400' : 'text-gray-700'}`}>
                {d.day}
                {isToday && <span className="ml-2 text-[10px] font-semibold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: `${primary}15`, color: primary }}>Aujourd'hui</span>}
              </span>
              <span className={`text-sm flex items-center gap-2 ${isClosed ? 'text-gray-400' : 'text-gray-600'}`}>
                <Clock className="w-3.5 h-3.5 text-gray-300" /> {d.hours}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function FAQBlock({ props, theme }) {
  const [openIndex, setOpenIndex] = useState(null);
  const primary = theme?.colors?.primary || '#0114dc';
  const items = props.items?.length > 0 ? props.items : [
    { question: 'Comment emprunter un livre ?', answer: 'Présentez votre carte de membre à l\'accueil pour emprunter jusqu\'à 5 livres pour 21 jours.' },
    { question: 'Quelle est la durée d\'emprunt ?', answer: 'La durée standard est de 21 jours, renouvelable une fois si le livre n\'est pas réservé.' },
    { question: 'Comment devenir membre ?', answer: 'Remplissez le formulaire d\'inscription en ligne ou présentez-vous à l\'accueil avec une pièce d\'identité.' },
  ];
  return (
    <section className="py-14 px-8">
      <h2 className="text-2xl font-bold mb-2 text-center" style={{ fontFamily: theme?.fonts?.heading }}>{props.title || 'Questions fréquentes'}</h2>
      <p className="text-sm text-gray-500 text-center mb-8">Trouvez rapidement vos réponses</p>
      <div className="max-w-2xl mx-auto space-y-3">
        {items.map((item, i) => (
          <div key={i} className={`bg-white rounded-2xl border overflow-hidden transition-all ${openIndex === i ? 'border-gray-200 shadow-sm' : 'border-gray-100'}`}>
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="w-full flex items-center justify-between px-5 py-4 bg-transparent border-none cursor-pointer text-left"
            >
              <span className="font-semibold text-sm text-gray-700 flex items-center gap-3">
                <span className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0" style={{ backgroundColor: `${primary}10`, color: primary }}>
                  {i + 1}
                </span>
                {item.question}
              </span>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform shrink-0 ml-3 ${openIndex === i ? 'rotate-180' : ''}`} />
            </button>
            {openIndex === i && (
              <div className="px-5 pb-4 text-sm text-gray-500 leading-relaxed pl-16">{item.answer}</div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

function GalleryBlock({ props, theme }) {
  const images = props.images || [];
  return (
    <section className="py-14 px-8">
      <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: theme?.fonts?.heading }}>{props.title || 'Galerie'}</h2>
      <p className="text-sm text-gray-500 mb-8">Découvrez nos espaces</p>
      {images.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {images.map((img, i) => (
            <div key={i} className="relative group overflow-hidden rounded-2xl">
              <img src={img.url} alt={img.caption || ''} className="w-full aspect-square object-cover" />
              {img.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3 translate-y-full group-hover:translate-y-0 transition-transform">
                  <p className="text-white text-xs">{img.caption}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="aspect-square rounded-2xl flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'][i-1]}08, ${['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'][i-1]}03)` }}>
              <ImageIcon className="w-8 h-8 text-gray-200" />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function ReadingListsBlock({ props, theme }) {
  const primary = theme?.colors?.primary || '#0114dc';
  return (
    <section className="py-14 px-8">
      <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: theme?.fonts?.heading }}>{props.title || 'Listes de lecture'}</h2>
      <p className="text-sm text-gray-500 mb-8">Nos sélections thématiques</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { title: 'Romans classiques', count: 12 },
          { title: 'Science-fiction', count: 8 },
        ].map((list, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
            <h3 className="font-semibold text-sm text-gray-800 mb-1">{list.title}</h3>
            <p className="text-xs text-gray-400 mb-4">{list.count} livres</p>
            <div className="flex -space-x-2">
              {[0, 1, 2, 3].map((j) => (
                <div key={j} className="w-9 h-12 rounded-lg border-2 border-white shadow-sm" style={{ background: `linear-gradient(135deg, ${['#6366f1', '#ec4899', '#f59e0b', '#10b981'][j]}20, ${['#6366f1', '#ec4899', '#f59e0b', '#10b981'][j]}08)` }} />
              ))}
              <div className="w-9 h-12 rounded-lg border-2 border-white bg-gray-50 flex items-center justify-center text-[10px] font-bold text-gray-400 shadow-sm">
                +{list.count - 4}
              </div>
            </div>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-gray-300 text-center mt-5 uppercase tracking-wider font-medium">Aperçu — Listes réelles sur le site public</p>
    </section>
  );
}

// ===== Nouveaux blocs =====

function VideoBlock({ props, theme }) {
  const getEmbedUrl = (url) => {
    if (!url) return null;
    const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
    if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    return url;
  };
  const embedUrl = getEmbedUrl(props.url);
  return (
    <section className="py-14 px-8">
      {props.title && <h2 className="text-2xl font-bold mb-5" style={{ fontFamily: theme?.fonts?.heading }}>{props.title}</h2>}
      {embedUrl ? (
        <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
          <iframe src={embedUrl} className="absolute inset-0 w-full h-full rounded-2xl" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
        </div>
      ) : (
        <div className="w-full h-72 bg-gray-100 rounded-2xl flex flex-col items-center justify-center border-2 border-dashed border-gray-200">
          <span className="text-4xl mb-2">▶️</span>
          <p className="text-xs text-gray-400">Ajoutez une URL YouTube ou Vimeo</p>
        </div>
      )}
      {props.description && <p className="text-sm text-gray-500 text-center mt-3">{props.description}</p>}
    </section>
  );
}

function DividerBlock({ props, theme }) {
  const primary = theme?.colors?.primary || '#0114dc';
  const style = props.style || 'line';
  return (
    <section className={`px-8 ${props.spacing === 'large' ? 'py-16' : props.spacing === 'small' ? 'py-4' : 'py-8'}`}>
      {style === 'line' && <hr className="border-0 border-t border-gray-200" />}
      {style === 'dots' && (
        <div className="flex items-center justify-center gap-2">
          {[0,1,2].map(i => <div key={i} className="w-2 h-2 rounded-full" style={{ backgroundColor: `${primary}40` }} />)}
        </div>
      )}
      {style === 'space' && <div />}
    </section>
  );
}

function CTABannerBlock({ props, theme }) {
  const primary = theme?.colors?.primary || '#0114dc';
  return (
    <section className="py-14 px-8">
      <div className="rounded-2xl p-10 text-center" style={{ background: `linear-gradient(135deg, ${primary}, ${primary}cc)` }}>
        <h2 className="text-3xl font-extrabold text-white mb-3" style={{ fontFamily: theme?.fonts?.heading }}>
          {props.title || 'Rejoignez-nous'}
        </h2>
        <p className="text-white/80 mb-6 max-w-lg mx-auto">{props.subtitle || 'Inscrivez-vous gratuitement et accédez à notre collection.'}</p>
        {props.buttonText && (
          <button className="px-8 py-3.5 bg-white rounded-xl font-semibold text-sm border-none cursor-pointer shadow-lg" style={{ color: primary }}>
            {props.buttonText}
          </button>
        )}
      </div>
    </section>
  );
}

function TestimonialsBlock({ props, theme }) {
  const primary = theme?.colors?.primary || '#0114dc';
  const testimonials = props.items?.length > 0 ? props.items : [
    { name: 'Marie D.', quote: 'Une bibliothèque extraordinaire avec un service impeccable.', role: 'Membre depuis 2023' },
    { name: 'Pierre L.', quote: 'Les événements sont toujours passionnants et bien organisés.', role: 'Lecteur assidu' },
    { name: 'Sophie M.', quote: 'Un large choix de livres et un personnel très accueillant.', role: 'Étudiante' },
  ];
  return (
    <section className="py-14 px-8" style={{ background: `linear-gradient(135deg, ${primary}06, transparent)` }}>
      <h2 className="text-2xl font-bold mb-2 text-center" style={{ fontFamily: theme?.fonts?.heading }}>{props.title || 'Ce que disent nos membres'}</h2>
      <p className="text-sm text-gray-500 text-center mb-10">Témoignages de nos lecteurs</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
        {testimonials.map((t, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="text-2xl mb-3" style={{ color: primary }}>❝</div>
            <p className="text-sm text-gray-600 leading-relaxed mb-4 italic">{t.quote}</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: `${primary}20`, color: primary }}>
                {t.name?.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">{t.name}</p>
                <p className="text-[10px] text-gray-400">{t.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function TeamBlock({ props, theme }) {
  const primary = theme?.colors?.primary || '#0114dc';
  const members = props.members?.length > 0 ? props.members : [
    { name: 'Jean Dupont', role: 'Directeur', photo: '' },
    { name: 'Marie Martin', role: 'Bibliothécaire', photo: '' },
    { name: 'Paul Bernard', role: 'Animateur', photo: '' },
  ];
  return (
    <section className="py-14 px-8">
      <h2 className="text-2xl font-bold mb-2 text-center" style={{ fontFamily: theme?.fonts?.heading }}>{props.title || 'Notre équipe'}</h2>
      <p className="text-sm text-gray-500 text-center mb-10">Les personnes derrière votre bibliothèque</p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
        {members.map((m, i) => (
          <div key={i} className="text-center">
            <div className="w-24 h-24 mx-auto rounded-full mb-3 flex items-center justify-center overflow-hidden" style={{ background: `linear-gradient(135deg, ${primary}20, ${primary}08)` }}>
              {m.photo ? (
                <img src={m.photo} alt={m.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-bold" style={{ color: primary }}>{m.name?.charAt(0)}</span>
              )}
            </div>
            <h3 className="font-semibold text-sm text-gray-800">{m.name}</h3>
            <p className="text-xs text-gray-400">{m.role}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function CountdownBlock({ props, theme }) {
  const primary = theme?.colors?.primary || '#0114dc';
  const targetDate = props.date ? new Date(props.date) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const now = new Date();
  const diff = Math.max(0, targetDate - now);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return (
    <section className="py-14 px-8 text-center" style={{ background: `linear-gradient(135deg, ${primary}10, ${primary}04)` }}>
      <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: theme?.fonts?.heading }}>{props.title || 'Prochain événement'}</h2>
      <p className="text-sm text-gray-500 mb-8">{props.subtitle || 'Ne manquez pas !'}</p>
      <div className="flex items-center justify-center gap-4">
        {[{ value: days, label: 'Jours' }, { value: hours, label: 'Heures' }, { value: minutes, label: 'Minutes' }].map(({ value, label }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 p-5 min-w-[90px] shadow-sm">
            <p className="text-3xl font-extrabold" style={{ color: primary }}>{value}</p>
            <p className="text-xs text-gray-400 mt-1">{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function MapBlock({ props }) {
  const address = encodeURIComponent(props.address || 'Paris, France');
  return (
    <section className="py-14 px-8">
      {props.title && <h2 className="text-2xl font-bold mb-5">{props.title}</h2>}
      <div className="rounded-2xl overflow-hidden border border-gray-200 h-80">
        <iframe
          src={`https://www.openstreetmap.org/export/embed.html?bbox=${props.bbox || '2.3,48.85,2.36,48.87'}&layer=mapnik&marker=${props.lat || '48.8566'},${props.lng || '2.3522'}`}
          className="w-full h-full border-0"
          loading="lazy"
        />
      </div>
      {props.address && <p className="text-sm text-gray-500 text-center mt-3">{props.address}</p>}
    </section>
  );
}

function SocialLinksBlock({ props, theme }) {
  const primary = theme?.colors?.primary || '#0114dc';
  const links = props.links?.length > 0 ? props.links : [
    { platform: 'Facebook', url: '#' },
    { platform: 'Instagram', url: '#' },
    { platform: 'Twitter', url: '#' },
  ];
  const icons = { Facebook: '📘', Instagram: '📸', Twitter: '🐦', LinkedIn: '💼', YouTube: '🎬', TikTok: '🎵', WhatsApp: '💬' };
  return (
    <section className="py-10 px-8 text-center">
      <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: theme?.fonts?.heading }}>{props.title || 'Suivez-nous'}</h2>
      <p className="text-sm text-gray-500 mb-6">Retrouvez-nous sur les réseaux sociaux</p>
      <div className="flex items-center justify-center gap-3">
        {links.map((l, i) => (
          <a key={i} href={l.url || '#'} target="_blank" rel="noopener noreferrer"
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl hover:scale-110 transition-transform no-underline"
            style={{ backgroundColor: `${primary}10` }}
          >
            {icons[l.platform] || '🔗'}
          </a>
        ))}
      </div>
    </section>
  );
}

function NewArrivalsBlock({ props, theme }) {
  const primary = theme?.colors?.primary || '#0114dc';
  const count = props.count || 6;
  const books = [
    { title: 'Nouveau Roman 1', color: '#10b981' },
    { title: 'Nouveau Roman 2', color: '#3b82f6' },
    { title: 'Nouveau Roman 3', color: '#f59e0b' },
    { title: 'Nouveau Roman 4', color: '#ec4899' },
    { title: 'Nouveau Roman 5', color: '#8b5cf6' },
    { title: 'Nouveau Roman 6', color: '#6366f1' },
  ];
  return (
    <section className="py-14 px-8">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold" style={{ fontFamily: theme?.fonts?.heading }}>{props.title || 'Nouveautés'}</h2>
          <p className="text-sm text-gray-500 mt-1">Derniers livres ajoutés à la collection</p>
        </div>
        <span className="text-xs font-semibold px-3 py-1.5 rounded-full" style={{ backgroundColor: `${primary}10`, color: primary }}>NEW</span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {books.slice(0, count).map((book, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
            <div className="aspect-[3/4] flex items-center justify-center" style={{ background: `linear-gradient(160deg, ${book.color}18, ${book.color}06)` }}>
              <BookOpen className="w-8 h-8" style={{ color: `${book.color}40` }} />
            </div>
            <div className="p-3.5">
              <p className="text-sm font-semibold text-gray-800 truncate">{book.title}</p>
              <p className="text-xs text-gray-400 mt-0.5">Ajouté récemment</p>
            </div>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-gray-300 text-center mt-5 uppercase tracking-wider font-medium">Aperçu — Livres réels sur le site public</p>
    </section>
  );
}

// ===== Nouveaux blocs (Phase 4) =====

function NewsletterBlock({ props, theme }) {
  const primary = theme?.colors?.primary || '#0114dc';
  return (
    <section className="py-14 px-8 text-center" style={{ background: `linear-gradient(135deg, ${primary}08, ${primary}03)` }}>
      <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: theme?.fonts?.heading }}>{props.title || 'Restez informé'}</h2>
      <p className="text-sm text-gray-500 mb-6">{props.subtitle || 'Recevez nos actualités par email'}</p>
      <div className="max-w-md mx-auto flex gap-2">
        <input type="email" placeholder={props.placeholder || 'votre@email.com'} className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm" readOnly />
        <button className="px-6 py-3 rounded-xl text-white text-sm font-semibold border-none" style={{ backgroundColor: primary }}>{props.buttonText || "S'inscrire"}</button>
      </div>
      {props.disclaimer && <p className="text-[10px] text-gray-400 mt-3">{props.disclaimer}</p>}
    </section>
  );
}

function PricingBlock({ props, theme }) {
  const primary = theme?.colors?.primary || '#0114dc';
  const plans = props.plans?.length ? props.plans : [
    { name: 'Gratuit', price: '0€', period: '/mois', features: ['Accès catalogue', 'Réservations'], highlighted: false },
    { name: 'Premium', price: '9€', period: '/mois', features: ['Tout Gratuit', 'Emprunts illimités', 'Événements exclusifs'], highlighted: true },
  ];
  return (
    <section className="py-14 px-8">
      <h2 className="text-2xl font-bold mb-8 text-center" style={{ fontFamily: theme?.fonts?.heading }}>{props.title || 'Nos tarifs'}</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto" style={{ gridTemplateColumns: `repeat(${Math.min(plans.length, 3)}, 1fr)` }}>
        {plans.map((plan, i) => (
          <div key={i} className={`rounded-2xl p-6 text-center ${plan.highlighted ? 'border-2 shadow-lg scale-105' : 'border border-gray-200'}`} style={plan.highlighted ? { borderColor: primary } : {}}>
            <h3 className="font-bold text-lg mb-1">{plan.name}</h3>
            <div className="text-3xl font-extrabold mb-1" style={{ color: plan.highlighted ? primary : undefined }}>{plan.price}<span className="text-sm font-normal text-gray-400">{plan.period}</span></div>
            <ul className="text-sm text-gray-500 space-y-2 my-4 text-left">
              {(plan.features || []).map((f, j) => <li key={j} className="flex items-start gap-2"><span style={{ color: primary }}>✓</span> {f}</li>)}
            </ul>
            <button className="w-full py-2.5 rounded-xl text-sm font-semibold border-none" style={plan.highlighted ? { backgroundColor: primary, color: 'white' } : { backgroundColor: '#f3f4f6', color: '#374151' }}>{plan.buttonText || 'Choisir'}</button>
          </div>
        ))}
      </div>
    </section>
  );
}

function AccordionBlock({ props, theme }) {
  const [openIndexes, setOpenIndexes] = useState([]);
  const primary = theme?.colors?.primary || '#0114dc';
  const items = props.items?.length ? props.items : [{ title: 'Section 1', content: 'Contenu de la section...' }, { title: 'Section 2', content: 'Autre contenu...' }];
  const toggle = (i) => {
    if (props.allowMultiple) {
      setOpenIndexes((prev) => prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]);
    } else {
      setOpenIndexes((prev) => prev.includes(i) ? [] : [i]);
    }
  };
  return (
    <section className="py-14 px-8">
      {props.title && <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: theme?.fonts?.heading }}>{props.title}</h2>}
      <div className="max-w-2xl mx-auto space-y-2">
        {items.map((item, i) => (
          <div key={i} className="border border-gray-200 rounded-xl overflow-hidden">
            <button onClick={() => toggle(i)} className="w-full flex items-center justify-between px-5 py-4 bg-white border-none cursor-pointer text-left">
              <span className="font-semibold text-sm text-gray-700">{item.title}</span>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${openIndexes.includes(i) ? 'rotate-180' : ''}`} />
            </button>
            {openIndexes.includes(i) && <div className="px-5 pb-4 text-sm text-gray-500">{item.content}</div>}
          </div>
        ))}
      </div>
    </section>
  );
}

function TabsBlock({ props, theme }) {
  const [activeTab, setActiveTab] = useState(0);
  const primary = theme?.colors?.primary || '#0114dc';
  const tabs = props.tabs?.length ? props.tabs : [{ label: 'Onglet 1', content: 'Contenu du premier onglet' }, { label: 'Onglet 2', content: 'Contenu du second onglet' }];
  return (
    <section className="py-14 px-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex border-b border-gray-200 mb-6 gap-1">
          {tabs.map((tab, i) => (
            <button key={i} onClick={() => setActiveTab(i)} className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors cursor-pointer bg-transparent border-x-0 border-t-0 ${activeTab === i ? 'text-gray-800' : 'border-transparent text-gray-400 hover:text-gray-600'}`} style={activeTab === i ? { borderColor: primary, color: primary } : {}}>
              {tab.label || `Onglet ${i + 1}`}
            </button>
          ))}
        </div>
        <div className="text-sm text-gray-600 leading-relaxed">{tabs[activeTab]?.content}</div>
      </div>
    </section>
  );
}

function CounterBlock({ props, theme }) {
  const primary = theme?.colors?.primary || '#0114dc';
  const counters = props.counters?.length ? props.counters : [{ value: 5000, label: 'Livres', suffix: '+' }, { value: 1200, label: 'Membres', suffix: '' }, { value: 50, label: 'Événements/an', suffix: '' }];
  return (
    <section className="py-14 px-8">
      {props.title && <h2 className="text-2xl font-bold mb-8 text-center" style={{ fontFamily: theme?.fonts?.heading }}>{props.title}</h2>}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto" style={{ gridTemplateColumns: `repeat(${Math.min(counters.length, 4)}, 1fr)` }}>
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

function MarqueeBlock({ props, theme }) {
  const primary = theme?.colors?.primary || '#0114dc';
  const speed = props.speed === 'slow' ? '30s' : props.speed === 'fast' ? '10s' : '20s';
  const text = props.text || 'Bienvenue à la bibliothèque ! Découvrez nos nouveautés et événements.';
  return (
    <section className="overflow-hidden py-3" style={{ backgroundColor: props.backgroundColor || `${primary}10`, color: props.textColor || primary }}>
      <div className="whitespace-nowrap animate-marquee inline-block" style={{ animation: `marquee ${speed} linear infinite` }}>
        <span className="text-sm font-medium px-8">{text}</span>
        <span className="text-sm font-medium px-8">{text}</span>
      </div>
      <style>{`@keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }`}</style>
    </section>
  );
}

function EmbedBlock({ props }) {
  return (
    <section className="py-14 px-8">
      {props.title && <h2 className="text-xl font-bold mb-4">{props.title}</h2>}
      <div className="bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden flex items-center justify-center" style={{ height: `${props.height || 400}px` }}>
        {props.url ? (
          <iframe src={props.url} className="w-full h-full border-none" title={props.title || 'Embed'} sandbox="allow-scripts allow-same-origin" />
        ) : (
          <p className="text-sm text-gray-400">Entrez une URL pour afficher le contenu</p>
        )}
      </div>
    </section>
  );
}

function SpacerBlock({ props }) {
  return (
    <div className="flex items-center justify-center" style={{ height: `${props.height || 40}px` }}>
      {props.showLine && <div className="w-full border-t" style={{ borderColor: props.lineColor || '#e5e7eb' }} />}
    </div>
  );
}

function LogoCloudBlock({ props, theme }) {
  const logos = props.logos?.length ? props.logos : [];
  return (
    <section className="py-14 px-8">
      {props.title && <h2 className="text-2xl font-bold mb-8 text-center" style={{ fontFamily: theme?.fonts?.heading }}>{props.title}</h2>}
      {logos.length > 0 ? (
        <div className="flex flex-wrap items-center justify-center gap-8">
          {logos.map((logo, i) => (
            <img key={i} src={logo.url} alt={logo.alt} className="h-12 object-contain" style={props.grayscale ? { filter: 'grayscale(100%)', opacity: 0.6 } : {}} />
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center gap-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="w-24 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-xs text-gray-300">Logo {i}</div>
          ))}
        </div>
      )}
    </section>
  );
}

function TimelineBlock({ props, theme }) {
  const primary = theme?.colors?.primary || '#0114dc';
  const events = props.events?.length ? props.events : [{ year: '2020', title: 'Fondation', description: 'Création de la bibliothèque' }, { year: '2023', title: 'Expansion', description: 'Ouverture de la salle numérique' }];
  return (
    <section className="py-14 px-8">
      {props.title && <h2 className="text-2xl font-bold mb-10 text-center" style={{ fontFamily: theme?.fonts?.heading }}>{props.title}</h2>}
      <div className="max-w-2xl mx-auto relative">
        <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5" style={{ backgroundColor: `${primary}20` }} />
        {events.map((evt, i) => (
          <div key={i} className={`relative flex items-start gap-6 mb-8 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
            <div className="absolute left-4 md:left-1/2 -translate-x-1/2 w-3 h-3 rounded-full border-2 bg-white z-10" style={{ borderColor: primary }} />
            <div className={`ml-10 md:ml-0 md:w-1/2 ${i % 2 === 0 ? 'md:pr-10 md:text-right' : 'md:pl-10'}`}>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${primary}10`, color: primary }}>{evt.year}</span>
              <h3 className="text-sm font-bold mt-2 text-gray-800">{evt.title}</h3>
              <p className="text-xs text-gray-500 mt-1">{evt.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function BeforeAfterBlock({ props, theme }) {
  const [position, setPosition] = useState(50);
  return (
    <section className="py-14 px-8">
      {props.title && <h2 className="text-2xl font-bold mb-6 text-center" style={{ fontFamily: theme?.fonts?.heading }}>{props.title}</h2>}
      <div className="max-w-2xl mx-auto relative overflow-hidden rounded-2xl" style={{ aspectRatio: '16/9' }}>
        {props.beforeImage && props.afterImage ? (
          <>
            <img src={props.afterImage} alt={props.afterLabel || 'Après'} className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 overflow-hidden" style={{ width: `${position}%` }}>
              <img src={props.beforeImage} alt={props.beforeLabel || 'Avant'} className="absolute inset-0 w-full h-full object-cover" style={{ minWidth: '100%' }} />
            </div>
            <input type="range" min="0" max="100" value={position} onChange={(e) => setPosition(Number(e.target.value))} className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-10" />
            <div className="absolute top-0 bottom-0 w-0.5 bg-white z-5 pointer-events-none" style={{ left: `${position}%` }}>
              <div className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center text-xs font-bold text-gray-500">↔</div>
            </div>
            <div className="absolute bottom-3 left-3 bg-black/50 text-white text-xs px-2 py-1 rounded-lg">{props.beforeLabel || 'Avant'}</div>
            <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-lg">{props.afterLabel || 'Après'}</div>
          </>
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center text-sm text-gray-400" style={{ aspectRatio: '16/9' }}>Ajoutez des images avant/après</div>
        )}
      </div>
    </section>
  );
}

// ===== Main renderer =====

const RENDERERS = {
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
  video: VideoBlock,
  divider: DividerBlock,
  'cta-banner': CTABannerBlock,
  testimonials: TestimonialsBlock,
  team: TeamBlock,
  countdown: CountdownBlock,
  map: MapBlock,
  'social-links': SocialLinksBlock,
  'new-arrivals': NewArrivalsBlock,
  newsletter: NewsletterBlock,
  pricing: PricingBlock,
  accordion: AccordionBlock,
  tabs: TabsBlock,
  counter: CounterBlock,
  marquee: MarqueeBlock,
  embed: EmbedBlock,
  spacer: SpacerBlock,
  'logo-cloud': LogoCloudBlock,
  timeline: TimelineBlock,
  'before-after': BeforeAfterBlock,
};

export { RENDERERS };

export default function BlockRenderer({ block, theme, isEditor = false }) {
  const Renderer = RENDERERS[block.type];
  if (!Renderer) return <div className="p-4 text-red-500 text-sm">Bloc inconnu : {block.type}</div>;

  const blockStyle = buildBlockStyle(block.styles);
  const blockClass = buildBlockClass(block.styles);

  return (
    <div
      className={`${isEditor ? 'pointer-events-none select-none' : ''} ${blockClass}`.trim()}
      style={{ ...blockStyle, position: block.styles?.backgroundOverlay ? 'relative' : undefined }}
    >
      <BlockOverlay styles={block.styles} />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <Renderer props={block.props || {}} theme={theme} />
      </div>
    </div>
  );
}
