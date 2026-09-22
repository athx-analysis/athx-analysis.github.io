// Rappel, saison par saison, de ce qui est demandé sur chaque épreuve ATHX -- pour que
// l'utilisateur de la page Simulation sache exactement à quoi correspond le chiffre qu'on lui
// demande d'entrer. Descriptions = paraphrase courte du format officiel (durée, déroulé),
// verifiee contre athxgames.com/workouts/2025 et /2026 (voir scripts/reference/workout_format_
// 2025.txt et _2026.txt pour le detail complet, source + recoupement CSV).
// Mouvements affiches sur la page = passes par Simulation.jsx (simulation_data.json,
// strength_movements[categorie]) -- PAS repetes ici en dur, pour eviter l'ecart categorie qui
// causait le bug "3RM Pull Up" affiche/redemande a tort pour la categorie ATHX en 2025 (ce
// mouvement n'existe que pour ATHX Pro cette saison-la -- cf description Force 2025 ci-dessous,
// volontairement generique sur les mouvements : la liste exacte vient du prop `movements`).
// Traduit en/fr (meme structure) pour le toggle de langue.
export const WORKOUT_REFERENCE = {
  fr: {
    2026: {
      sourceUrl: 'https://athxgames.com/workouts/2026',
      strength: {
        zone: 'Zone Force', duration: '20 min',
        description: "Trois mouvements de force pure, enchaînés sur des fenêtres de temps dédiées : 1RM Strict Press, puis 3RM Back Squat, puis 5RM Deadlift. Le score retenu est le poids total soulevé sur les 3 mouvements.",
      },
      endurance: {
        zone: 'Zone Endurance', duration: '30 min (cap 22 min)',
        description: "Format en alternance course/rameur : l'athlète bascule entre Run et Row à intervalles réguliers. Le score retenu est la distance totale parcourue sur les deux disciplines combinées.",
      },
      metcon: {
        zone: 'Zone MetCon X', duration: '25 min (cap 25 min)',
        description: "Circuit multi-stations (ski-erg, mouvement au-dessus de la tête, portage de sac, box jumps, fentes marchées, burpees) à enchaîner le plus vite possible. Le score retenu est le temps total pour terminer le circuit.",
      },
    },
    2025: {
      sourceUrl: 'https://athxgames.com/workouts/2025',
      strength: {
        zone: 'Zone Force', duration: '20 min',
        description: "Format différent de 2026, sur des fenêtres de temps dédiées par mouvement : 0-6 min de Back Squat (5RM), puis 6-12 min de Strict Press (10RM) -- et, pour la catégorie ATHX Pro uniquement, un 3ᵉ mouvement supplémentaire (voir ci-dessous). Le score retenu est le poids total soulevé sur l'ensemble des mouvements de la catégorie.",
      },
      endurance: {
        zone: 'Zone Endurance', duration: '30 min',
        description: "Deux blocs de 12 minutes chacun, Run puis Bike (avec une courte pause entre les deux). Le score retenu est la distance totale parcourue sur les deux disciplines combinées.",
      },
      metcon: {
        zone: 'Zone MetCon X', duration: '30 min (cap 25 min)',
        description: "Circuit multi-stations (rameur, thruster, box jump, burpee, sac de sable) à enchaîner le plus vite possible. Le score retenu est le temps total pour terminer le circuit.",
      },
    },
  },
  en: {
    2026: {
      sourceUrl: 'https://athxgames.com/workouts/2026',
      strength: {
        zone: 'Strength Zone', duration: '20 min',
        description: "Three pure strength movements, run back to back in dedicated time windows: 1RM Strict Press, then 3RM Back Squat, then 5RM Deadlift. The score kept is the total weight lifted across the 3 movements.",
      },
      endurance: {
        zone: 'Endurance Zone', duration: '30 min (22 min cap)',
        description: "Alternating run/row format: the athlete switches between Run and Row at regular intervals. The score kept is the total distance covered across both disciplines combined.",
      },
      metcon: {
        zone: 'MetCon X Zone', duration: '25 min (25 min cap)',
        description: "Multi-station circuit (ski erg, overhead movement, sled carry, box jumps, walking lunges, burpees) done as fast as possible. The score kept is the total time to finish the circuit.",
      },
    },
    2025: {
      sourceUrl: 'https://athxgames.com/workouts/2025',
      strength: {
        zone: 'Strength Zone', duration: '20 min',
        description: "A different format from 2026, in dedicated time windows per movement: 0-6 min of Back Squat (5RM), then 6-12 min of Strict Press (10RM) -- and, for the ATHX Pro category only, one extra movement (see below). The score kept is the total weight lifted across that category's movements.",
      },
      endurance: {
        zone: 'Endurance Zone', duration: '30 min',
        description: "Two 12-minute blocks, Run then Bike (with a short break in between). The score kept is the total distance covered across both disciplines combined.",
      },
      metcon: {
        zone: 'MetCon X Zone', duration: '30 min (25 min cap)',
        description: "Multi-station circuit (rower, thruster, box jump, burpee, sandbag) done as fast as possible. The score kept is the total time to finish the circuit.",
      },
    },
  },
}
