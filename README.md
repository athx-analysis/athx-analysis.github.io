# ATHX Analysis

Site React (Vite) pour consulter les leaderboards ATHX Games, dans le style visuel du site
original [athxgames.com](https://athxgames.com) (logo vectoriel officiel, thème noir/blanc/rouge,
police Helvetica Neue).

## Lancer le site
Double-clique sur `ATHXAnalysis.command` (installe les dépendances si besoin, lance le serveur
et ouvre Safari sur `localhost:5173`).

Ou manuellement :
```bash
npm install
npm run dev
```

## Pages
- **Accueil** (`/`) : hero + accès direct aux 3 leaderboards.
- **About** (`/about`) : histoire et chiffres clés d'ATHX Games — croissance du nombre
  d'événements/pays/participants (graphiques + carte du monde interactifs) et comparatif face à
  HYROX. Voir "Données du site" ci-dessous : tous les chiffres sont calculés depuis les CSV
  scrapés, rien n'est codé en dur.
- **Header** : menu déroulant "Results" (comme sur le site original) listant les 3 types de
  leaderboards :
  - Individual Leaderboard (`/individual-leaderboards`)
  - Team Leaderboard (`/team-leaderboards`)
  - Team Individual Leaderboards (`/team-individual-leaderboards`)

Chaque page leaderboard propose les mêmes filtres que le site original (Année, Pays, Ville,
Catégorie, Division, Workout, recherche par nom) et affiche un classement paginé.

## Données
Les CSV scrapés (`../data_general/`, `../2026/`, `../2025/`) sont copiés tels quels dans
`public/data/` et chargés à la demande côté client (PapaParse), en fonction des filtres
Année/Pays/Ville choisis — exactement les fichiers produits par `scrape_leaderboards.py` et
`scrape_by_location.py` (voir le dossier parent `athx/`). Si ces scripts sont relancés avec de
nouvelles données, recopier `public/data/` :
```bash
cd ..
rm -rf site_athx/public/data
cp -R data_general 2026 2025 site_athx/public/data/
cd site_athx
python3 - <<'EOF'
# régénère src/data/manifest.json à partir de public/data/2026 et 2025
# (voir la génération initiale dans l'historique du projet)
EOF
```

⚠️ Rang et points affichés dépendent du niveau de filtrage (global / pays / ville) : le site
recalcule ces valeurs selon le sous-ensemble filtré (vérifié empiriquement sur le site source),
donc chaque niveau correspond à un fichier scrapé séparément — pas d'agrégation locale possible.

## Données du site (page About)
Contrairement aux CSV bruts (chargés à la demande depuis `public/data/`), les chiffres et
graphiques de la page **About** sont pré-calculés dans un seul fichier :
`src/data/site_stats.json` (généré par `scripts/generate_site_stats.py`, à relancer après chaque
scraping pour garder les stats à jour) :
```bash
cd site_athx
python3 scripts/generate_site_stats.py
```
Ce script lit `../data_general/team_leaderboard.csv` (+ `individual_leaderboard.csv` pour les
participants solo) et calcule : nombre d'événements/pays/participants par année, l'empreinte
géographique actuelle (pour la carte du monde, avec un fond de carte topojson dans
`public/geo/world-110m.json`), et le comparatif ATHX vs HYROX (les chiffres HYROX, externes, sont
curés à la main dans le script, avec leurs sources — cf. `HYROX_2025_26` en haut du fichier, à
mettre à jour si de nouveaux chiffres HYROX sont publiés).

Aucun chiffre n'est codé en dur dans les composants React (`About.jsx`, `TrendChart.jsx`,
`WorldMapFootprint.jsx`, `ComparisonBars.jsx`) : tout est lu depuis ce JSON, donc relancer le
script suffit à mettre le site à jour après un nouveau scraping.

## Stack
React 19 + Vite, react-router-dom (HashRouter, pas besoin de config serveur), papaparse,
recharts (graphiques), react-simple-maps + d3-geo (carte du monde interactive).
