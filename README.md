# 🌳 HériTree — Plateforme de gestion généalogique

Application web complète de gestion d'arbres généalogiques avec 
visualisation ascendante/descendante, gestion des rôles et droits, 
et conservation d'objets historiques familiaux.

> 🚀 **En production** — 314 déploiements via Vercel CI/CD  
> 🧪 **84 fichiers de tests (~400 tests)** — Vitest + Playwright

---

## ✨ Fonctionnalités Principales

- **Arbres généalogiques interactifs** : Visualisation ascendante/descendante avec Nivo, react-d3-tree et VisX
- **Authentification sécurisée** : Système de connexion robuste basé sur Supabase Auth (bcrypt, CSRF)
- **Gestion des rôles et droits** (RBAC) — séparation stricte des accès
- **Conservation d'objets historiques familiaux** avec galerie
- **Back-office complet** avec monitoring et tableau de bord
- **Mode Sombre / Clair** : Support complet via TailwindCSS + Framer Motion
- **Performances & Accessibilité** : Optimisation Lighthouse, tests ax-core/pa11y
- Optimisation SEO (metadata, sitemap, structured data)

---

## 🛠️ Stack Technologique

| Catégorie | Technologies |
|-----------|-------------|
| **Framework** | Next.js 16 (App Router, SSR/SSG/ISR, Server Components) |
| **UI & Animations** | React 19, TailwindCSS 3.4, Framer Motion |
| **Base de données** | Supabase (Auth, Storage, Database) |
| **Visualisation** | Nivo, react-d3-tree, VisX, Chart.js |
| **Validation** | Zod 4 |
| **Tests** | Vitest, Playwright |
| **Langage** | TypeScript 5.x |
| **Déploiement** | Vercel (CI/CD automatique) |

---

## 🧪 Tests

Infrastructure de tests complète avec **Vitest** (unitaires/intégration) 
et **Playwright** (E2E).

### Tests unitaires / intégration

```bash
# Lancer tous les tests en mode watch
npm test

# Interface UI interactive
npm run test:ui

# Rapport de couverture
npm run test:coverage

# Mode one-shot (pour CI)
npm test -- --run
```

**Couverture actuelle** :
- ✅ **84 fichiers de tests (~400 tests)**
- ✅ Routes API (auth, categories, users, messages, persons, upload, csrf…)
- ✅ Hooks (auth, thème, généalogie, localStorage, CSRF, debounce…)
- ✅ Composants (formulaires, carrousels, thèmes, monitoring, modales…)
- ✅ Services / utilitaires (monitoring, sécurité, logger, Supabase…)

### Tests E2E (Playwright)

```bash
# Lancer tous les tests E2E
npm run test:e2e

# Interface UI Playwright
npm run test:e2e:ui

# Mode debug
npm run test:e2e:debug
```

**Scénarios couverts** :
- ✅ Authentification
- ✅ Navigation
- ✅ Workflows utilisateur complets

---

## 🚀 Démarrage Rapide

```bash
# 1. Cloner le repo
git clone https://github.com/li-rodolphetournier/heritree.com

# 2. Installer les dépendances
npm install

# 3. Configurer les variables d'environnement
cp .env.example .env.local
# Renseigner NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY

# 4. Lancer le serveur de développement
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000)

---

## 🗄️ Base de données

Le projet utilise **Supabase** (PostgreSQL) avec :
- Schéma complet : `supabase/schema.sql`
- Script de migration automatique : `scripts/migrate-to-supabase.ts`
- Clients serveur et client : `lib/supabase/`
- Row Level Security (RLS) activé

📋 Guide de migration complet : [MIGRATION_GUIDE.md](./documentation/MIGRATION_GUIDE.md)

---

## 📚 Documentation

Toute la documentation est disponible dans [`documentation/`](./documentation/) :

- [Technologies utilisées](./documentation/DOCUMENTATION_TECHNOLOGIES.md)
- [Tests complets](./documentation/TESTS_COMPLETS.md)
- [Plan de migration Supabase](./documentation/PLAN_MIGRATION_SUPABASE.md)
- [Plan de refactorisation](./documentation/PLAN_REFACTORISATION.md)

---

## 🔒 Sécurité

- Authentification via Supabase Auth
- Protection CSRF sur toutes les routes sensibles
- Hashage des mots de passe (bcrypt)
- Row Level Security (RLS) Supabase
- Validation des données avec Zod 4

---

## 🌐 Déploiement

Déployé sur **Vercel** avec CI/CD automatique à chaque push sur `main`.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)