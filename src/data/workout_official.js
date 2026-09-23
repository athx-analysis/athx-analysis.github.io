// Format OFFICIEL, verbatim, des epreuves ATHX -- scrape directement depuis le HTML brut de
// athxgames.com/workouts/2025, /2026 et /2027 (curl + extraction texte, PAS de resume/reecriture
// par un modele : chaque `lines` ci-dessous est copie mot pour mot depuis le site officiel,
// dans l'ordre exact d'affichage). Demande explicite : "le format demande a la lettre, pas de
// zones d'ombre" -- donc aucune paraphrase nulle part dans ce fichier, y compris les lignes
// "SCORE -", les fenetres de temps, les variantes LITE/ATHX/PRO et les poids H/F.
//
// Convention de lecture d'une `lines[]` (meme structure pour les 3 zones x 3 annees x 2 formats
// Pairs/Individual) :
//   - une ligne SANS prefixe "LITE -"/"ATHX -"/"PRO -" s'applique a TOUTES les categories
//   - une ligne AVEC un de ces prefixes est une variante/surcharge specifique a cette categorie
//     (a mettre en avant quand l'utilisateur a choisi cette categorie, jamais a cacher)
//   - une ligne contenant "M: X / F: Y" (ou "M X / F Y" en 2025, sans ":") donne les deux poids
//     Homme/Femme cote a cote -- a mettre en avant selon le genre choisi, jamais a retirer l'autre
//   - une ligne commencant par "SCORE" est la regle de score de la zone
// Le rendu (WorkoutFormatCard.jsx) applique ces conventions par simple mise en valeur visuelle
// (gras/estompe), sans jamais retirer ni reformuler un mot du texte source.
export const OFFICIAL_WORKOUTS = {
  2025: {
    sourceUrl: 'https://athxgames.com/workouts/2025',
    zones: {
      strength: {
        number: 'Zone 2.0', title: 'Strength Zone', duration: '20 minutes',
        pairs: {
          lines: [
            '0-8 MINS', 'BACK SQUAT', '5 REP MAX',
            '8-16 MINS', 'STRICT PRESS', '10 REP MAX',
            'SCORE - COMBINED WEIGHT OF MAX LIFTS',
          ],
        },
        individual: {
          // "PRO+ -" (additif, jamais un variant de "10 REP MAX" juste au-dessus) : la page
          // officielle /workouts/2025 ne mentionne aucune difference ATHX/ATHX Pro, mais les
          // vrais resultats scrapes (data_general/individual_leaderboard.csv, colonne
          // "3RM Pull Up") confirment qu'un 3e mouvement existe reellement pour ATHX Pro
          // uniquement -- voir scripts/reference/workout_format_2025.txt et le fix de
          // generate_simulation_data.py (bug "3RM Pull Up" du meme nom, deja corrige cote
          // Simulation). Aucune fenetre de temps precise n'est publiee nulle part pour ce
          // mouvement : on ne l'invente pas, seule la nature du mouvement est indiquee.
          lines: [
            '0-6MIN', 'BACK SQUAT', '5 REP MAX',
            '6-12 MINS', 'STRICT PRESS', '10 REP MAX',
            'PRO+ - 3RM PULL UP (BODYWEIGHT + ADDED LOAD)',
            'SCORE - COMBINED WEIGHT OF MAX LIFTS',
          ],
        },
      },
      endurance: {
        number: 'Zone 4.0', title: 'Endurance Zone', duration: '30 minutes',
        pairs: {
          lines: [
            'A. 12MIN MAX DISTANCE RUN', 'B. 12MIN MAX DISTANCE BIKE',
            'ONE PERSON STARTS ON A AND THE OTHER STARTS ON B. AT 12MINS THEY SWITCH',
            'SCORE - TOTAL DISTANCE COVERED BY PAIR',
          ],
        },
        individual: {
          lines: [
            '12MIN MAX DISTANCE RUN', '2 MINS REST', '12MIN MAX DISTANCE BIKE',
            'SCORE - TOTAL DISTANCE COVERED',
          ],
        },
      },
      metconx: {
        number: 'Zone 6.0', title: 'METCON X Zone', duration: '30 minutes',
        pairs: {
          lines: [
            '50 CALORIE ROW',
            'X40 DUAL DB THRUSTER (M 20KG / F 12.5KG)',
            'X30 BOX JUMP OVER (M 24" / F 20")',
            'X20 SYNCRO BURPEES',
            'X10 SANDBAG GROUND TO SHOULDER (M 40KG / F 30KG)',
            'X20 SYNCRO BURPEES',
            'X30 BOX JUMP OVER (M 24" / F 20")',
            'X40 DUAL DB THRUSTER (M 20KG / F 12.5KG)',
            '50 CALORIE ROW',
            'TIME CAP: 25MINS',
            'SCORE - TIME TO COMPLETE',
          ],
        },
        individual: {
          lines: [
            '25 CALORIE ROW',
            'X20 DUAL DB THRUSTER (M 20KG / F 12.5KG)',
            'X15 BOX JUMP OVER (M 24" / F 20")',
            'X10 BURPEES',
            'X5 SANDBAG GROUND TO SHOULDER (M 40KG / F 30KG)',
            'X10 BURPEES',
            'X15 BOX JUMP OVER (M 24" / F 20")',
            'X20 DUAL DB THRUSTER (M 20KG / F 12.5KG)',
            '25 CALORIE ROW',
            'TIME CAP: 25MINS',
            'SCORE - TIME TO COMPLETE',
          ],
        },
      },
    },
  },

  2026: {
    sourceUrl: 'https://athxgames.com/workouts/2026',
    zones: {
      strength: {
        title: 'Strength', duration: '20 minutes',
        pairs: {
          lines: [
            '0-6MIN', '1RM STRICT PRESS',
            '6-12MIN', '3RM BACK SQUAT',
            '12-20MIN', '5RM DEADLIFT',
            'SCORE - TOTAL WEIGHT LIFTED BY PAIR',
          ],
        },
        individual: {
          lines: [
            '0-6MIN', '1RM STRICT PRESS',
            '6-12MIN', '3RM BACK SQUAT',
            '12-20MIN', '5RM DEADLIFT',
            'SCORE - TOTAL WEIGHT LIFTED BY INDIVIDUAL',
          ],
        },
      },
      endurance: {
        title: 'Endurance', duration: '30 minutes',
        pairs: {
          lines: [
            'A. RUN', 'B. ROW', '22 MIN TIME CAP',
            'ATHLETE A STARTS ON RUN - ATHLETE B STARTS ON ROW',
            'Swap Every Time Athlete Completes',
            'LITE - 500M RUN', 'ATHX - 750M RUN', 'PRO - 1K RUN',
            'SCORE - TOTAL DISTANCE COVERED BY PAIR',
          ],
        },
        individual: {
          lines: [
            'A. RUN', 'B. ROW', '22 MIN TIME CAP',
            'Athlete Starts On Run',
            'ATHX - SWAP EVERY 750M RUN/ROW COMPLETED',
            'PRO - SWAP EVERY 1K RUN/ROW COMPLETED',
            'SCORE - TOTAL DISTANCE COVERED BY INDIVIDUAL',
          ],
        },
      },
      metconx: {
        title: 'MetCon X', duration: '25 minutes',
        pairs: {
          lines: [
            '60 CAL SKI-ERG',
            '60 SINGLE ARM ALT GROUND TO OVERHEAD - M: 20KG / F: 12.5KG',
            'LITE - 30 SINGLE ARM GTOH - M: 15KG / F: 7.5KG',
            'PRO - 60 DUAL GTOH - M: 22.5KG / F: 15KG',
            '60M SANDBAG CARRY - M: 50KG / F: 30KG',
            'LITE - M: 40KG / F: 20KG',
            'PRO - M: 70KG / F: 40KG',
            '60 BOX JUMP OVERS - M: 24" / F: 20"',
            'LITE - 30 BOX STEP OVERS',
            'PRO - 60x M: 30" / F: 24"',
            '60M DUAL DB WALKING LUNGES - M: 20KG / F: 12.5KG',
            'LITE - BODYWEIGHT',
            'PRO - DUAL FRONT RACK M: 22.5KG / F: 15KG',
            '60M BURPEE BROAD JUMPS',
            '60 CAL SKI-ERG',
            '25 MIN TIME CAP',
            'SCORE - TIME TO COMPLETE',
          ],
          // Notes officielles rattachees au mouvement concerne (pas un bloc de texte generique) :
          // `match` = sous-chaine(s) cherchees dans la ligne AFFICHEE (verifie mot pour mot,
          // survit aux variantes LITE/ATHX/PRO puisque les noms de mouvement ne sont jamais
          // reformules -- seuls les poids/reps changent). Affichee au survol d'un petit "i" a
          // cote du mouvement concerne plutot qu'en texte permanent sous la carte.
          lineNotes: [
            {
              match: ['SANDBAG CARRY'],
              note: {
                fr: 'Répétitions réparties comme la paire le souhaite pour les autres mouvements, mais toujours 30m/30m pour le Sandbag Carry. Poids Homme/Femme prescrits utilisés normalement, même en paire mixte.',
                en: 'Reps split between the pair as desired for the other movements, but always 30m/30m for the Sandbag Carry. Prescribed Male/Female weights used as normal, even in Mixed Pairs.',
              },
            },
            {
              match: ['BOX JUMP'],
              note: {
                fr: 'En paire mixte : hauteur de box Femme utilisée.',
                en: "Mixed Pairs: female box height used.",
              },
            },
            {
              match: ['WALKING LUNGES'],
              note: {
                fr: 'En paire mixte : haltères au poids Femme utilisés.',
                en: 'Mixed Pairs: female DB weight used.',
              },
            },
            {
              match: ['GROUND TO OVERHEAD', 'GTOH'],
              note: {
                fr: 'Poids Homme/Femme prescrits utilisés normalement, même en paire mixte.',
                en: 'Prescribed Male/Female weights used as normal, even in Mixed Pairs.',
              },
            },
          ],
        },
        individual: {
          lines: [
            'SKI-ERG - M: 45CAL / F: 30CAL',
            '30 SINGLE ARM ALT GROUND TO OVERHEAD - M: 20KG / F: 12.5KG',
            'PRO - 30 DUAL GTOH - M: 22.5KG / F: 15KG',
            '30M SANDBAG CARRY - M: 50KG / F: 30KG',
            'PRO - M: 70KG / F: 40KG',
            '30 BOX JUMP OVERS - M: 24" / F: 20"',
            'PRO - M: 30" / F: 24"',
            '30M DUAL DB WALKING LUNGES - M: 20KG / F: 12.5KG',
            'PRO - DUAL FRONT RACK M: 22.5KG / F: 15KG',
            '30M BURPEE BROAD JUMPS',
            'SKI-ERG - M: 45CAL / F: 30CAL',
            '25 MIN TIME CAP',
            'SCORE - TIME TO COMPLETE',
          ],
        },
      },
    },
  },

  2027: {
    sourceUrl: 'https://athxgames.com/workouts/2027',
    zones: {
      strength: {
        title: 'Strength', duration: '20 minutes',
        pairs: {
          lines: [
            '0-5 MIN', '1RM SHOULDER TO OVERHEAD',
            '5-10 MIN', '2RM BACK SQUAT',
            '10-20 MIN', '3RM DEADLIFT',
            '10-12 MIN - ATHLETE A - WARM UP',
            'AT 12 MIN',
            'ATHLETE A - LIFT 1', '1 MIN REST', 'ATHLETE A - LIFT 2',
            '2 MIN WARM UP FOR ATHLETE B',
            'ATHLETE B - LIFT 1', '1 MIN REST', 'ATHLETE B - LIFT 2',
            'EACH ATHLETE HAS 2 x 1 MIN WINDOWS TO ACHIEVE A 3RM',
            'COMPLETE AS 3 CONTINUOUS REPS OR 3 SINGLES WITHIN 1 MINUTE',
            'DEADLIFT SCORE - AVERAGE OF EACH ATHLETES 2 LIFTS',
            'SCORE - SUM OF ALL THREE COMPONENTS',
          ],
        },
        individual: {
          lines: [
            '0-5 MIN', '1RM SHOULDER TO OVERHEAD',
            '5-10 MIN', '2RM BACK SQUAT',
            '10-15 MIN', '3RM DEADLIFT',
            '10-12 MIN - WARM UP',
            'AT 12 MIN',
            '1 MIN TO COMPLETE 3RM', '1 MIN REST', '1 MIN TO COMPLETE 3RM',
            'ATHLETE HAS 2 x 1 MIN WINDOWS TO ACHIEVE A 3RM',
            'COMPLETE AS 3 CONTINUOUS REPS OR 3 SINGLES WITHIN 1 MINUTE',
            'DEADLIFT SCORE - AVERAGE OF 2 LIFTS',
            'SCORE - SUM OF ALL THREE COMPONENTS',
          ],
        },
      },
      endurance: {
        title: 'Endurance', duration: '24 minutes',
        pairs: {
          lines: [
            '24 MIN TIME CAP',
            'SET DISTANCE RUN',
            'LITE - 2.4KM', 'ATHX - 3KM', 'PRO - 3KM',
            'BOTH ATHLETES START THE SET DISTANCE RUN AT THE SAME TIME',
            'MAX DISTANCE SKI',
            'THE FIRST ATHLETE IN A PAIRS TEAM CAN BEGIN SKIING AS SOON AS THEY COMPLETE THE RUN',
            'SCORE - TOTAL DISTANCE ACHIEVED ON SKI-ERG',
          ],
        },
        individual: {
          lines: [
            '24 MIN TIME CAP',
            'SET DISTANCE RUN',
            'ATHX - 3KM', 'PRO - 3KM',
            'MAX DISTANCE SKI',
            'SCORE - TOTAL DISTANCE ACHIEVED ON SKI-ERG',
          ],
        },
      },
      metconx: {
        title: 'MetCon X', duration: '25 minutes',
        pairs: {
          lines: [
            'CAL ROW - M: 60 / F: 45 / MIX: 60',
            'LITE - M: 40 / F: 30 / MIX: 40',
            'PRO - M: 60 / F: 45 / MIX: 60',
            '45 DB GROUND TO OVERHEAD - M: 20KG / F: 12.5KG',
            'LITE - 30 GTOH - M: 15KG / F: 7.5KG',
            'PRO - 45 DUAL GTOH - M: 22.5KG / F: 15KG',
            '60 DB BENCH PRESS - M: 20KG / F: 12.5KG',
            'LITE - 30 x M: 15KG / F: 7.5KG',
            'PRO - 60 x M: 22.5KG / F: 15KG',
            '45 SANDBAG SQUATS - M: 50KG / F: 30KG',
            'LITE - 30 x M: 30KG / F: 20KG',
            'PRO - 45 x M: 70KG / F: 50KG',
            '60M SANDBAG CARRY - M: 50KG / F: 30KG',
            'LITE - M: 30KG / F: 20KG',
            'PRO - M: 70KG / F: 50KG',
            '45 BURPEES OVER SOFT BENCH',
            'LITE - 30 BURPEES OVER SOFT BENCH',
            'CAL ROW - M: 60 / F: 45 / MIX: 60',
            'LITE - M: 40 / F: 30 / MIX: 40',
            'PRO - M: 60 / F: 45 / MIX: 60',
            '25 MIN TIME CAP',
            'SCORE - TIME TAKEN TO COMPLETE THE WORKOUT',
          ],
        },
        individual: {
          lines: [
            'CAL ROW - M: 45 / F: 35',
            '30 DB GROUND TO OVERHEAD - M: 20KG / F: 12.5KG',
            'PRO - 30 DUAL GTOH - M: 22.5KG / F: 15KG',
            '30 DB BENCH PRESS - M: 20KG / F: 12.5KG',
            'PRO - 30 x M: 22.5KG / F: 15KG',
            '30 SANDBAG SQUATS - M: 50KG / F: 30KG',
            'PRO - 30 x M: 70KG / F: 50KG',
            '30M SANDBAG CARRY - M: 50KG / F: 30KG',
            'PRO - M: 70KG / F: 50KG',
            '30 BURPEES OVER SOFT BENCH',
            'CAL ROW - M: 45 / F: 35',
            '25 MIN TIME CAP',
            'SCORE - TIME TAKEN TO COMPLETE THE WORKOUT',
          ],
        },
      },
    },
  },
}

