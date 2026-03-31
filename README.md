# 🌳 Généalogie de Famille

## 📝 Description

**Généalogie de Famille** est une application web interactive permettant de visualiser, d'explorer et de gérer des arbres généalogiques et des données familiales. Construite avec des technologies modernes, elle offre une expérience fluide, hautement interactive et sécurisée.

## ✨ Fonctionnalités Principales

- **Authentification Sécurisée** : Système de connexion robuste basé sur Supabase Auth.
- **Visualisation Avancée** : Affichage d'arbres généalogiques interactifs avec le support de bibliothèques puissantes telles que Nivo, react-d3-tree et VisX.
- **Mode Sombre / Clair** : Interface utilisateur réactive avec un support complet du mode sombre via TailwindCSS.
- **Performances & Accessibilité** : Optimisation continue évaluée avec Lighthouse et tests ax-core/pa11y.

## 🛠️ Technologies Utilisées

- **Framework** : [Next.js 16](https://nextjs.org/) (App Router & Server Components)
- **UI & Animations** : [React 19](https://react.dev/), [TailwindCSS 3.4](https://tailwindcss.com/), [Framer Motion](https://www.framer.com/motion/)
- **Base de données & Backend** : [Supabase](https://supabase.com/) (Auth, Storage, Database)
- **Visualisation de Données** : [Nivo](https://nivo.rocks/), [react-d3-tree](https://www.npmjs.com/package/react-d3-tree), [VisX](https://airbnb.io/visx/), [Chart.js](https://www.chartjs.org/)
- **Validation** : [Zod 4](https://zod.dev/)
- **Tests** : [Vitest](https://vitest.dev/), [Playwright](https://playwright.dev/)
- **Langage** : TypeScript 5.x

## 🚀 Démarrage Rapide

Commencez le serveur de développement localement :

```bash
npm run dev
# ou
yarn dev
# ou
pnpm dev
# ou
bun dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur pour voir le résultat.

## 🧪 Tests

Le projet utilise une infrastructure de tests complète pour s'assurer de sa fiabilité.

### Tests Unitaires & Intégration (Vitest)
```bash
# Lancer tous les tests en mode watch
npm test

# Lancer avec l'interface UI interactive
npm run test:ui

# Générer le rapport de couverture
npm run test:coverage
```

### Tests E2E (Playwright)
```bash
# Lancer tous les tests E2E
npm run test:e2e

# Lancer Playwright avec l'interface UI 
npm run test:e2e:ui
```

> **Note** : La couverture actuelle des tests (plus de 400 tests dans 80+ fichiers) inclut l'authentification sécurisée, les routes API, les hooks personnalisés et la conformité des composants. Pour une analyse complète, consultez le fichier `README_TESTS.md` ou la documentation.

## 📚 Documentation et Migration

La source fondamentale de documentation est située dans le dossier [`documentation/`](./documentation/).

- 📋 **Plan de Migration Base de Données (Supabase)** : `documentation/PLAN_MIGRATION_SUPABASE.md`
- 📖 **Guide de Migration Étape par Étape** : `documentation/MIGRATION_GUIDE.md`
- 🛠️ **Analyses des Technologies** : `documentation/DOCUMENTATION_TECHNOLOGIES.md`

## ⚠️ Notes Importantes

- **Next.js Fonts** : Le projet emploie `next/font` pour optimiser automatiquement le chargement de la famille de police Geist, gérée par Vercel.
- **ESLint** : À cause d'un bug identifié sur la version Next.js 16.0.7 concernant la hiérarchie `src/app`, la commande `npm run lint` échoue. Privilégiez l'intégration ESLint de votre IDE ou effectuez manuellement un check typographique avec le script `npm run scan-build`. Ceci n'impacte pas le build de production.

## 🚀 Déploiement

L'application est configurée pour être déposée nativement sur la [plateforme Vercel](https://vercel.com/new).
Référez-vous à la [documentation de déploiement Next.js](https://nextjs.org/docs/app/building-your-application/deploying) pour plus de détails.
