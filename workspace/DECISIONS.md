# Journal de décisions du projet

## V1 — Starter

React permet d’employer exactement les mêmes composants dans le catalogue et
le viewport isolé. Le backend HTTP Node utilise la bibliothèque standard ; Zod
valide les entrées et les fichiers. Vite compile le frontend. Pas d’Electron,
base distante, Figma ou LLM obligatoire.

Codex propose du JSON sans outils ; le contrôleur est l’unique auteur des changements
locaux validés. Claude et Gemini ne sont pas activés sans qualification.

## À compléter par l’étudiant

Date, problème, options explorées, décision, preuves et limite connue.

## 2026-10-27 — Atomes Inbox Zapper et migration v1 → v2

**Problème.** Le starter exposait six composants génériques. Le DS Inbox Zapper
compte 23 familles et environ 90 variantes. Les 18 tokens de la version 1 ne
pouvaient pas exprimer les fonds de surface des boutons secondaires, gris et
destructifs doux, ni la couleur de texte d'invite des champs.

**Options explorées.**

1. Garder 18 tokens et coder les fonds en dur dans les composants. Écarté :
   un fond codé en dur ne se propage pas, ce qui vide l'atelier de son objet.
2. Porter toute la couche sémantique d'Inbox Zapper, soit 50 tokens et deux
   modes. Écarté pour l'instant : le mode dark demande un deuxième axe dans le
   schéma, indépendant de l'ajout de clés.
3. **Retenu :** ajouter les onze tokens que les six atomes exigent réellement,
   et rien de plus. Chaque clé nouvelle est justifiée par un composant.

**Décision.** Schéma porté à 29 tokens, version d'état 2. La migration complète
un état v1 avec des valeurs de repli, sans toucher aux tokens déjà présents, à
la révision ni au journal. Le fichier disque reste en v1 jusqu'à la prochaine
validation : l'original est préservé, conformément à START_HERE.

**Preuves exécutées.** `npm test` : 32/32. Test dédié « migration v1 → v2 » :
18 → 29 tokens, révision et patches identiques, et l'annulation de la révision
antérieure fonctionne encore après migration. Vérifié aussi sur l'état réel de
la machine : révision 2 et historique conservés. Propagation confirmée dans le
catalogue et dans l'iframe. Aucun débordement horizontal à 320 px.

**Écart assumé avec Figma.** Le composant `secondary_button_*_disable` affiche
du texte blanc sur `action/keep-surface`, soit environ 1,1:1 — illisible, vérifié
par rendu du nœud `8471:18788`. L'implémentation garde le fond et utilise
`color.placeholder` pour le texte. À corriger dans Figma.

**Limites connues.** `action/destructive-surface` est une transparence à 15 % :
elle est aplatie sur blanc en `#F8E1E1`, donc fausse sur un fond non blanc. Les
icônes des boutons ne sont pas reprises. Contrastes mesurés sur les trois
presets, sous 4,5:1 pour la couleur d'invite des champs partout, et pour les
boutons secondaire, dangerSoft et le tag primaire sur le preset fidèle.

## 2026-10-27 — scan_free_limit et migration v2 → v3

**Problème.** Le composant `scan_free_limit` (node Figma `8047:17777`) porte un
état « scan limit reached » bâti sur la famille `status/warning` et son brun
d'accompagnement, plus un état « completed » sur `status/success-surface`.
Aucune des 33 clés de la version 2 ne couvrait ces cinq couleurs : ni
`color.danger` ni `color.dangerSurface` ne sont des avertissements, et
`color.success` n'a pas de surface associée.

**Options explorées.**

1. Coder les cinq couleurs en dur dans la feuille de style. Écarté pour la même
   raison qu'en version 2 : un fond codé en dur ne se propage pas.
2. Réutiliser la famille `danger` pour l'avertissement. Écarté : le DS les
   distingue, et les confondre ferait lire un plafond atteint comme une erreur.
3. **Retenu :** ajouter les cinq clés que le composant exige réellement.

**Décision.** Schéma porté à 38 tokens, version d'état 3. La migration parcourt
désormais les deux tables d'ajout : un état v1 saute directement en v3, un état
v2 ne reçoit que les cinq clés manquantes. Rien d'existant n'est touché.

**Preuves exécutées.** `npm test` : 32/32. Le test de migration ne cite plus de
numéro de version ni de compte en dur : il dérive les deux des tables d'ajout,
donc il suivra la version 4 sans réécriture. Vérifié sur l'état réel de la
machine : `/api/state` renvoie version 3, 38 tokens, révision 6 et les six
entrées du journal intactes. Géométrie mesurée dans le navigateur contre
Figma : carte 353 × 66, pastille 40 × 40, icône 22,22, chevron 25, ligne plate
353 × 49.

**Écarts assumés avec Figma.**

- `status/success-surface` vaut `rgba(81, 194, 35, 0.1)`. Le schéma n'accepte
  que `#RRGGBB` : la valeur est aplatie sur blanc en `#EEF9E9`. Exact sur fond
  blanc, approché ailleurs. Élargir le format des couleurs à l'alpha toucherait
  aussi le calcul de contraste ; c'est un autre chantier.
