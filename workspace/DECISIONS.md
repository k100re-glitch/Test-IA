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
