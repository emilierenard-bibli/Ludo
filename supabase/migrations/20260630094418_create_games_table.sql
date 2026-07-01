/*
# Create games table for ludothèque catalog

1. New Tables
- `games` - stores all board games in the ludothèque catalog
- `id` (uuid, primary key)
- `name` (text, not null) - game name
- `autonomy` (text) - "100" for full autonomy, "0" for no autonomy
- `age` (integer) - minimum age
- `players` (text) - player count (e.g., "2-4 joueurs")
- `duration` (text) - game duration
- `adapte` (boolean) - whether the game is adapted
- `content` (text) - contents of the game box
- `copies` (integer, default 1) - number of copies available
- `created_at` (timestamp)

2. Security
- Enable RLS on `games`.
- Allow anon + authenticated to read (public catalog).
- Allow anon + authenticated to insert/update/delete (shared admin mode, password protected via frontend).

3. Initial Data
- Inserts all 136 games from the Canva catalog.
*/

CREATE TABLE IF NOT EXISTS games (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  autonomy text NOT NULL DEFAULT '100',
  age integer DEFAULT 0,
  players text DEFAULT '',
  duration text DEFAULT '',
  adapte boolean DEFAULT false,
  content text DEFAULT '',
  copies integer NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE games ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_games" ON games;
CREATE POLICY "anon_select_games" ON games FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_games" ON games;
CREATE POLICY "anon_insert_games" ON games FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_games" ON games;
CREATE POLICY "anon_update_games" ON games FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_games" ON games;
CREATE POLICY "anon_delete_games" ON games FOR DELETE
  TO anon, authenticated USING (true);

-- Insert all games from the Canva catalog
INSERT INTO games (name, autonomy, age, players, duration, adapte, content, copies) VALUES
('1000 bornes – adapté', '100', 6, '', '', true, '110 cartes | 1 sabot à cartes', 2),
('Halli Galli', '0', 6, '2-6 joueurs', '15 minutes', false, '55 cartes | 1 sonnette', 4),
('Le petit Lynx', '0', 2, '', '', false, '36 images + 36 images en rectangle | 1 boite hexagonale', 2),
('Corsaro', '100', 5, '2-4 joueurs', '30 minutes', false, '1 règle du jeu | 1 drapeau | 1 plateau de jeu | 12 bateaux – 3 bateaux pirates | 2 dés | 20 cartes', 2),
('Un Géant Rustre', '100', 6, '2-4 joueurs', '30 minutes', false, '1 plan de jeu | 1 dé spécial + 1 dé adapté | 1 géant | 12 pions nains (3 par couleurs) | 5 brioches | 7 buissons', 2),
('Puissance 4', '100', 6, '2 joueurs', '10 minutes', false, '1 plateau de jeu | 2 * 21 pions (rouges et jaunes)', 5),
('Bouteille Party', '0', 8, '', '', false, '1 bouteille | 1 capsule | 1 disque rouge + des disque en bois', 2),
('Quatre en ligne en bois', '100', 6, '2 joueurs', '10 minutes', false, '1 plateau de jeu en bois | 2 * 21 pions (rouges et blancs)', 1),
('Capitaines en herbe - adapté', '100', 4, '2-4 joueurs', '15 minutes', true, '1 plateau de jeu articulé | 4 voiliers en bois | 24 pions (4 de chaque couleurs) + 2 noires | 1 ancre | 4 cartes bateaux | 1 sac de pioche', 2),
('Coco Crazy', '100', 7, '2-8 joueurs', '20 minutes', false, '1 plateau de jeu | 6 noix de cocos | 36 singes (6 couleurs) | 1 dé + 1 dé adapté | 1 règle en audio', 2),
('Le mot le plus long', '100', 8, '', '', false, '112 lettres (40 voyelles et 72 consonnes) | 1 sablier', 2),
('UNO - adapté', '100', 7, '2-10 joueurs', '20 minutes', true, '1 règle audio (sur cd) | 106 cartes', 2),
('Jeu de l''oie adapté', '100', 4, '', '', true, '1 plateau tactile | 2 fardes actions', 2),
('Le chaipas de Liège', '0', 8, '4+ joueurs', '20 minutes', false, '256 cartes', 4),
('Crack List', '0', 10, '', '', false, '80 cartes bleues | 80 cartes rouges', 2),
('Le Poker des cafards', '100', 8, '', '', false, '64 cartes bestioles | 1 règles du jeu | 1 aide de jeu tactile et braille', 2),
('Blokus', '0', 8, '2-4 joueurs', '30 minutes', false, '1 plateau de jeu | 84 pièces (21 X 4 couleurs)', 2),
('Génial', '0', 10, '', '', false, '1 plateau de jeu | 120 tuiles | 1 sac | 4 chevalets | 4 feuilles de score | 24 pions', 2),
('Tic Tac Troll', '100', 7, '', '', false, '1 plateau de jeu | 12 pions de 4 couleurs | 2 dés + 2 dés brailles | 13 tonneaux contenant chacun de 1 à 13 pierres | 5 pierres en plus pour réserve | 1 règle du jeu', 2),
('Topminos', '100', 6, '', '', false, '1 plateau carré | 4 chevalets | 56 plaquettes avec pas pastilles | 1 sac pour tirage | 1 petit accessoire en bois pour vérifier l''absence de pastille sur toute la hauteur de la pile', 2),
('Pentago', '0', 8, '', '', false, '1 plateau carré avec 4 emplacements | 4 mini-plateau en bois avec 9 cavités chacune | 18 billes blanches | 18 billes noires', 2),
('Triominos', '0', 6, '', '', false, '4 chevalets | 56 triominos', 2),
('Times Up !', '100', 12, '', '', false, '219 cartes de jeu en noir | 230 cartes en braille | 1 sac | 1 sablier | 1 bloc pour les scores | 1 livret biographies', 2),
('Pyraos', '0', 8, '', '', false, '1 plateau carré en bois | 15 billes en bois clair | 15 billes en bois foncé', 2),
('Mikado des pions', '0', 4, '', '', false, '1 plateau en bois avec ressort | 18 pions rouges | 17 pions bleus | 18 pions jaunes', 2),
('Neurodyssée', '0', 12, '', '', false, '180 cartes', 2),
('Katamino junior', '100', 3, '1-2 joueurs', '15 minutes', false, '1 plateau | 10 pentaminos | 5 petites pièces rouges | 3 petites pièces marron | 1 réglette', 2),
('Le mur/ Die Mauer', '100', 8, '', '', false, '6 sets de 7 éléments de mur | 1 pierre d''architecte orange | 1 sac en lin', 2),
('Vampires croqueurs d''ail', '0', 5, '2-4 joueurs', '20 minutes', false, '1 plateau | 4 vampires | 4 dés | 4 passeports vampires | 9 cartes gousse d''ail | 3 cartes tomate', 2),
('Scrabble (GC)', '100', 10, '', '', false, '1 plateau | 4 réglettes | 100 lettres plus 2 jokers', 4),
('Stratego', '100', 8, '2 joueurs', '45 minutes', false, '1 plateau | 2x 40 pions (pions bleus tactiles, pions rouges pas) | 2 cassettes audio de règles | 1 règle en braille | 2 règles en grands caractères | 1 aide-mémoire en grands caractères | 1 écran en carton', 2),
('Quarto', '100', 8, '', '', false, '1 plateau | 8 pièces blanches | 7 pièces noires', 2),
('Lama : le jeu de dés', '100', 8, '', '', false, '3 dés lama | 3 dés adaptés tactiles | 43 cartes adaptées (7 lamas + 6 cartes de chaque valeur de 1 à 6) | 73 jetons points (20 rouges + 53 blancs)', 2),
('Food Truck', '100', 8, '', '', false, '65 cartes Plat | 25 cartes Compagnie | 9 jetons de Victoire | 1 règle du jeu | 1 carte NFC', 2),
('Kéblo adapté', '100', 8, '', '', true, '20 cartes chiffre | 14 cartes action | 19 bouchons (= vies)', 2),
('Mafia de Cuba', '100', 10, '', '', false, '1 règle du jeu | 14 diamants | 10 jetons personnages | 2 pions joker en forme de bouteille | 1 sachet en feutrine', 2),
('IQ mini XXL', '0', 6, '', '', false, '6 pièces | 3 bloqueurs | 1 grille | 1 carnet défis | 1 notice de jeu', 2),
('Nino Conillo', '0', 3, '', '', false, '1 plan de jeu en carton intégré dans la boîte | 20 lapins en bois | 1 dés de couleurs | 1 règle du jeu', 2),
('Mow access', '100', 7, '', '', false, '48 Tuiles Vaches | 1 tuile flèche | 71 jetons', 2),
('Buzz it !', '0', 12, '', '', false, '2 règles du jeu | 1 buzzeur avec les piles', 2),
('Pochette en tissu (Cartes)', '0', 0, '', '', false, '160 cartes', 2),
('Top ten', '0', 14, '', '', false, '135 cartes | 8 jetons | 1 tapis | 1 règle du jeu', 2),
('Hitster', '0', 16, '', '', false, '308 cartes musiques | 37 jetons hitster', 2),
('TTMC ?', '0', 14, '', '', false, 'Boîte en carton-plateau intégré | 540 cartes', 2),
('Pigeon Pigeon', '0', 14, '', '', false, '1 règle du jeu | 440 questions | 1 bloc réponse | 32 jetons (16 bleus, 16 rouges)', 2),
('Tic Tac Boum Junior', '100', 6, '', '', false, '78 cartes illustrées | 4 cartes vierges', 1),
('Yogi', '0', 8, '', '', false, '1 règle du jeu | 60 cartes renforcées | 2 porte-cartes', 1),
('Lotto (Jumbo) – adapté', '100', 9, '', '', true, '24 cartes | 90 jetons', 1),
('Obstgarden', '100', 10, '', '', false, '40 fruits en bois | 4 paniers | 1 puzzle représentant un corbeau | 1 dé adapté | 1 plateau de jeu tactile', 1),
('Quoridor', '100', 8, '', '', false, '1 règle du jeu | 1 plateau de jeu | 20 barrières | 2 pions', 1),
('Cluedo', '100', 8, '', '', false, '1 plateau | 6 pions personnage (+ 6 pions adaptés) | 6 armes | 21 cartes | 2 dés adaptés | 2 dés | 1 étui | 3 carnets de note (braille et bois)', 1),
('Clous à indices', '0', 6, '', '', false, 'Dobble : giant | 20 tuiles images | 1 règle', 1),
('Othello', '100', 7, '', '', false, '1 plateau | 64 jetons double face (noir/blanc)', 1),
('Love letter', '100', 10, '', '', false, '21 cartes Personnages | 6 cartes Référence | 13 jetons de faveur | 1 règle du jeu | 1 carte référence en braille', 1),
('Carte aide de jeu NFC', '100', 10, '', '', false, 'Scrabble | 1 plateau | 4 réglettes | 100 lettres plus 2 jokers', 1),
('UNO', '100', 7, '2-10 joueurs', '20 minutes', false, '107 cartes', 1),
('MasterMind Tactile', '100', 7, '', '', false, '1 plateau | 16 pions réponses creux | 19 pions réponses pointus | 11 pions de couleur', 4),
('Twister', '100', 6, '', '', false, '1 tapis de jeu | 1 roulette', 4),
('Rummikub', '100', 7, '', '', false, '4 chevalets | 106 tuiles | 2 jokers', 1),
('Time''s up', '100', 12, '', '', false, '220 cartes du jeu original (mots) | 248 cartes brailles | 1 sac | 1 sablier', 1),
('Domino', '0', 4, '', '', false, '28 dominos | 1 règle', 1),
('Quixo', '100', 6, '', '', false, '1 plateau | 25 cubes', 1),
('Oxo', '100', 6, '', '', false, '1 grille | 4 O | 5 X', 1),
('Solitaire : plus Jeu des oies et du renard', '100', 8, '', '', false, '1 tablette | 32 pions', 1),
('Get a letter', '0', 8, '', '', false, '1 unité centrale et 2 bras | 100 cartes', 1),
('Temple d''Hanoï', '100', 6, '', '', false, '1 support en bois à 3 pieux | 7 disques en bois de tailles différentes', 1),
('Pictionnary Junior', '0', 7, '', '', false, '1 liasse de cartes | 2 plateaux à dessins', 1),
('All change', '0', 6, '', '', false, '4 pions bleus + 4 pions rouges | 1 latte de bois trouée | 1 règle en anglais', 1),
('Domory', '0', 6, '', '', false, '20 dominos en relief', 1),
('Quads', '100', 8, '', '', false, '1 plateau de jeu | 2 x 17 tuiles', 1),
('Domino des couleurs', '0', 4, '', '', false, '28 tuiles', 1),
('Le cinq neuf', '100', 10, '', '', false, '1 plateau de jeux | 18 pions | 2 dés', 1),
('Visionary', '0', 8, '', '', false, '32 cartes illustrées | 2 jeux de 12 blocs de bois | 2 bandeaux | 1 dé spécial | 1 sablier | 1 règle du jeu', 1),
('Safari Rush hour', '0', 6, '', '', false, '1 plateau | 18 bêtes féroces | 1 van | 10 cartes juniors | 40 cartes défis | 1 sac', 1),
('Rummikub : XXL', '0', 12, '', '', false, '4 chevalets | 104 tuiles | 2 jokers', 1),
('Yahtzee - Disney', '0', 6, '', '', false, '1 plateau | 1 gobelet | 5 dés | 20 tuiles en cartons', 1),
('Domino Express', '0', 6, '', '', false, '199 dominos | 1 pont', 1),
('Le jeu du loup', '100', 3, '', '', false, '1 plateau de jeu | 1 loup magnétique | 5 vêtements | 30 petits jetons | 16 jetons ronds | 4 feuilles | 1 sac', 1),
('Saloon', '100', 6, '', '', false, '2 dés adaptés | 9 tuiles en bois', 1),
('Mixx', '0', 6, '', '', false, '64 cartes (8 couleurs et 8 formes)', 1),
('Hop ! Hop ! Hop !', '100', 4, '', '', false, '4 plateaux | 1 bergerie | 1 pont - 10 pièces en bois | 1 bergère | 9 moutons | 1 dé', 1),
('Big Pirate', '100', 5, '', '', false, '1 plateau de jeu | 1 figurine pirate | 3 figurines moussaillon | 3 coffres | 7 cocotiers/cachettes | 9 cartes | 1 grand dé | 1 petit dé', 1),
('Monopoly Junior', '100', 5, '', '', false, '1 plateau de jeu | 24 cartes chances | 56 stands | billets de banque | 2 dés | 4 voitures', 3),
('Turbo Taxi', '100', 10, '', '', false, '6 plateaux | 75 tuiles | 4 pions', 1),
('Cyclo-Spel', '100', 6, '', '', false, '1 plateau en bois | 6 pions | 3 roues | 1 dé', 4),
('MasterMind', '0', 7, '', '', false, '1 plateau | 38 pions réponses noirs | 11 pions de 8 couleurs', 1),
('Reversi - adapté', '100', 12, '', '', true, '1 plateau | 66 pions', 1),
('Solitaire', '100', 8, '', '', false, '1 tablette | 32 pions | 1 grand pion', 1),
('Pim Pam Pet', '0', 7, '', '', false, '1 roue à lettre | 50 mots / questions', 1),
('Carte à jouer : XXL', '0', 7, '', '', false, '52 cartes à jouer + 3 jokers', 1),
('Lotto (marque King)', '0', 3, '', '', false, '10 planches | 76 cartes', 4),
('La chasse aux carottes', '100', 4, '', '', true, '1 plateau de jeu adapté tactile | 4 lapins | 10 carottes | 1 dé | 22 cartes', 1),
('Serpents et échelles', '100', 4, '', '', false, '1 plateau | 5 pions | 1 dé', 1),
('Dé – Reconnaissance des formes - adapté', '100', 3, '', '', true, '1 dé avec des formes | 24 formes en bois', 1),
('Jeu du moulin', '100', 6, '', '', false, '1 plateau | 18 pions (9 blancs, 9 noirs)', 1),
('Pistes magiques', '0', 4, '', '', false, '6 plateaux | 4 bonhommes – 4 supports aimantés', 1),
('Touché coulé - adapté', '100', 8, '', '', true, '2 consoles de jeux | Porte-avions | Croiseur | Torpilleurs', 1),
('Domino tactile', '100', 3, '', '', false, '24 pièces', 1),
('Dick Bruna Domino', '0', 4, '', '', false, '36 cartes', 1),
('Les animaux : domino puzzle', '0', 3, '', '', false, '28 cartes', 1),
('Domino géant en bois', '0', 6, '', '', false, '28 dominos géants en bois', 1),
('Triangel', '0', 6, '', '', false, '64 tuiles + 1 neutre | 1 plateau de jeu', 1),
('Nain jaune - adapté', '100', 8, '', '', true, '1 jeu de carte adapté – 1 série de jeton | 1 plateau de jeu avec 5 barquettes', 4),
('Géotour - adapté', '100', 3, '', '', true, '36 tuiles en bois + 36 formes géométriques', 4),
('Chessquito', '0', 5, '', '', false, '1 plateau | 8 pièces', 4),
('Mes premiers mots', '0', 4, '', '', false, '19 plateaux | 1 memento | 150 lettres', 4),
('Scrabble Junior', '0', 5, '', '', false, '1 plateau réversible | 84 lettres | 21 jetons', 4),
('Pisaturm', '0', 5, '', '', false, '42 bâtonnets de couleur | 1 dé de couleurs', 4),
('Jeu à calculer – adapté', '100', 6, '', '', true, '4 planches | 80 pièces', 2),
('Jeu à calculer', '100', 6, '', '', false, '4 planches | 80 pièces', 4),
('Jeu de dames', '100', 6, '', '', false, '1 plateau de jeu | 40 pions', 8),
('Jeu d''échec', '100', 6, '', '', false, '1 plateau de jeu | 32 pièces', 10),
('Ne t''en fais pas', '100', 4, '', '', false, '1 plateau | 16 pions', 4),
('Dominoes for the blind', '100', 7, '', '', false, '28 tuiles', 6),
('Memory', '0', 3, '', '', false, '60 cartes (30 paires)', 4),
('Rory''s story cubes', '0', 6, '', '', false, '1 règle du jeu | 9 dés à symboles uniques', 1),
('Zik', '0', 10, '', '', false, '48 cartes avec une onomatopée et chansons', 1),
('Cartaventure : Vinland', '0', 10, '', '', false, '70 cartes | 1 livret historique', 1),
('Le temps de jouer : les années 70', '0', 16, '', '', false, '45 cartes', 1),
('Focus', '0', 16, '', '', false, '138 cartes | 1 Giga-pion | 1 carnet | 1 crayon', 1),
('À l''heure du crime... où étiez-vous ?', '0', 10, '', '', false, '70 cartes alibi | 16 cartes crime', 1),
('Les Winifutés', '0', 7, '', '', false, '36 pions | 160 cartes', 1),
('Énigmes ? : l''environnement', '0', 9, '', '', false, '1 plateau | 1 jeton | 80 cartes', 1),
('Mospido : le jeu de mots ultra speed', '0', 7, '', '', false, '50 cartes', 1),
('Monki', '0', 7, '', '', false, '4 plateaux Temple | figurines Monki | 40 jarres', 1),
('Time bomb', '100', 8, '', '', false, '8 cartes rôle | 40 cartes câble | jeton pince coupante', 1),
('Hand-to-hand wombat', '100', 7, '', '', false, '18 briques | 16 cartes', 1),
('Ghost adventure', '0', 8, '', '', false, '2 toupies | 2 livrets', 1),
('Aya', '0', 8, '', '', false, '16 tuiles Landscape | 156 dominos Fleuve | photos', 1),
('Run run run !', '0', 8, '', '', false, '9 pions | 10 dés | 66 tuiles | 84 jetons', 1),
('Reizen', '0', 4, '', '', false, '28 dominos', 1),
('Provisions de noisettes', '0', 3, '', '', false, '19 noisettes | 4 écureuils | 168 dominos', 1),
('Potage sauvage', '100', 8, '', '', false, '77 cartes | 37 jetons Point', 1),
('Sound box', '0', 8, '', '', false, '110 cartes Bruit | jetons | sablier | 2 lunettes', 1),
('Two rooms and a boom', '100', 10, '', '', false, '49 cartes Personnage', 1),
('Kayanak', '0', 6, '', '', false, '1 plateau | canne à pêche | poissons | dés', 1);
