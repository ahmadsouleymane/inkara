import { Layout, BookOpen, Calendar, Users, Mail, Newspaper, FileText } from 'lucide-react';

export const PAGE_TEMPLATES = [
  {
    id: 'blank',
    label: 'Page vide',
    description: 'Commencez de zéro',
    icon: FileText,
    category: 'Basique',
    blocks: [],
  },
  {
    id: 'homepage-hero',
    label: 'Accueil — Bannière',
    description: 'Bannière hero, livres vedettes, statistiques et CTA',
    icon: Layout,
    category: 'Accueil',
    blocks: [
      { type: 'hero', props: { title: 'Bienvenue à la bibliothèque', subtitle: 'Découvrez des milliers de livres, participez à nos événements et rejoignez notre communauté.', buttonText: 'Explorer le catalogue', buttonLink: 'catalogue' } },
      { type: 'featured-books', props: { title: 'Nos recommandations', count: 6 } },
      { type: 'stats', props: { title: 'En chiffres' } },
      { type: 'cta-banner', props: { title: 'Rejoignez-nous', subtitle: 'Inscrivez-vous gratuitement et accédez à toute la collection.', buttonText: "S'inscrire" } },
    ],
  },
  {
    id: 'homepage-catalog',
    label: 'Accueil — Catalogue',
    description: 'Catalogue en avant, nouveautés et newsletter',
    icon: BookOpen,
    category: 'Accueil',
    blocks: [
      { type: 'hero', props: { title: 'Explorez notre collection', subtitle: 'Plus de milliers de titres vous attendent.', buttonText: 'Rechercher', buttonLink: 'catalogue' } },
      { type: 'catalog', props: { title: 'Catalogue', showSearch: true, showFilters: true } },
      { type: 'new-arrivals', props: { title: 'Nouveautés', count: 4 } },
      { type: 'newsletter', props: { title: 'Restez informé', subtitle: 'Recevez nos actualités par email', buttonText: "S'abonner" } },
    ],
  },
  {
    id: 'homepage-events',
    label: 'Accueil — Événements',
    description: 'Événements, compte à rebours et galerie',
    icon: Calendar,
    category: 'Accueil',
    blocks: [
      { type: 'hero', props: { title: 'Nos événements', subtitle: 'Ateliers, conférences, clubs de lecture...', buttonText: 'Voir le programme' } },
      { type: 'countdown', props: { title: 'Prochain événement', subtitle: 'Ne manquez pas !' } },
      { type: 'events', props: { title: 'À venir', count: 6 } },
      { type: 'gallery', props: { title: 'En images' } },
      { type: 'testimonials', props: { title: 'Ce que disent nos membres' } },
    ],
  },
  {
    id: 'about',
    label: 'À propos',
    description: 'Histoire, équipe, chronologie et statistiques',
    icon: Users,
    category: 'Pages',
    blocks: [
      { type: 'text', props: { title: 'Notre histoire', content: 'Présentez ici l\'histoire de votre bibliothèque, sa mission et ses valeurs.' } },
      { type: 'timeline', props: { title: 'Notre parcours', events: [{ year: '2015', title: 'Fondation', description: 'Ouverture de la bibliothèque' }, { year: '2020', title: 'Numérisation', description: 'Lancement du catalogue en ligne' }, { year: '2024', title: 'Expansion', description: 'Nouvelle salle de lecture' }] } },
      { type: 'team', props: { title: 'Notre équipe' } },
      { type: 'counter', props: { title: 'En chiffres', counters: [{ value: 5000, suffix: '+', label: 'Livres' }, { value: 1200, suffix: '', label: 'Membres' }, { value: 50, suffix: '', label: 'Événements/an' }] } },
    ],
  },
  {
    id: 'contact',
    label: 'Contact',
    description: 'Coordonnées, carte, horaires et FAQ',
    icon: Mail,
    category: 'Pages',
    blocks: [
      { type: 'contact', props: { title: 'Nous contacter', showForm: true, showMap: false } },
      { type: 'map', props: { title: 'Nous trouver' } },
      { type: 'hours', props: { title: 'Horaires d\'ouverture' } },
      { type: 'faq', props: { title: 'Questions fréquentes', items: [{ question: 'Comment s\'inscrire ?', answer: 'Rendez-vous à l\'accueil avec une pièce d\'identité.' }, { question: 'Combien de livres puis-je emprunter ?', answer: 'Vous pouvez emprunter jusqu\'à 5 livres simultanément.' }] } },
    ],
  },
  {
    id: 'news',
    label: 'Actualités',
    description: 'Annonces, événements et newsletter',
    icon: Newspaper,
    category: 'Pages',
    blocks: [
      { type: 'marquee', props: { text: 'Bienvenue ! Découvrez nos dernières actualités et événements à venir.', speed: 'normal' } },
      { type: 'text', props: { title: 'Actualités', content: 'Retrouvez ici les dernières nouvelles de la bibliothèque.' } },
      { type: 'events', props: { title: 'Prochains événements', count: 4 } },
      { type: 'new-arrivals', props: { title: 'Derniers livres ajoutés', count: 6 } },
      { type: 'newsletter', props: { title: 'Newsletter', subtitle: 'Ne manquez rien', buttonText: 'Je m\'abonne' } },
    ],
  },
];

export const TEMPLATE_CATEGORIES = [...new Set(PAGE_TEMPLATES.map((t) => t.category))];
