# SmartLib Evolution Plan - De gestionnaire de bibliothèque à plateforme SaaS type Shopify

## Contexte

SmartLib est actuellement un système de gestion de bibliothèque multi-tenant fonctionnel (React 19 + Express 5 + MongoDB). Le projet possède déjà : gestion des prêts, QR codes utilisateurs, recherche basique, site public par bibliothèque (`/lib/:slug`), notifications, réservations, amendes, événements, et un dashboard de stats.

**Objectif :** Transformer SmartLib en une plateforme complète où chaque bibliothèque obtient à la fois un outil de gestion professionnel ET son propre site web personnalisable — le Shopify des bibliothèques.

**Problèmes identifiés :** Plusieurs contrôleurs (books, stats, scheduler) ne filtrent pas par `organizationId`, causant des fuites de données entre organisations. Le modèle `Library` singleton est redondant avec `Organization`.

---

## Phase 0 — Solidification des fondations (Semaine 1-2)

### 0.1 Isolation complète des tenants
Tous les contrôleurs doivent filtrer par `organizationId` :
- `backend/controllers/book.controller.js` — ajouter `organizationId` à chaque requête
- `backend/controllers/stats.controller.js` — scoper toutes les agrégations
- `backend/controllers/loan.controller.js` — scoper toutes les requêtes
- `backend/controllers/fine.controller.js`, `reservation.controller.js`, `review.controller.js`, `event.controller.js`, `presence.controller.js`, `notification.controller.js` — audit et ajout du scoping
- `backend/utils/scheduler.js` — itérer par organisation au lieu de requêtes globales

### 0.2 Retirer le modèle Library singleton
- Rediriger `backend/controllers/library.controller.js` vers les données Organization
- Remplacer l'import `Library` par `Organization` dans le scheduler

### 0.3 Index MongoDB pour la performance
- `Book` : index composé `{ organizationId: 1, title: 'text', author: 'text', isbn: 'text' }`
- `Loan` : index `{ organizationId: 1, status: 1, dueDate: 1 }`
- `Notification` : index `{ user: 1, read: 1, createdAt: -1 }`

---

## Phase 1 — Système QR Code avancé (Semaine 3-4)

### 1.1 QR Codes pour les livres
**Nouveaux fichiers :**
- `backend/controllers/qr.controller.js` — génération/scan centralisé
- `backend/routes/qr.routes.js`
- `frontend/src/pages/admin/QRManager.jsx` — génération batch de QR
- `frontend/src/api/qr.js`

**Modifications :**
- `backend/models/Book.js` — ajouter champ `qrCode` et `qrCodeData`

**Logique :** Chaque livre encode une URL `https://smartlib.app/scan/book/{bookId}`. Génération batch de planches d'étiquettes QR avec PDFKit (format Avery 30/page).

### 1.2 Self-Checkout (borne libre-service)
**Nouveaux fichiers :**
- `frontend/src/pages/SelfCheckout.jsx` — page kiosque
- `backend/controllers/selfcheckout.controller.js`
- `backend/routes/selfcheckout.routes.js`

**Flux :** Caméra du navigateur (`html5-qrcode`) → scan QR membre → scan QR livre → emprunt automatique. Supporte aussi le retour.

**Nouvelle dépendance frontend :** `html5-qrcode`

### 1.3 Scanner d'inventaire
**Nouveau fichier :** `frontend/src/pages/admin/InventoryScanner.jsx`

Le bibliothécaire parcourt les rayons avec son téléphone, scanne les QR des livres. Le système compare avec les emplacements attendus et signale les livres manquants ou mal rangés.

---

## Phase 2 — Recherche intelligente & enrichissement des données (Semaine 5-6)

### 2.1 Intégration Open Library / Google Books API
**Nouveaux fichiers :**
- `backend/services/bookLookup.service.js` — abstraction Open Library (`openlibrary.org/isbn/{isbn}.json`) + fallback Google Books
- `backend/controllers/lookup.controller.js`
- `backend/routes/lookup.routes.js`

