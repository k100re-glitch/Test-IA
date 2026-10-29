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

## Bannière : nouvel export, et survol de scan_free_limit

**Bannière.** Troisième export remplacé tel quel. Les dimensions source sont
identiques aux précédentes (6294 × 1908, ratio 3,30), donc aucun réglage CSS
n'a bougé : le cadre montre toujours 67 % de la hauteur de l'image, sans coupe
latérale, et le titre tient entier à 375 px. L'image est réduite à 4400 px de
large, soit 263 Ko.

**Survol.** Au survol et au focus clavier, la carte `scan_free_limit` prend le
fond de la pastille qui porte son icône : `color.warningSurface` pour l'état
limite, `color.brandSurface` pour l'état scanning. Aucune couleur nouvelle
n'entre dans le système, le survol suit donc les tokens. Les deux états
cliquables sont traités pareil, par symétrie.

**Écart assumé.** Les deux fonds devenant identiques, la pastille disparaît
visuellement pendant le survol : l'icône semble posée à même la carte. C'est la
conséquence directe de la règle demandée. La transition de 120 ms est
neutralisée sous `prefers-reduced-motion`.

## Coque de l'atelier : passage au registre « produit »

**Ce qui change.** Les trois références fournies partagent une grammaire
unique : un canevas gris sur lequel flotte une fenêtre blanche à grand rayon,
des filets d'un pixel plutôt que des cadres, des contrôles bas et serrés
(34 px, rayon 9), un seul bouton noir par écran, des onglets soulignés, des
libellés de section en petites capitales grises. Elle est appliquée à
l'en-tête, au fil d'Ariane, aux onglets, au titre de page, aux cartes, aux
tableaux de tokens, à l'historique, au diff et au pied.

**Ce qui ne change pas.** Aucun spécimen Inbox Zapper n'est touché. La
frontière tient parce que chaque bloc `.ds-*` déclare `font-family:
var(--font-family)` et puise ses couleurs dans les tokens : changer la police
et les gris de la coque ne les atteint pas. C'est l'outil qui est redessiné,
pas le produit.

**Trois décisions.** `#root` porte la fenêtre : c'est déjà l'enveloppe unique
de l'application, lui donner le cadre évite un div ajouté pour le seul style.
Le plan de travail passe en gris `#ebecf0` et les fiches restent blanches :
c'est ce contraste, et non un cadre appuyé, qui détache les cartes dans les
références — un premier essai en `#fafafb` les faisait disparaître. La colonne
de contenu passe de 860 à 1000 px, la fenêtre étant plafonnée à 1320.

**Écarts assumés.** Le titre de page quitte le registre éditorial (44 px
maigre) pour un titre de produit compact et gras : c'est un changement de ton,
pas un réglage. Sous 740 px l'état « Figma non connecté » est masqué — trois
contrôles empilés contre la droite coûtaient trois rangées pour une
information de service.

**Trois reprises après coup.** La fenêtre flottante — canevas gris, carte
blanche à grand rayon — a été retirée : elle rogne la place utile d'un outil
qui n'a qu'un seul écran. Le plan de travail et les scènes des cartes
repassent en blanc, et le chevauchement arrondi du catalogue sur la bannière
disparaît : ces deux coins de 22 px remontés sur l'image dessinaient un
contour en relief qui n'appartenait à rien. Les spécimens blancs restent
lisibles sur fond blanc, car la barre de recherche et la carte de scan portent
leur propre bordure, héritée de Figma.

## Sommaire permanent et cartes au bon gabarit

**Le problème.** Le catalogue se parcourait en déroulant : pour passer d'un
composant à un autre il fallait remonter, retrouver sa carte, redescendre. Et
les cartes étaient énormes — une scène de 320 px de haut pour des composants
qui en occupent 40 à 70, dans une colonne plafonnée à 1000 px sur un écran
deux fois plus large.

