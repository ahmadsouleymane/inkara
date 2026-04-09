# SmartLib — CMS pour bibliothèques

SmartLib est un système de gestion de bibliothèque complet et moderne. Il permet à n'importe quelle bibliothèque de gérer ses livres, utilisateurs, emprunts et de disposer d'un site public de présentation avec catalogue en ligne.

## Fonctionnalités

- **Gestion des livres** : ajout, modification, suppression, recherche avec filtres par catégorie
- **Gestion des utilisateurs** : membres, bibliothécaires, administrateurs avec contrôle d'accès par rôle
- **Gestion des emprunts** : création, retour, renouvellement (max 2 fois), historique complet
- **Notifications** : alertes automatiques pour les retards et rappels avant échéance (scheduler quotidien à 9h)
- **Tableau de bord** : statistiques globales, graphiques d'emprunts mensuels, livres populaires, répartition par catégorie
- **Mini-site public** : page d'accueil avec infos de la bibliothèque, catalogue consultable en ligne, footer "Fait avec SmartLib"
- **Paramètres** : nom, logo, adresse, coordonnées, horaires, durée de prêt, gestion des catégories
- **Interface responsive** : adaptée mobile, tablette et desktop

## Stack technique

| Composant | Technologie |
|-----------|-------------|
| Backend   | Node.js, Express.js, MongoDB (Mongoose) |
| Frontend  | React 19, Vite, Tailwind CSS v4 |
| Auth      | JWT (JSON Web Tokens) |
| Icons     | Lucide React |
| Graphiques| Recharts |
| Notifications UI | React Hot Toast |

## Prérequis

- **Node.js** v18+ et **npm**
- **MongoDB** (local ou distant — MongoDB Atlas)

## Installation

### 1. Cloner le projet

```bash
cd ~/Desktop/SmartLib
```

### 2. Backend

```bash
cd backend
npm install
```

Configurer le fichier `.env` (déjà pré-rempli pour le développement local) :

```env
MONGO_URI=mongodb://localhost:27017/smartlib
JWT_SECRET=smartlib_secret_change_me_in_production
FRONTEND_URL=http://localhost:5173
PORT=7080
```

Lancer le serveur :

```bash
npm run dev
```

Le backend démarre sur `http://localhost:7080`.

### 3. Frontend

```bash
cd frontend
npm install
```

Le fichier `.env` est pré-configuré :

```env
VITE_API_URL=http://localhost:7080
```

Lancer le frontend :

```bash
npm run dev
```

L'application est accessible sur `http://localhost:5173`.

## Utilisation

### Premier lancement

1. Ouvrir `http://localhost:5173/inscription` pour créer un compte
2. Le premier utilisateur est créé avec le rôle `member` par défaut
3. Pour le promouvoir admin, modifier directement dans MongoDB :

```javascript
// Dans mongosh ou MongoDB Compass
db.users.updateOne({ email: "votre@email.com" }, { $set: { role: "admin" } })
```

4. Se reconnecter — vous aurez accès au tableau de bord admin, à la gestion des utilisateurs et aux paramètres

### Rôles

| Rôle | Droits |
|------|--------|
| **admin** | Accès total : livres, utilisateurs, emprunts, paramètres, catégories |
| **librarian** | Gestion des livres et des emprunts |
| **member** | Consultation du catalogue, historique de ses emprunts, notifications |

### Routes principales

| URL | Description |
|-----|-------------|
| `/` | Site public de la bibliothèque |
| `/catalogue` | Catalogue en ligne (public) |
| `/connexion` | Page de connexion |
| `/inscription` | Page d'inscription |
| `/dashboard` | Tableau de bord (connecté) |
| `/livres` | Gestion des livres |
| `/emprunts` | Gestion des emprunts |
| `/notifications` | Centre de notifications |
| `/utilisateurs` | Gestion des utilisateurs (admin) |
| `/parametres` | Paramètres de la bibliothèque (admin) |

### API endpoints

| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/api/auth/register` | Inscription |
| POST | `/api/auth/login` | Connexion |
| GET | `/api/auth/me` | Profil connecté |
| GET | `/api/books` | Liste des livres |
| POST | `/api/books` | Ajouter un livre |
| GET | `/api/books/:id` | Détail d'un livre |
| PUT | `/api/books/:id` | Modifier un livre |
| DELETE | `/api/books/:id` | Supprimer un livre |
| GET | `/api/users` | Liste des utilisateurs |
| POST | `/api/loans/borrow` | Créer un emprunt |
| PUT | `/api/loans/:id/return` | Retourner un livre |
| PUT | `/api/loans/:id/renew` | Renouveler un emprunt |
| GET | `/api/loans` | Liste des emprunts |
| GET | `/api/notifications` | Notifications |
| GET | `/api/categories` | Catégories |
| GET | `/api/library` | Profil de la bibliothèque |
| PUT | `/api/library` | Modifier le profil |
| GET | `/api/stats` | Statistiques du dashboard |

## Structure du projet

```
SmartLib/
├── backend/
│   ├── config/db.js              # Connexion MongoDB
│   ├── controllers/              # Logique métier
│   │   ├── auth.controller.js
│   │   ├── book.controller.js
│   │   ├── user.controller.js
│   │   ├── loan.controller.js
│   │   ├── notification.controller.js
│   │   ├── category.controller.js
│   │   ├── library.controller.js
│   │   └── stats.controller.js
│   ├── middleware/
│   │   ├── auth.js               # Protection JWT + rôles
│   │   └── upload.js             # Upload d'images (multer)
│   ├── models/                   # Schémas Mongoose
│   │   ├── User.js
│   │   ├── Book.js
│   │   ├── Loan.js
│   │   ├── Notification.js
│   │   ├── Category.js
│   │   └── Library.js
│   ├── routes/                   # Définition des routes
│   ├── utils/scheduler.js        # Cron pour les retards
│   ├── uploads/                  # Fichiers uploadés
│   ├── server.js                 # Point d'entrée
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── api/                  # Client HTTP
│   │   ├── components/           # Composants réutilisables
│   │   ├── contexts/             # AuthContext
│   │   ├── pages/                # Pages de l'application
│   │   ├── App.jsx               # Router principal
│   │   ├── main.jsx              # Point d'entrée React
│   │   └── index.css             # Styles globaux + Tailwind
│   ├── index.html
│   ├── vite.config.js
│   └── .env
└── README.md
```

## Licence

Projet open-source. Libre d'utilisation et de modification.
