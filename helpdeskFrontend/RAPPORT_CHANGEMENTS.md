# RAPPORT DES CHANGEMENTS — helpdeskFrontend

> Généré le : 10/08/2026
> Projet : HelpDesk Pro — Front-end React (Vite)

---

## 1. Bibliothèques Installées

| Bibliothèque       | Version   | Rôle                                           |
|--------------------|-----------|------------------------------------------------|
| `axios`            | ^1.x      | Client HTTP pour les appels à l'API Spring Boot |
| `react-router-dom` | ^6.x      | Routage côté client (SPA navigation)           |

Commande exécutée :
```bash
npm install axios react-router-dom
```

---

## 2. Arborescence des Nouveaux Fichiers Créés

```
helpdeskFrontend/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx          ← Barre de navigation principale (sticky, active links)
│   │   └── Navbar.css          ← Styles du composant Navbar
│   ├── pages/
│   │   ├── Dashboard.jsx       ← Page d'accueil : liste des tickets + stats + filtres
│   │   ├── Dashboard.css       ← Styles du Dashboard
│   │   ├── CreateTicket.jsx    ← Formulaire de création de ticket (POST /api/tickets)
│   │   ├── CreateTicket.css    ← Styles du formulaire
│   │   ├── Users.jsx           ← Liste des utilisateurs (GET/DELETE /api/users)
│   │   └── Users.css           ← Styles de la page Utilisateurs
│   └── services/
│       └── api.js              ← Instance Axios + fonctions CRUD (tickets, users, commentaires)
└── RAPPORT_CHANGEMENTS.md      ← Ce fichier
```

---

## 3. Modifications des Fichiers Existants

### `src/index.css` — **Entièrement réécrit**

- **Avant :** CSS par défaut généré par Vite (styles de démo, variables hors-sujet).
- **Après :** Système de design complet (dark theme) :
  - Variables CSS (`--bg`, `--surface`, `--primary`, `--text-primary`, etc.)
  - Reset CSS minimal
  - Police `Inter` via Google Fonts
  - Scrollbar personnalisée
  - Classes globales réutilisables : `.btn`, `.btn-primary`, `.btn-ghost`, `.app-layout`, `.app-main`

### `src/App.jsx` — **Entièrement réécrit**

- **Avant :** Composant de démo Vite (logos React/Vite, compteur, liens externes).
- **Après :** Application routée avec `BrowserRouter` :
  ```jsx
  <BrowserRouter>
    <Navbar />
    <Routes>
      <Route path="/"               element={<Dashboard />} />
      <Route path="/create-ticket"  element={<CreateTicket />} />
      <Route path="/users"          element={<Users />} />
    </Routes>
  </BrowserRouter>
  ```

### `index.html` — **Modifié**

| Propriété        | Avant                | Après                                                    |
|------------------|----------------------|----------------------------------------------------------|
| `lang`           | `en`                 | `fr`                                                     |
| `<title>`        | `helpdeskfrontend`   | `HelpDesk Pro`                                           |
| `<meta name="description">` | *(absent)* | `HelpDesk Pro – Gestion des tickets de support informatique interne` |

### `src/main.jsx` — **Non modifié**

Le point d'entrée React n'a pas nécessité de modification.

---

## 4. Description des Fonctionnalités Développées

### `src/services/api.js`

- Instance Axios avec `baseURL: 'http://localhost:8080/api'`
- Header `Content-Type: application/json` par défaut
- Exports nommés :
  - `getTickets()`, `createTicket(data)`, `deleteTicket(id)`
  - `getUsers()`, `createUser(data)`, `deleteUser(id)`
  - `getCommentaires()`, `createCommentaire(data)`, `deleteCommentaire(id)`

### `src/components/Navbar.jsx`

- Logo + badge "Pro" avec dégradé
- Liens de navigation avec `NavLink` (highlight actif automatique)
- Avatar utilisateur (initiales "AD" — Admin)
- Design sticky, z-index élevé, ombre subtile

### `src/pages/Dashboard.jsx`

- Récupération des tickets via `GET /api/tickets` au montage
- **4 cartes de statistiques** : Total, Ouverts, En Cours, Résolus
- **Barre de filtres** : recherche textuelle + filtre statut + filtre priorité
- **Tableau de tickets** avec badges colorés (priorité + statut)
- Suppression de ticket via `DELETE /api/tickets/:id` avec confirmation
- États gérés : chargement, erreur backend, liste vide
- Bouton "Actualiser"

### `src/pages/CreateTicket.jsx`

- Formulaire contrôlé avec les champs : `titre`, `description`, `priorite`, `statut`
- `createurId` forcé à `1` (côté frontend, transparent pour l'utilisateur)
- Soumission via `POST /api/tickets`
- Validation frontend : titre obligatoire
- Affichage d'une bannière de succès + redirection automatique vers le Dashboard après 1,5s
- Affichage des erreurs backend (`err.response?.data?.message`)

### `src/pages/Users.jsx`

- Récupération des utilisateurs via `GET /api/users`
- Affichage en grille de cartes avec avatars colorés (initiales)
- Suppression via `DELETE /api/users/:id`
- Gestion des états : chargement, erreur, liste vide

---

## 5. Architecture Générale

```
src/
├── services/    ← Couche de données (Axios, appels API)
├── components/  ← Composants réutilisables (Navbar, …)
└── pages/       ← Vues complètes montées par le routeur
```

Les pages consomment directement les fonctions de `services/api.js`.
Aucune gestion d'état global (Redux, Context) n'a été ajoutée pour cette version initiale — l'état est local à chaque page.

---

## 6. Lancer l'Application

```bash
# Depuis le dossier helpdeskFrontend/
npm run dev
```

L'application est accessible sur **http://localhost:5173**.  
Le backend Spring Boot doit tourner sur **http://localhost:8080**.