**Le sommaire.** Une colonne de 216 px à gauche, collée en haut pendant le
défilement, qui liste les dix composants par famille et marque celui qui est
ouvert. Il reste visible dans les deux onglets : depuis les tokens, cliquer un
composant bascule d'onglet et l'ouvre. Sous 1060 px il passe au-dessus du
contenu en une rangée qui défile horizontalement — une colonne de 216 px prise
sur 700 px de large coûterait plus qu'elle ne rapporte.

**Les cartes.** Scène ramenée à 192 px, colonne ouverte à 1480 px, quatre
cartes de ~350 px par rangée sur un grand écran. 192 px est la hauteur de la
plus haute vignette (la pile de trois boutons, 161 px) plus son rembourrage ;
en dessous, elle se faisait rogner. 350 px est la largeur des spécimens les
plus larges du DS (353 px).

**Deux vignettes à part.** La barre de recherche (353 px fixes) et la modale
(345 × 307) ne tiennent pas dans une carte de 318 px : elles passent par
`prev-scaled`, le réducteur déjà employé ailleurs dans le fichier, la modale à
une échelle plus basse car c'est le seul spécimen plus haut que large. Les
fiches de détail, elles, montrent les composants à leur taille réelle.



## Nouvelle bannière, et pictogrammes de famille

**La bannière.** L'ancienne image sombre (`banner.jpg`, 263 Ko) et son
parallaxe sont supprimés, ainsi que les règles devenues mortes. À la même
place, en pleine largeur : le fond en dégradé bleu fourni (`banner-bg.jpg`,
52 Ko) et, posé dessus, le verrou de marque — glyphe, nom sur deux lignes,
filet vertical, « Design System World ». Le bandeau fait 320 px, 212 sur
mobile. Tout est récupérable dans l'historique Git.

**Le fond a dû être reconstruit.** L'image fournie portait le logo incrusté :
s'en servir telle quelle l'aurait dupliqué. La bande qui le contenait
(lignes 285 à 435) a été refaite en interpolant entre la ligne au-dessus et
celle en dessous. Le dégradé variant lentement en vertical, le raccord ne se
voit pas.

**Le filet vertical** sépare deux marques de même rang, comme un cartouche de
partenariat. C'est pour cela que « Design System World » est en graisse
normale et non en gras : ce n'est pas un second logo, c'est ce que la page
montre.

**Pictogrammes.** Un signe au trait par famille — éclair pour Actions, champ
pour Formulaire, plans empilés pour Surfaces — dans le sommaire et sur les
intertitres du catalogue. Ils héritent de la couleur du libellé, donc ils
suivent l'état actif.

**Deux essais abandonnés.** Une en-tête à l'américaine — pastille, titre en
deux tons, sous-titre, deux boutons — avait été montée d'après une référence
de page d'accueil : retirée, cet atelier n'a pas à se vendre à qui l'ouvre.
Puis un panneau de composants vivants posé sur un dégradé pastel, coupé par le
bas du bandeau : remplacé par le verrou de marque demandé.

## Historique en modale, et aperçus mis en valeur

**L'historique.** Il s'affichait en panneau déroulant, inséré entre l'en-tête et
la bannière : il poussait la page vers le bas et se lisait comme un bloc de
contenu de plus. Il passe en `<dialog>` ouvert par `showModal()`, ce qui
apporte le fond, le piège à focus et la fermeture par Échap sans une ligne de
script. L'en-tête de la boîte reprend le fil d'Ariane de la page — on sait d'où
l'on vient — et porte la croix de fermeture.

**La chronologie.** Une entrée par révision, de la plus récente à la plus
ancienne, reliées par un filet continu : l'historique est une suite, pas un
tas. Le point de la révision en tête est plein, les autres sont gris. Les
tokens touchés passent en puces plutôt qu'en liste séparée par des virgules :
on en compte le nombre d'un coup d'œil. 1,3 Ko de CSS devenu mort a été
supprimé avec l'ancien panneau.

**Les aperçus.** Les spécimens flottaient à même la carte blanche : rien ne
disait où commençait le composant et où finissait la fiche. La scène devient un
encadré — teinte à peine marquée, filet d'un pixel, coins arrondis, léger creux
— dans l'index comme dans les fiches de détail.