- Les quatre icônes sont les exports Figma, couleur cuite dans le fichier.
  Changer `color.success` ou `color.warning` dans l'atelier ne les suivra pas.
  Les redessiner les rendrait solidaires des tokens au prix de la fidélité du
  tracé ; la fidélité a été préférée, le composant étant donné comme pixel
  perfect.
- Le chevron est un SF Symbol dans Figma, donc non exportable. Il est redessiné
  et suit la couleur du titre, comme à l'écran.
- Le libellé « Go Pro to resume scaninng. » porte une coquille dans le DS. Il
  est repris tel quel : l'atelier reflète Figma, il ne le corrige pas en douce.
  À corriger dans Figma.

**Limites connues.** Les trois presets du catalogue reçoivent les cinq clés avec
les valeurs d'Inbox Zapper. Pour « Lisière », qui a sa propre palette, ce sont
des valeurs de repli neutres et non un choix de design.

## 2026-10-27 — filters, migration v3 → v4 et alignement du catalogue

**Problème.** Le composant `filters` (node Figma `5548:65591`) pose sa puce
active sur `primary/blue-100`, un bleu très clair. `color.brandSurface`
(`#EDF1F9`) est `action/keep-surface` : un autre bleu, pour un autre usage.
Aucune clé existante ne porte celui-ci.

**Décision.** Une seule clé ajoutée, `color.brandTint`, schéma porté à 39
tokens, version d'état 4. Figma pose un rayon de 48 sur la puce ; au-delà de
la moitié de la hauteur toute valeur donne le même stade, `radius.pill` est
donc utilisé plutôt qu'une valeur inventée.

**Preuves exécutées.** `npm test` : 32/32, sans retoucher le test de migration
— il dérive version et comptes des tables d'ajout depuis la version 3.
`/api/state` : version 4, 39 tokens, révision 6 et les six entrées du journal
intactes. Géométrie mesurée : puce 36 de haut, chevron 20, fonds `#F7F7F8` et
`#E1EFFE`, textes `#4D5258` et `#007BFF`.

**Écart assumé.** Les deux chevrons sont deux exports distincts, couleur cuite
dans le fichier, comme pour `scan_free_limit`.

**Alignement des vignettes.** Les aperçus d'index sont réduits par `transform:
scale`, qui ne change pas la boîte de mise en page : une vignette haute, comme
la modale, poussait le texte de sa carte plus bas que celui de sa voisine. La
scène d'index passe d'une hauteur minimale à une hauteur fixe de 320, avec
débordement masqué — seule la boîte déborde, jamais le dessin. Vérifié : les
neuf cartes ont une scène de 320 et un bloc de texte au même décalage.

**Bannière et défilement.** Ouvrir ou fermer une fiche remonte en haut de page,
et la bannière disparaît sur une fiche : c'est un décor d'accueil, qui sinon
repousse le contenu sous la ligne de flottaison. Le catalogue ne connaît pas ce
qui l'entoure : il prévient la page par `onOpenChange`, c'est elle qui décide.

## 2026-10-27 — search-bar et logo

**Décision.** `search-bar` (node Figma `5495:63766`) n'a demandé aucun token
nouveau : bordure, rayon, rembourrage, gouttière et taille de texte existaient
tous. Le schéma reste en version 4, 39 tokens.

Figma décrit les deux états comme deux variantes figées. L'implémentation en
fait ce qu'ils sont réellement : un champ natif. La bordure bleue vient de
`:focus-within`, le curseur bleu de `caret-color` — Figma le dessine comme une
barre de 0,5 × 17, c'est le curseur du navigateur — et la croix apparaît dès
qu'il y a du texte, les deux variantes du DS étant exactement « vide » et
« saisi ». La croix native de `type="search"` est neutralisée pour ne pas
doubler le bouton.

**Preuves exécutées.** `npm test` : 32/32. Géométrie mesurée : 353 × 41, rayon
8, bordure `#D5D7D9` au repos et `#007BFF` au focus, curseur `#007BFF`.

**Écart assumé.** Les deux icônes sont des SF Symbols, donc sans calque
exportable : elles sont redessinées et suivent la couleur du champ. Le calque
de droite est nommé « heroicons-mini/magnifying-glass » dans Figma, mais le
rendu du nœud `4158:32393` montre une croix : c'est le rendu qui fait foi, et
une croix est seule cohérente avec un champ saisi. Nom de calque à corriger
dans Figma.

**Logo.** Remplacé par le glyphe détouré fourni, et ramené de 43 à 34 px. Le
rayon de 22 % a été retiré : il arrondissait la tuile bleue de l'ancienne
marque et rognerait les coins de l'enveloppe, qui va jusqu'au bord. Le fichier
n'est pas tout à fait carré (305 × 294), d'où `object-fit: contain`. Le favicon
porte encore l'ancienne marque.
