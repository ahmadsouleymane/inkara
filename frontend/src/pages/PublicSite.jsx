import { Link } from 'react-router-dom';
import {
  Library,
  BookOpen,
  BookCopy,
  QrCode,
  BarChart3,
  CalendarDays,
  Globe,
  Check,
  X,
  ArrowRight,
  ChevronRight,
} from 'lucide-react';

export default function PublicSite() {
  return (
    <div style={{ scrollBehavior: 'smooth' }} className="min-h-screen bg-[var(--color-bg)]">
      {/* ========== SECTION 1: HEADER ========== */}
      <header className="bg-[var(--color-surface)] border-b border-[var(--color-border)] sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 no-underline">
            <div className="w-9 h-9 bg-[var(--color-primary)] rounded-lg flex items-center justify-center">
              <Library className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-[var(--color-dark)]">SmartLib</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#fonctionnalites" className="text-sm text-[var(--color-text-light)] hover:text-[var(--color-text)] no-underline transition-colors">
              Fonctionnalités
            </a>
            <a href="#tarifs" className="text-sm text-[var(--color-text-light)] hover:text-[var(--color-text)] no-underline transition-colors">
              Tarifs
            </a>
            <a href="#contact" className="text-sm text-[var(--color-text-light)] hover:text-[var(--color-text)] no-underline transition-colors">
              Contact
            </a>
          </nav>
          <Link
            to="/inscription"
            className="bg-[var(--color-primary)] text-white px-5 py-2.5 rounded-lg text-sm font-semibold no-underline hover:opacity-90 transition-opacity"
          >
            Commencer gratuitement
          </Link>
        </div>
      </header>

      {/* ========== SECTION 2: HERO ========== */}
      <section className="bg-[var(--color-bg)] py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[var(--color-dark)] leading-tight mb-6">
              Créez le site de votre bibliothèque en 5 minutes
            </h1>
            <p className="text-lg md:text-xl text-[var(--color-text-light)] mb-10 leading-relaxed">
              Catalogue en ligne, gestion des emprunts, membres — tout en un. Gratuit pour commencer.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/inscription"
                className="bg-[var(--color-primary)] text-white px-8 py-3.5 rounded-xl text-base font-semibold no-underline hover:opacity-90 transition-opacity flex items-center gap-2"
              >
                Commencer gratuitement
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/demo"
                className="border-2 border-[var(--color-dark)] text-[var(--color-dark)] px-8 py-3.5 rounded-xl text-base font-semibold no-underline hover:bg-[var(--color-dark)] hover:text-white transition-colors"
              >
                Voir la démo
              </Link>
            </div>
          </div>

          {/* Fake dashboard mockup */}
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl border border-[var(--color-border)] overflow-hidden">
            <div className="flex">
              {/* Sidebar */}
              <div className="hidden sm:flex w-48 bg-[var(--color-dark)] p-4 flex-col gap-3 min-h-[280px]">
                <div className="w-20 h-3 bg-white/20 rounded-full" />
                <div className="mt-4 flex flex-col gap-2.5">
                  <div className="w-full h-8 bg-white/10 rounded-lg" />
                  <div className="w-full h-8 bg-[var(--color-primary)] rounded-lg opacity-80" />
                  <div className="w-full h-8 bg-white/10 rounded-lg" />
                  <div className="w-full h-8 bg-white/10 rounded-lg" />
                  <div className="w-full h-8 bg-white/10 rounded-lg" />
                </div>
              </div>
              {/* Main area */}
              <div className="flex-1 p-5">
                <div className="flex gap-3 mb-4">
                  <div className="h-3 w-32 bg-[var(--color-dark)] rounded-full opacity-20" />
                  <div className="h-3 w-20 bg-[var(--color-dark)] rounded-full opacity-10" />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                  <div className="h-20 rounded-xl bg-[var(--color-primary)] opacity-15" />
                  <div className="h-20 rounded-xl bg-[var(--color-orange)] opacity-15" />
                  <div className="h-20 rounded-xl bg-[var(--color-coral)] opacity-15 hidden md:block" />
                </div>
                <div className="h-32 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)]" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== SECTION 3: LOGOS BANNER ========== */}
      <section className="py-12 bg-[var(--color-surface)] border-y border-[var(--color-border)]">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-sm text-[var(--color-text-light)] mb-8">
            Déjà adopté par des bibliothèques partout dans le monde
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-14">
            {['Biblio Dakar', 'Médiathèque Lyon', 'Library Abidjan', 'Bibliotheca Roma', 'Bücherei Berlin'].map(
              (name) => (
                <span key={name} className="text-lg font-semibold text-[var(--color-text-light)] opacity-40">
                  {name}
                </span>
              )
            )}
          </div>
        </div>
      </section>

      {/* ========== SECTION 4: BENTO GRID FEATURES ========== */}
      <section id="fonctionnalites" className="py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-[var(--color-dark)] mb-14">
            Tout ce dont votre bibliothèque a besoin
          </h2>

          <div
            className="grid gap-4"
            style={{
              gridTemplateColumns: 'repeat(3, 1fr)',
              gridTemplateRows: 'auto auto',
            }}
          >
            {/* Card 1 - large, spans 2 cols */}
            <div
              className="rounded-2xl p-8 flex flex-col justify-between"
              style={{
                gridColumn: '1 / 3',
                gridRow: '1 / 2',
                backgroundColor: 'var(--color-dark)',
                color: 'white',
                minHeight: '220px',
              }}
            >
              <BookOpen className="w-8 h-8 mb-4 opacity-80" />
              <div>
                <h3 className="text-lg font-semibold mb-2">Catalogue en ligne</h3>
                <p className="text-sm opacity-70 leading-relaxed">
                  Publiez votre catalogue et laissez vos membres parcourir vos livres en ligne.
                </p>
              </div>
            </div>

            {/* Card 2 */}
            <div
              className="rounded-2xl p-8 bg-[var(--color-surface)] border border-[var(--color-border)]"
              style={{ gridColumn: '3 / 4', gridRow: '1 / 2' }}
            >
              <BookCopy className="w-8 h-8 mb-4 text-[var(--color-primary)]" />
              <h3 className="text-lg font-semibold mb-2 text-[var(--color-dark)]">Gestion des emprunts</h3>
              <p className="text-sm text-[var(--color-text-light)] leading-relaxed">
                Suivez chaque emprunt, retour et renouvellement.
              </p>
            </div>

            {/* Card 3 */}
            <div
              className="rounded-2xl p-8 bg-[var(--color-surface)] border border-[var(--color-border)]"
              style={{ gridColumn: '1 / 2', gridRow: '2 / 3' }}
            >
              <QrCode className="w-8 h-8 mb-4 text-[var(--color-orange)]" />
              <h3 className="text-lg font-semibold mb-2 text-[var(--color-dark)]">Membres & QR Codes</h3>
              <p className="text-sm text-[var(--color-text-light)] leading-relaxed">
                Chaque membre reçoit un QR code unique.
              </p>
            </div>

            {/* Card 6 - large, spans 2 cols */}
            <div
              className="rounded-2xl p-8 flex flex-col justify-between"
              style={{
                gridColumn: '2 / 4',
                gridRow: '2 / 3',
                background: 'linear-gradient(135deg, var(--color-primary), #010fb3)',
                color: 'white',
                minHeight: '220px',
              }}
            >
              <Globe className="w-8 h-8 mb-4 opacity-80" />
              <div>
                <h3 className="text-lg font-semibold mb-2">Votre site personnalisé</h3>
                <p className="text-sm opacity-70 leading-relaxed">
                  Publiez un site unique pour votre bibliothèque avec votre logo et vos couleurs.
                </p>
              </div>
            </div>

            {/* Card 4 */}
            <div
              className="rounded-2xl p-8 bg-[var(--color-surface)] border border-[var(--color-border)]"
              style={{ gridColumn: '1 / 2', gridRow: '3 / 4' }}
            >
              <BarChart3 className="w-8 h-8 mb-4 text-[var(--color-coral)]" />
              <h3 className="text-lg font-semibold mb-2 text-[var(--color-dark)]">Statistiques</h3>
              <p className="text-sm text-[var(--color-text-light)] leading-relaxed">
                Visualisez l'activité de votre bibliothèque en temps réel.
              </p>
            </div>

            {/* Card 5 */}
            <div
              className="rounded-2xl p-8 bg-[var(--color-surface)] border border-[var(--color-border)]"
              style={{ gridColumn: '2 / 3', gridRow: '3 / 4' }}
            >
              <CalendarDays className="w-8 h-8 mb-4 text-[var(--color-primary)]" />
              <h3 className="text-lg font-semibold mb-2 text-[var(--color-dark)]">Événements</h3>
              <p className="text-sm text-[var(--color-text-light)] leading-relaxed">
                Organisez des événements et gérez les inscriptions.
              </p>
            </div>
          </div>

          {/* Mobile-friendly: override grid to 1 col on small screens */}
          <style>{`
            @media (max-width: 768px) {
              #fonctionnalites .grid {
                grid-template-columns: 1fr !important;
              }
              #fonctionnalites .grid > div {
                grid-column: 1 / -1 !important;
                grid-row: auto !important;
              }
            }
          `}</style>
        </div>
      </section>

      {/* ========== SECTION 5: METRICS ========== */}
      <section className="py-16 bg-[var(--color-primary)]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center text-white">
            {[
              { number: '10,000+', label: 'Livres gérés' },
              { number: '150+', label: 'Bibliothèques' },
              { number: '25,000+', label: 'Emprunts/mois' },
            ].map((m) => (
              <div key={m.label}>
                <div className="text-4xl md:text-5xl font-bold mb-2">{m.number}</div>
                <div className="text-sm opacity-80">{m.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== SECTION 6: HOW IT WORKS ========== */}
      <section className="py-20 md:py-28 bg-[var(--color-bg)]">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-[var(--color-dark)] mb-14">
            Lancez-vous en 3 étapes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connecting line (desktop only) */}
            <div className="hidden md:block absolute top-10 left-[20%] right-[20%] h-0.5 bg-[var(--color-border)]" />

            {[
              {
                step: 1,
                title: 'Créez votre compte',
                desc: 'Inscrivez-vous gratuitement en 30 secondes.',
              },
              {
                step: 2,
                title: 'Configurez votre bibliothèque',
                desc: 'Ajoutez vos livres, personnalisez votre site.',
              },
              {
                step: 3,
                title: 'Publiez et gérez',
                desc: 'Votre site est en ligne. Gérez tout depuis votre dashboard.',
              },
            ].map((s) => (
              <div key={s.step} className="text-center relative z-10">
                <div className="w-14 h-14 bg-[var(--color-primary)] text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-5">
                  {s.step}
                </div>
                <h3 className="text-lg font-semibold text-[var(--color-dark)] mb-2">{s.title}</h3>
                <p className="text-sm text-[var(--color-text-light)] max-w-xs mx-auto">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== SECTION 7: TESTIMONIALS ========== */}
      <section className="py-20 md:py-28 bg-[var(--color-surface)]">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-[var(--color-dark)] mb-14">
            Ce que disent nos utilisateurs
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                quote:
                  'SmartLib a transformé notre bibliothèque. Nos membres adorent consulter le catalogue en ligne.',
                author: 'Aminata Diallo',
                library: 'Bibliothèque Nationale de Dakar',
              },
              {
                quote:
                  "Simple, efficace, et le support est excellent. On ne reviendrait pas en arrière.",
                author: 'Marc Dupont',
                library: 'Médiathèque de Lyon',
              },
              {
                quote:
                  'Nous avons digitalisé toute notre gestion en une semaine grâce à SmartLib.',
                author: 'Fatou Sow',
                library: 'Biblio Abidjan',
              },
            ].map((t) => (
              <div
                key={t.author}
                className="bg-[var(--color-bg)] rounded-2xl p-6 md:p-8"
              >
                <p className="text-[var(--color-text)] italic leading-relaxed mb-6">
                  "{t.quote}"
                </p>
                <div>
                  <p className="font-semibold text-[var(--color-dark)]">{t.author}</p>
                  <p className="text-sm text-[var(--color-text-light)]">{t.library}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== SECTION 8: PRICING ========== */}
      <section id="tarifs" className="py-20 md:py-28 bg-[var(--color-bg)]">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-[var(--color-dark)] mb-14">
            Des tarifs simples et transparents
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {/* Free Plan */}
            <div className="bg-[var(--color-surface)] rounded-2xl p-8 border border-[var(--color-border)]">
              <h3 className="text-xl font-bold text-[var(--color-dark)] mb-2">Gratuit</h3>
              <div className="text-3xl font-bold text-[var(--color-dark)] mb-6">
                0 FCFA <span className="text-base font-normal text-[var(--color-text-light)]">/ mois</span>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  { text: "Jusqu'à 500 livres", ok: true },
                  { text: '50 membres max', ok: true },
                  { text: 'Dashboard de gestion', ok: true },
                  { text: 'QR codes membres', ok: true },
                  { text: 'Site public non publié', ok: false },
                  { text: 'Export données', ok: false },
                  { text: 'Support prioritaire', ok: false },
                ].map((f) => (
                  <li key={f.text} className="flex items-center gap-3 text-sm">
                    {f.ok ? (
                      <Check className="w-4 h-4 text-[var(--color-primary)] flex-shrink-0" />
                    ) : (
                      <X className="w-4 h-4 text-[var(--color-coral)] flex-shrink-0" />
                    )}
                    <span className={f.ok ? 'text-[var(--color-text)]' : 'text-[var(--color-text-light)]'}>
                      {f.text}
                    </span>
                  </li>
                ))}
              </ul>
              <Link
                to="/inscription"
                className="block text-center border-2 border-[var(--color-dark)] text-[var(--color-dark)] px-6 py-3 rounded-xl font-semibold no-underline hover:bg-[var(--color-dark)] hover:text-white transition-colors"
              >
                Commencer
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="bg-[var(--color-dark)] rounded-2xl p-8 text-white relative overflow-hidden">
              <div className="absolute top-4 right-4 bg-[var(--color-orange)] text-white text-xs font-bold px-3 py-1 rounded-full">
                Recommandé
              </div>
              <h3 className="text-xl font-bold mb-2">Pro</h3>
              <div className="text-3xl font-bold mb-6">
                9,900 FCFA <span className="text-base font-normal opacity-70">/ mois</span>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  'Livres illimités',
                  'Membres illimités',
                  'Site public publié',
                  'Export Excel & PDF',
                  'Support prioritaire',
                  'Événements',
                  'Statistiques avancées',
                ].map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm">
                    <Check className="w-4 h-4 text-[var(--color-primary)] flex-shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                to="/inscription?plan=pro"
                className="block text-center bg-[var(--color-primary)] text-white px-6 py-3 rounded-xl font-semibold no-underline hover:opacity-90 transition-opacity"
              >
                Choisir Pro
              </Link>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-[var(--color-surface)] rounded-2xl p-8 border border-[var(--color-border)]">
              <h3 className="text-xl font-bold text-[var(--color-dark)] mb-2">Enterprise</h3>
              <div className="text-3xl font-bold text-[var(--color-dark)] mb-6">
                Sur mesure
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  'Tout dans Pro',
                  'API accès',
                  'Multi-branches',
                  'Formation dédiée',
                  'SLA garanti',
                ].map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm">
                    <Check className="w-4 h-4 text-[var(--color-primary)] flex-shrink-0" />
                    <span className="text-[var(--color-text)]">{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                to="/contact"
                className="block text-center border-2 border-[var(--color-dark)] text-[var(--color-dark)] px-6 py-3 rounded-xl font-semibold no-underline hover:bg-[var(--color-dark)] hover:text-white transition-colors"
              >
                Nous contacter
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========== SECTION 9: CTA FINAL ========== */}
      <section className="py-20 md:py-28 bg-[var(--color-dark)]">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Prêt à digitaliser votre bibliothèque ?
          </h2>
          <p className="text-lg text-white/70 mb-10">
            Rejoignez des centaines de bibliothèques qui utilisent SmartLib.
          </p>
          <Link
            to="/inscription"
            className="inline-flex items-center gap-2 bg-[var(--color-primary)] text-white px-8 py-4 rounded-xl text-lg font-semibold no-underline hover:opacity-90 transition-opacity"
          >
            Créer ma bibliothèque gratuitement
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* ========== SECTION 10: FOOTER ========== */}
      <footer id="contact" className="bg-[var(--color-dark)] border-t border-white/10 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 mb-12">
            {/* SmartLib */}
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 bg-[var(--color-primary)] rounded-lg flex items-center justify-center">
                  <Library className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-bold text-white">SmartLib</span>
              </div>
              <p className="text-sm text-white/50 leading-relaxed">
                La plateforme de gestion pour les bibliothèques modernes.
              </p>
            </div>

            {/* Produit */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Produit</h4>
              <ul className="space-y-2.5">
                <li>
                  <a href="#fonctionnalites" className="text-sm text-white/50 hover:text-white no-underline transition-colors">
                    Fonctionnalités
                  </a>
                </li>
                <li>
                  <a href="#tarifs" className="text-sm text-white/50 hover:text-white no-underline transition-colors">
                    Tarifs
                  </a>
                </li>
                <li>
                  <Link to="/demo" className="text-sm text-white/50 hover:text-white no-underline transition-colors">
                    Démo
                  </Link>
                </li>
              </ul>
            </div>

            {/* Ressources */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Ressources</h4>
              <ul className="space-y-2.5">
                <li>
                  <Link to="/docs" className="text-sm text-white/50 hover:text-white no-underline transition-colors">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link to="/blog" className="text-sm text-white/50 hover:text-white no-underline transition-colors">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link to="/support" className="text-sm text-white/50 hover:text-white no-underline transition-colors">
                    Support
                  </Link>
                </li>
              </ul>
            </div>

            {/* Légal */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Légal</h4>
              <ul className="space-y-2.5">
                <li>
                  <Link to="/conditions" className="text-sm text-white/50 hover:text-white no-underline transition-colors">
                    Conditions d'utilisation
                  </Link>
                </li>
                <li>
                  <Link to="/confidentialite" className="text-sm text-white/50 hover:text-white no-underline transition-colors">
                    Politique de confidentialité
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-white/40">
              &copy; 2026 SmartLib. Tous droits réservés.
            </p>
            <p className="text-sm text-white/40">
              Fait avec amour au Sénégal
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