**La ligne que je n'ai pas franchie.** Le creux est porté par l'encadré, pas par
le composant. Mettre une ombre sous une carte de scan ou une barre de recherche
les ferait mentir : ces ombres n'existent pas dans le fichier Figma, et le
catalogue est censé montrer ce que le design system contient, pas ce qui le
flatte.

**L'icône Actions.** Le curseur en aplat se lisait mal à 14 px — une pointe
étroite et une diagonale. Remplacé par un éclair au trait, cohérent avec les
deux autres familles qui sont aussi au trait.

**Rayons concentriques.** Le rayon extérieur vaut l'intérieur plus l'écart qui
les sépare : scène à 8, rembourrage de 14, carte à 22. Avec deux rayons égaux
de part et d'autre d'un écart, les arrondis ne sont pas parallèles et le coin
a l'air sale.

**Aperçu du bouton.** Deux boutons au lieu de trois. Le contraste primaire /
secondaire se lit avec deux ; le troisième allongeait la vignette sans rien
dire de plus. Les onze autres variantes sont sur la fiche. La plus haute
vignette du catalogue est désormais la modale (160 px), non plus la pile de
boutons.

## Parallaxe, remontée animée, en-tête translucide

**Parallaxe, en deux mouvements qui se composent.** La bannière est accrochée
sous l'en-tête et le catalogue, opaque et au plan supérieur, vient la
recouvrir : le fond ne bouge pas du tout, et tout le mouvement est celui du
contenu qui passe dessus. Par-dessus cela, le dessin glisse dans son cadre
pendant qu'il est ainsi retenu. Le cadre étant immobile, le décalage se lit
sur le défilement de la page et non sur la position du cadre. L'image dépasse
de 80 %, elle garde donc une marge de 40 % de la hauteur du cadre de chaque
côté ; la vitesse vaut exactement cette fraction et le défilement pris en
compte est plafonné à la hauteur du cadre — le glissement maximal atteint la
marge sans jamais la dépasser, quelle que soit la hauteur de la bannière. Le
déplacement est lu dans une frame d'animation : rien n'est recalculé pendant
l'événement de défilement, et la parallaxe est désactivée sous
`prefers-reduced-motion`.

**Remontée animée.** Ouvrir ou fermer une fiche remonte en haut en douceur
plutôt que d'un saut. Un saut instantané double le changement de contenu d'un
changement de position, et on ne sait plus où l'on a atterri. `auto` sous
`prefers-reduced-motion`.

**En-tête translucide.** Blanc à 72 % et `backdrop-filter: blur(18px)
saturate(180%)`. Le flou n'a de sens que s'il a quelque chose à flouter :
l'en-tête devient donc collante et la bannière passe dessous — c'est aussi ce
qui donne sa portée à la parallaxe, le dégradé glissant derrière un verre
dépoli au lieu de disparaître par le haut. L'aplat blanc reste nécessaire
sous le flou : `backdrop-filter` n'est pas honoré partout, et sans lui
l'en-tête serait illisible sur le bleu. Le sommaire se cale 17 px sous
l'en-tête, sans quoi ses premières entrées passeraient derrière le verre.


## L'historique devient une popup

**Pourquoi.** En modale centrée, l'historique noircissait la page et bloquait
tout derrière lui. Or ce n'est pas une décision à prendre : c'est une
information qu'on consulte à côté de ce qu'on lisait. Il devient une popup qui
tombe sous son bouton, alignée à droite comme lui.

**Comment.** L'API popover s'en charge : calque supérieur, fermeture par Échap
et au clic en dehors, sans une ligne pour les câbler. Il reste à réaccorder
l'état sur l'événement `toggle` — sans quoi, après une fermeture que nous
n'avons pas provoquée, le bouton se croit encore ouvert et le clic suivant ne
fait rien.

**Position.** L'en-tête est collante et haute de 71 px : la position de la
popup est donc connue d'avance, ce qui évite de calculer un ancrage à chaque
ouverture. Sous 740 px elle s'étend d'un bord à l'autre.