**Modification :** `frontend/src/pages/BookForm.jsx` — bouton "Remplir depuis ISBN" qui appelle le lookup et pré-remplit titre, auteur, éditeur, année, pages, couverture, description.

Cache des résultats en base pour éviter les appels API redondants.

### 2.2 Recherche fuzzy avec autocomplétion
**Nouveaux fichiers :**
- `backend/controllers/search.controller.js` — `GET /api/search/suggest?q=...` retourne top 5 suggestions
- `backend/routes/search.routes.js`
- `frontend/src/components/SearchAutocomplete.jsx` — input avec debounce 300ms et dropdown

### 2.3 Nouveaux champs livres
**Modification :** `backend/models/Book.js` — ajouter `language`, `format` (physical/ebook/audiobook), `tags`, `subjects`

---

## Phase 3 — Analytics & reporting avancés (Semaine 7-9)

### 3.1 Moteur de statistiques complet
**Modification majeure :** `backend/controllers/stats.controller.js`

**Nouveaux endpoints :**
- `GET /api/stats/kpis` — taux de circulation, ratio de rotation, taux de retard, durée moyenne de prêt
- `GET /api/stats/trends` — comparaisons mois par mois avec pourcentages d'évolution
- `GET /api/stats/members` — croissance des membres, actifs vs inactifs, top emprunteurs
- `GET /api/stats/collection` — analyse d'âge, lacunes par catégorie, distribution des conditions
- `GET /api/stats/circulation` — heatmap d'activité par heure/jour

### 3.2 Dashboard analytics frontend
**Nouveaux fichiers :**
- `frontend/src/pages/admin/Analytics.jsx` — dashboard complet avec Recharts (déjà installé)
- `frontend/src/pages/admin/ReportBuilder.jsx` — sélecteur de période + type, génère PDF/Excel

### 3.3 Export amélioré
- PDF professionnels avec PDFKit (en-têtes, tableaux, résumés, pagination)
- Export CSV en plus d'Excel
- Filtrage par période sur tous les exports

---

## Phase 4 — Constructeur de site web (Semaine 10-14) — Le différenciateur Shopify

### 4.1 Modèles de données
**Nouveaux fichiers :**
- `backend/models/SitePage.js` — pages avec blocs ordonnés
  ```
  { organizationId, slug, title, isHomepage, isPublished, order,
    blocks: [{ id, type, props (Mixed JSON), order }],
    seo: { title, description, ogImage } }
  ```
- `backend/models/SiteTheme.js` — thème par organisation
  ```
  { organizationId, template ('classic'|'modern'|'minimal'|'academic'),
    colors: { primary, secondary, accent, background, text },
    fonts: { heading, body },
    navigation: { style, showSearch, showLogin, links } }
  ```

### 4.2 API Site Builder
**Nouveaux fichiers :**
- `backend/controllers/sitebuilder.controller.js`
- `backend/routes/sitebuilder.routes.js`

**Endpoints :**
- CRUD pages : `GET/POST/PUT/DELETE /api/sitebuilder/pages`
- Thème : `GET/PUT /api/sitebuilder/theme`
- Public : `GET /api/organization/public/:slug/pages`, `/theme`

### 4.3 Éditeur drag-and-drop
**Nouveaux fichiers :**
- `frontend/src/pages/admin/SiteBuilder.jsx` — éditeur principal (sidebar blocs | canvas central | éditeur props)
- `frontend/src/pages/admin/SiteBuilderPageList.jsx` — gestion des pages
- `frontend/src/components/sitebuilder/BlockPalette.jsx` — palette de blocs glissables
- `frontend/src/components/sitebuilder/BlockCanvas.jsx` — liste triable avec `@dnd-kit`
- `frontend/src/components/sitebuilder/BlockPropsEditor.jsx` — formulaires par type de bloc
- `frontend/src/components/sitebuilder/BlockRenderer.jsx` — rendu des blocs (éditeur + public)
- `frontend/src/components/sitebuilder/ThemeEditor.jsx` — couleurs, polices, template