export const OFFICIAL_YEARS = [2025, 2026, 2027]

// Traduction FR des lignes INSTRUCTIVES/de score (phrases en anglais courant, pas de la
// terminologie de mouvement) -- demande explicite de l'utilisateur ("SWAP EVERY 750M RUN/ROW
// COMPLETED" doit s'afficher en francais en mode FR). Les noms de mouvements (STRICT PRESS,
// BACK SQUAT, GTOH...) et les chiffres/unites (KG, MIN, M, KM...) restent volontairement en
// anglais partout (terminologie internationale du sport, cf. Simulation/Home) -- seules les
// phrases d'explication du deroule et les lignes "SCORE -" sont traduites ici. Cle = ligne
// EXACTE telle qu'affichee (apres retrait du prefixe LITE-/ATHX-/PRO- et apres reduction du
// genre a la valeur choisie) ; absente de cette table = affichee telle quelle (fallback sur).
export const WORKOUT_LINE_FR = {
  'A. RUN': 'A. COURSE',
  'B. ROW': 'B. RAMEUR',
  'A. 12MIN MAX DISTANCE RUN': 'A. COURSE, DISTANCE MAX EN 12MIN',
  'B. 12MIN MAX DISTANCE BIKE': 'B. VÉLO, DISTANCE MAX EN 12MIN',
  '12MIN MAX DISTANCE RUN': 'COURSE, DISTANCE MAX EN 12MIN',
  '2 MINS REST': '2MIN DE REPOS',
  '12MIN MAX DISTANCE BIKE': 'VÉLO, DISTANCE MAX EN 12MIN',
  'ONE PERSON STARTS ON A AND THE OTHER STARTS ON B. AT 12MINS THEY SWITCH':
    "UN ATHLÈTE COMMENCE SUR A, L'AUTRE SUR B. À 12MIN, ILS ÉCHANGENT",
  'ATHLETE A STARTS ON RUN - ATHLETE B STARTS ON ROW': 'ATHLÈTE A COMMENCE SUR LA COURSE - ATHLÈTE B SUR LE RAMEUR',
  'Swap Every Time Athlete Completes': "Changement à chaque fois qu'un athlète termine",
  'Athlete Starts On Run': "L'athlète commence sur la course",
  'SWAP EVERY 750M RUN/ROW COMPLETED': 'CHANGEMENT TOUS LES 750M COURSE/RAMEUR TERMINÉS',
  'SWAP EVERY 1K RUN/ROW COMPLETED': 'CHANGEMENT TOUS LES 1KM COURSE/RAMEUR TERMINÉS',
  'AT 12 MIN': 'À 12 MIN',
  'ATHLETE A - LIFT 1': 'ATHLÈTE A - LEVÉE 1',
  'ATHLETE A - LIFT 2': 'ATHLÈTE A - LEVÉE 2',
  'ATHLETE B - LIFT 1': 'ATHLÈTE B - LEVÉE 1',
  'ATHLETE B - LIFT 2': 'ATHLÈTE B - LEVÉE 2',
  '1 MIN REST': '1 MIN DE REPOS',
  '2 MIN WARM UP FOR ATHLETE B': "2 MIN D'ÉCHAUFFEMENT POUR L'ATHLÈTE B",
  'EACH ATHLETE HAS 2 x 1 MIN WINDOWS TO ACHIEVE A 3RM': 'CHAQUE ATHLÈTE A 2 FENÊTRES DE 1 MIN POUR RÉALISER UN 3RM',
  'COMPLETE AS 3 CONTINUOUS REPS OR 3 SINGLES WITHIN 1 MINUTE':
    'À RÉALISER EN 3 RÉPÉTITIONS ENCHAÎNÉES OU 3 RÉPÉTITIONS UNIQUES EN 1 MINUTE',
  '10-12 MIN - ATHLETE A - WARM UP': '10-12 MIN - ATHLÈTE A - ÉCHAUFFEMENT',
  '10-12 MIN - WARM UP': '10-12 MIN - ÉCHAUFFEMENT',
  '1 MIN TO COMPLETE 3RM': '1 MIN POUR RÉALISER LE 3RM',
  'ATHLETE HAS 2 x 1 MIN WINDOWS TO ACHIEVE A 3RM': "L'ATHLÈTE A 2 FENÊTRES DE 1 MIN POUR RÉALISER UN 3RM",
  'SET DISTANCE RUN': 'COURSE À DISTANCE FIXE',
  'BOTH ATHLETES START THE SET DISTANCE RUN AT THE SAME TIME':
    'LES DEUX ATHLÈTES DÉMARRENT LA COURSE À DISTANCE FIXE EN MÊME TEMPS',
  'MAX DISTANCE SKI': 'SKI-ERG, DISTANCE MAX',
  'THE FIRST ATHLETE IN A PAIRS TEAM CAN BEGIN SKIING AS SOON AS THEY COMPLETE THE RUN':
    'LE PREMIER ATHLÈTE DE LA PAIRE PEUT COMMENCER LE SKI-ERG DÈS QU\'IL TERMINE SA COURSE',
  'TIME CAP: 25MINS': 'TEMPS LIMITE : 25MIN',
  '3RM PULL UP (BODYWEIGHT + ADDED LOAD)': '3RM TRACTION LESTÉE (POIDS DE CORPS + LEST AJOUTÉ)',
  'SCORE - COMBINED WEIGHT OF MAX LIFTS': 'SCORE - POIDS COMBINÉ DES CHARGES MAX',
  'SCORE - TOTAL DISTANCE COVERED BY PAIR': 'SCORE - DISTANCE TOTALE PARCOURUE PAR LA PAIRE',
  'SCORE - TOTAL DISTANCE COVERED': 'SCORE - DISTANCE TOTALE PARCOURUE',
  'SCORE - TIME TO COMPLETE': 'SCORE - TEMPS POUR TERMINER',
  'SCORE - TOTAL WEIGHT LIFTED BY PAIR': 'SCORE - POIDS TOTAL SOULEVÉ PAR LA PAIRE',
  'SCORE - TOTAL WEIGHT LIFTED BY INDIVIDUAL': 'SCORE - POIDS TOTAL SOULEVÉ',
  'SCORE - TOTAL DISTANCE COVERED BY INDIVIDUAL': 'SCORE - DISTANCE TOTALE PARCOURUE',
  'SCORE - SUM OF ALL THREE COMPONENTS': 'SCORE - SOMME DES TROIS COMPOSANTES',
  'DEADLIFT SCORE - AVERAGE OF EACH ATHLETES 2 LIFTS': 'SCORE DEADLIFT - MOYENNE DES 2 LEVÉES DE CHAQUE ATHLÈTE',
  'DEADLIFT SCORE - AVERAGE OF 2 LIFTS': 'SCORE DEADLIFT - MOYENNE DES 2 LEVÉES',
  'SCORE - TOTAL DISTANCE ACHIEVED ON SKI-ERG': 'SCORE - DISTANCE TOTALE RÉALISÉE AU SKI-ERG',
  'SCORE - TIME TAKEN TO COMPLETE THE WORKOUT': 'SCORE - TEMPS POUR TERMINER LE WORKOUT',
  'Reps split between the pair as desired apart from Sandbag Carry that will be split 30m/30m':
    "Répétitions réparties comme la paire le souhaite, sauf le Sandbag Carry, réparti 30m/30m",
  'Mixed Pairs use female box height for BJO and Female DBs for Lunges. DB GTOH & Sandbag Carry use the prescribed M & F weights.':
    'Les paires mixtes utilisent la hauteur de box Femme pour les BJO et les haltères Femme pour les Lunges. DB GTOH et Sandbag Carry utilisent les poids H/F prescrits.',
}