**L'ouverture de la popup.** Elle descend de 10 px en grandissant de 3 %,
depuis le coin haut droit — celui du bouton qui l'ouvre. L'origine fait tout :
un même mouvement parti du centre donnerait l'impression d'une boîte qui
surgit, là où partir du bouton donne celle d'un panneau qui se déplie depuis
lui.

Deux durées, parce que la transition qui joue est celle de l'état d'arrivée :
la règle de base gouverne l'ouverture, celle de l'état fermé la fermeture.
340 ms pour entrer, 160 pour sortir — une popup qu'on ouvre se regarde
arriver, une popup qu'on ferme doit libérer la vue tout de suite. La courbe
d'entrée décélère franchement : le mouvement part vite et s'installe, ce qui
se lit comme lent sans donner l'impression d'attendre.

Un popover est en `display: none` quand il est fermé : sans `allow-discrete` et
`@starting-style`, il n'y a pas d'état de départ à animer et il apparaîtrait
d'un coup. Là où ces deux-là ne sont pas honorés, c'est exactement ce qui se
passe — la popup s'affiche sans transition, et rien n'est cassé. Les valeurs calculées sont vérifiées
côté navigateur : 340 ms et `cubic-bezier(0.16, 1, 0.3, 1)` à l'ouverture,
160 ms et `ease` à la fermeture.

**Le filet sous l'en-tête** est retiré : le flou marque déjà la séparation, et
un trait par-dessus un dégradé bleu se voit plus que l'en-tête elle-même.

**Survol d'une carte.** Seul le fond s'allume. Ni ombre portée, qui faisait
décoller la carte du plan de travail alors que rien ne s'ouvre encore, ni
filet renforcé, qui redessinait le contour au passage de la souris. Le
soulèvement d'un pixel part avec l'ombre : privé d'elle, il se lirait comme un
tremblement. Le fond du survol reste plus clair que le plan de travail et plus
sombre que la scène, de sorte que le spécimen demeure l'élément le plus
lumineux de la carte.

**L'ombre de la popup.** Une seule couche à 18 % traçait un bord net sous la
boîte et la faisait tomber sur la page. Remplacée par cinq couches où, à
chaque palier, le flou double pendant que l'opacité reste entre 4 et 7 % : le
halo s'éteint progressivement et la popup a l'air posée, pas lâchée. Un
sixième anneau sans décalage ni flou remplace la bordure — il suit le rayon
sans ajouter de trait.

**Le corps de la popup défile.** Empilés dans un bloc, l'en-tête et le corps
prennent la hauteur de leur contenu : le corps dépassait la hauteur maximale
de la popup, qui se contentait de le rogner, et il n'y avait rien à faire
défiler. En colonne flex, le corps reçoit la hauteur qui reste —
`min-height: 0` étant ce qui l'autorise à être plus court que son contenu.
Mesuré : 777 px de contenu dans 499 px visibles.

## Fermeture de la popup, et sommaire qui suit l'onglet

**Un vrai bug.** La règle `display: flex` posée sans condition sur `.sheet`
reprenait au popover fermé le `display: none` qu'il tient de la feuille du
navigateur. La popup restait donc affichée, invisible mais posée par-dessus la
page — et comme la transition de `display` n'avait plus rien à faire, la
fermeture ne s'achevait jamais. `display` est maintenant posé sur
`.sheet:popover-open`. Mesuré : à 60 ms après la demande de fermeture, opacité
0,37 et `display: flex` ; 400 ms plus tard, `display: none`.

**Le sommaire suit l'onglet.** Il listait les composants même pendant la
lecture des tokens, où il ne servait plus à rien. Dans l'onglet Tokens il
liste désormais les cinq sections de la page — Primitive Colors, Semantic
Colors, Typography, Spacing, Shapes — et chaque entrée y mène, avec la même
remontée animée qu'ailleurs, décalée de 100 px pour passer sous l'en-tête
collante.