**Types de blocs :**
- `HeroBlock` — bannière d'accueil avec titre, sous-titre, image, CTA
- `CatalogBlock` — catalogue de livres avec recherche et filtres
- `EventsBlock` — liste des événements
- `TextBlock` — texte riche libre
- `ImageBlock` — image avec légende
- `ContactBlock` — formulaire de contact + infos
- `FeaturedBooksBlock` — livres mis en avant / recommandations
- `StatsBlock` — statistiques publiques de la bibliothèque
- `HoursBlock` — horaires d'ouverture
- `FAQBlock` — questions fréquentes
- `GalleryBlock` — galerie photos

**Nouvelles dépendances :** `@dnd-kit/core`, `@dnd-kit/sortable`

### 4.4 Refonte du rendu public
**Modification majeure :** `frontend/src/pages/LibrarySite.jsx`
- Passer des onglets hardcodés à un rendu dynamique basé sur les blocs
- Charger thème + pages depuis l'API
- Appliquer les couleurs/polices via CSS custom properties
- Nouvelles routes : `/lib/:slug` et `/lib/:slug/:pageSlug`

### 4.5 Templates par défaut
À la création d'une organisation, générer automatiquement :
- **Accueil** : HeroBlock + FeaturedBooksBlock + StatsBlock
- **Catalogue** : CatalogBlock avec recherche
- **Événements** : EventsBlock
- **À propos** : TextBlock + HoursBlock + ContactBlock

---

## Phase 5 — Système de notifications enrichi (Semaine 15-16)

### 5.1 Service email
**Nouveaux fichiers :**
- `backend/services/email.service.js` — abstraction Nodemailer/SendGrid
- `backend/services/email.templates.js` — templates HTML
- `backend/config/email.js`

**Nouvelle dépendance :** `nodemailer`

### 5.2 Types de notifications
- Rappel 3 jours avant l'échéance
- Rappel le jour de l'échéance
- Alerte retard (quotidien)
- Réservation disponible
- Amende créée
- Digest nouveautés (hebdomadaire, par catégories favorites)
- Rappel événement (veille)

### 5.3 Préférences utilisateur
**Modification :** `backend/models/User.js` — ajouter `notificationPreferences: { email, inApp, categories }`
**Nouveau fichier :** `frontend/src/pages/NotificationPreferences.jsx`

### 5.4 SMS (Enterprise uniquement, optionnel)
- `backend/services/sms.service.js` avec Twilio
- Dépendance : `twilio`

---

## Phase 6 — Outils puissants pour bibliothécaires (Semaine 17-19)

### 6.1 Opérations en lot
**Modifications :**
- `backend/controllers/book.controller.js` — `bulkUpdate`, `bulkDelete`, `bulkCategoryChange`
- `frontend/src/pages/Books.jsx` — checkboxes + barre d'actions groupées

**Nouveau :** `frontend/src/components/BulkActionBar.jsx`

### 6.2 Listes de lecture / Collections
**Nouveaux fichiers :**
- `backend/models/ReadingList.js` — `{ organizationId, title, description, books, createdBy, isPublic }`
- `backend/controllers/readinglist.controller.js` + routes
- `frontend/src/pages/ReadingLists.jsx` + `ReadingListDetail.jsx`
- Bloc `ReadingListsBlock` pour le site builder

### 6.3 Communication avec les membres
**Nouveaux fichiers :**
- `backend/controllers/broadcast.controller.js` — envoi groupé (in-app + email) avec filtres d'audience
- `frontend/src/pages/admin/Broadcast.jsx` — composition, sélection d'audience, prévisualisation

