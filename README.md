# ATHX Analysis

Site React (Vite) d'analyse des résultats ATHX Games, dans le style visuel du site officiel
[athxgames.com](https://athxgames.com) (logo vectoriel officiel, thème noir/blanc/rouge, police
Helvetica Neue). Disponible en français (par défaut) et en anglais.

**En ligne :** https://athx-analysis.github.io/

## Lancer le site en local
Double-clique sur `ATHXAnalysis.command` (installe les dépendances si besoin, lance le serveur
et ouvre Safari sur `localhost:5173`).

Ou manuellement :
```bash
npm install
npm run dev
```

Build de production :
```bash
npm run build   # génère dist/
npm run preview # sert dist/ en local pour vérifier le build
```

## Pages
- **Accueil** (`/`) : chiffres clés de la croissance ATHX (participants, événements, pays),
  comparatif face à HYROX.
- **Analyses** (`/analyses`) : 6 questions statistiques sur la saison (profils d'athlètes,
  transfert entre épreuves, évolution en cours de saison, écarts par ville, seuils de
  performance...), graphiques calculés depuis les données réelles.
- **Simulation** (`/simulation`) : l'utilisateur entre ses performances et voit le classement
  exact qu'il aurait obtenu, saison par saison, division par division, catégorie par catégorie
  (ATHX / ATHX Pro), face aux vrais résultats.
- **Résultats** (menu déroulant dans le header) : 3 leaderboards bruts, avec les mêmes filtres
  que le site original (Année, Pays, Ville, Catégorie, Division, Workout, recherche par nom) :
  - Individual Leaderboard (`/individual-leaderboards`)
  - Team Leaderboard (`/team-leaderboards`)
  - Team Individual Leaderboards (`/team-individual-leaderboards`)
- Pages légales (`/contact`, `/privacy-policy`, `/terms`, `/cookie-policy`, `/legal-notice`).

## Données
Ce dossier contient uniquement ce qui est nécessaire pour **faire tourner** le site :
- `src/data/*.json` : données déjà calculées/agrégées (analyses, simulation, stats du site),
  consommées directement par les pages React -- rien n'est codé en dur dans les composants.
- `public/data/` : CSV bruts des leaderboards (chargés à la demande côté client via PapaParse
  sur les pages Résultats).

Le **pipeline de génération** de ces fichiers (scraping, notebooks d'exploration, scripts
`generate_*.py`) vit dans le dépôt de travail séparé (pas inclus ici, pour garder ce dossier
propre et minimal). Pour mettre à jour les données après une nouvelle saison/un nouveau scraping,
relancer les scripts dans ce dépôt de travail puis recopier leurs sorties
(`src/data/*.json`, `public/data/`) ici.

## Déploiement (GitHub Pages)
Le push sur `main` déclenche automatiquement `.github/workflows/deploy.yml` : build Vite
(`npm ci && npm run build`) puis publication du dossier `dist/` sur GitHub Pages. Rien à faire
manuellement après un `git push` -- voir l'onglet **Actions** du repo pour suivre le déploiement.

## Stack
React 19 + Vite, react-router-dom (`HashRouter`, pas besoin de config serveur pour les routes),
recharts (graphiques), react-simple-maps + d3-geo (carte du monde), papaparse (CSV bruts).