**Les compteurs sont calculés, pas écrits.** 112 et 50 sont comptés sur
`primitive.json` et `semantic.json`, les trois autres sur les clés de tokens.
Le texte de la page annonçait déjà ces nombres en dur ; les recopier dans le
sommaire aurait créé un deuxième endroit où ils peuvent mentir. L'identifiant
d'ancre se déduit du titre pour la même raison.

## Bouton Commit, défilement inertiel, alignement

**Commit.** « Exporter les tokens » devient « Commit », marque GitHub en
blanc. Il écrit les tokens courants dans `workspace/design-system.tokens.json`
puis les valide. Trois bornes, posées dans `app/server/git.ts` :

- *Un seul fichier.* `.ds-studio/` est l'état privé d'exécution et ne doit
  jamais être commité ; le fichier versionnable est celui du workspace. Son
  chemin est écrit en dur, jamais reçu par HTTP. `git commit --only` ne touche
  pas au reste de l'index.
- *Aucun shell.* `execFile` reçoit un tableau d'arguments : il n'y a pas de
  ligne de commande à interpréter, donc rien à y injecter. Le seul texte
  variable du message est un entier, la révision, lue dans l'état du serveur
  et non dans la requête — la route n'accepte aucun paramètre.
- *Commit, pas de push.* Pousser publie ; c'est une autre décision, qui se
  prend ailleurs et explicitement. La réponse le dit à l'écran.

Quand rien n'a changé, la route répond « déjà à jour » au lieu de fabriquer un
commit vide. Preuve exécutée : clic sur le bouton → `b5d07d2 Tokens du design
system, révision 6`, un fichier, 60 insertions et 60 suppressions.

**Défilement inertiel.** La molette pousse une cible que la position réelle
rattrape d'un dixième à chaque frame : le mouvement continue un instant après
le geste. Écrit à la main plutôt qu'emprunté à une bibliothèque — le projet
tient sur trois dépendances, et une quatrième pour un effet de surface se
paierait à chaque installation.

Le rattrapage est réglé à 0,16 du chemin restant par frame, après un premier
essai à 0,10 qui traînait derrière le geste. Le reste du trajet décroît en
(1 - EASE) par frame, donc le glissement dure à peu près moitié moins sans
cesser de se voir. Mesuré sur une impulsion de 600 px : 452 px après 60 ms,
593 après 200 ms, posé avant 500 ms — contre 342 px à 60 ms et un mouvement
encore en cours à une seconde dans le premier réglage.

Il se retire de lui-même là où il nuirait : sur les zones qui défilent
elles-mêmes (corps de la popup, sommaire, tableaux), sur écran tactile où le
système fournit déjà son inertie, et sous `prefers-reduced-motion`. Le clavier
et les ancres continuent de déplacer la page nativement ; la cible se
réaccorde sur la position réelle dès que l'animation est au repos.

**Alignement.** L'en-tête et le pied suivent la colonne de contenu par un
rembourrage calculé — `max(32px, calc((100% - 1480px) / 2 + 32px))` — plutôt
que par une largeur maximale : leur fond doit traverser toute la largeur,
l'en-tête étant collante et floutée. Vérifié à 1900 px : marque et colonne
commencent toutes deux à 242 px.

**Retraits.** L'état « Figma non connecté » quitte l'en-tête ; l'appel de
démarrage reste, c'est lui qui pose le jeton de session. L'ombre interne des
scènes d'aperçu est retirée : l'encadré se suffit de sa teinte et de son
filet.

**Importer et Historique échangent de place.** L'import rejoint l'en-tête
auprès de la pastille d'état ; l'historique descend auprès de Commit, les deux
touchant au dépôt et aux révisions. Deux conséquences qu'il a fallu traiter :
le bouton sombre est désormais désigné par une classe et non par sa position,
puisqu'il n'est plus seul dans sa rangée ; et la popup, qui tombait sous une
position écrite en dur dans la feuille de style, lit maintenant le rectangle
de son bouton à l'ouverture. Posée dans le calque supérieur, elle est fixée au
viewport : elle se ferme donc au défilement plutôt que de se décrocher.