### 6.4 Traitement automatisé des retards
**Modifications :**
- `backend/utils/scheduler.js` — auto-création d'amendes après période de grâce configurable
- `backend/models/Organization.js` — ajouter `fineSettings: { enabled, amountPerDay, gracePeriodDays, maxFine }`

---

## Phase 7 — Gestion des plans (Semaine 20-21)

### 7.1 Gating par plan
**Nouveaux fichiers :**
- `backend/middleware/planGate.js` — middleware vérifiant le plan
- `backend/config/plans.js` — limites par plan :

| Fonctionnalité | Free | Pro | Enterprise |
|---|---|---|---|
| Livres | 50 | 200 | Illimité |
| Membres | 50 | 500 | Illimité |
| Site public | Non | Oui | Oui |
| Domaine custom | Non | Non | Oui |
| Analytics | Basique | Avancé | Complet |
| Email | Non | Oui | Oui |
| SMS | Non | Non | Oui |
| Templates site | 1 | 5 | Illimité |

### 7.2 Interface de gestion des plans
**Nouveaux fichiers :**
- `frontend/src/pages/admin/PlanManager.jsx` — affichage du plan actuel, comparaison des formules
- `backend/controllers/plan.controller.js` — endpoints pour consulter/changer de plan

La gestion des plans se fait côté admin (superadmin assigne les plans aux organisations). Pas de paiement en ligne intégré.

---

## Phase 8 — Finitions & fonctionnalités avancées (Semaine 22+)

- **Routing par sous-domaine** : `bibliotheque-name.smartlib.app` via middleware Express
- **Domaines personnalisés** (Enterprise) : vérification DNS + reverse proxy
- **SEO** : meta tags dynamiques, sitemap.xml, robots.txt par organisation
- **PWA** : manifest.json + service worker pour mode kiosque offline

---

## Nouvelles dépendances à installer

**Backend :** `nodemailer`, (optionnel : `twilio`)
**Frontend :** `@dnd-kit/core`, `@dnd-kit/sortable`, `html5-qrcode`

---

## Nouvelles routes frontend (`App.jsx`)

```
/site-builder              — Liste des pages
/site-builder/:pageSlug    — Éditeur de page
/site-builder/theme        — Éditeur de thème
/analytics                 — Dashboard analytics avancé
/qr-manager                — Génération batch QR
/self-checkout             — Borne libre-service
/inventory                 — Scanner d'inventaire
/reading-lists             — Gestion listes de lecture
/broadcast                 — Communication membres
/plan-manager              — Gestion des plans
/notification-preferences  — Préférences notifications
/lib/:slug/:pageSlug       — Pages publiques dynamiques
```

---

## Ordre d'exécution (graphe de dépendances)

```
Phase 0 (Fondations) ← OBLIGATOIRE EN PREMIER
    ├── Phase 1 (QR) ─────────┐
    ├── Phase 2 (Recherche) ───┤ parallélisables
    └── Phase 3 (Analytics) ───┘
            │
    Phase 4 (Site Builder) ← nécessite Phase 0 solide
    Phase 5 (Notifications) ← indépendant
            │
    Phase 6 (Outils) ← indépendant
    Phase 7 (Plans) ← nécessite Phase 4
            │
    Phase 8 (Finitions)
```

---

## Vérification / Tests

Pour chaque phase :
1. Créer 2+ organisations de test avec des données différentes
2. Vérifier qu'aucune donnée ne fuite entre organisations
3. Tester chaque feature sur les plans Free/Pro/Enterprise
4. Tester le responsive (mobile/tablette/desktop)
5. Vérifier les permissions par rôle (member, librarian, owner, admin)
6. Pour le site builder : créer un site complet, le publier, vérifier le rendu public
7. Pour les QR : générer, imprimer, scanner avec un vrai téléphone
8. Pour les notifications : vérifier la réception email + in-app
 