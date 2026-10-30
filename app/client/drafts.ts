// Composants demandés depuis un lien Figma, en attente d'intégration.
//
// **Rien ici ne lit Figma et rien n'écrit de composant.** L'enchaînement
// affiché dans l'atelier est une mise en scène : il montre les étapes qu'une
// intégration réelle suivrait, à la bonne cadence, pour qu'on puisse juger du
// parcours avant de le construire. Les cartes produites sont marquées comme
// telles, et aucun fichier du design system n'est touché.
//
// Ce que la version réelle demanderait, et qui n'est pas là : un client Figma
// autorisé avec l'OAuth de l'étudiant (voir docs/FIGMA.md), puis un agent
// capable d'écrire le composant dans app/client/Atoms.tsx avec les tokens du
// design system. Les deux sont des chantiers à part entière.

export const FAMILIES = ['Actions', 'Formulaire', 'Surfaces'] as const;
export type Family = (typeof FAMILIES)[number];

export interface Draft {
  id: string;
  name: string;
  family: Family;
  fileKey: string;
  nodeId: string;
  addedAt: string;
}

// Les étapes de la mise en scène, avec leur durée. Elles portent les noms de
// ce qui serait réellement fait, pour que la démonstration dise quelque chose
// du travail, et non seulement qu'elle fasse patienter.
export const STEPS: { label: string; ms: number }[] = [
  { label: 'Lecture du nœud Figma', ms: 900 },
  { label: 'Relevé des variables et des états', ms: 1100 },
  { label: 'Écriture du composant sur vos tokens', ms: 1300 },
  { label: 'Ajout au catalogue', ms: 600 },
];

export const TOTAL_MS = STEPS.reduce((n, s) => n + s.ms, 0);

const KEY = 'ds-studio-drafts-v1';

// Les demandes vivent dans la session de l'onglet : une démonstration se
// rejoue, elle ne s'accumule pas sur le disque de l'étudiant. Un stockage
// indisponible n'est pas une erreur, on repart d'une liste vide.
export function loadDrafts(): Draft[] {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return [];
    const list = JSON.parse(raw);
    if (!Array.isArray(list)) return [];
    return list.filter(
      (d): d is Draft =>
        !!d &&
        typeof d.id === 'string' &&
        typeof d.name === 'string' &&
        typeof d.fileKey === 'string' &&
        typeof d.nodeId === 'string' &&
        FAMILIES.includes(d.family),
    );
  } catch {
    return [];
  }
}

export function saveDrafts(drafts: Draft[]) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(drafts));
  } catch {
    /* Facultatif : la liste reste en mémoire pour la session en cours. */
  }
}
