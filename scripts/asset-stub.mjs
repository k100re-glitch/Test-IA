import { register } from 'node:module';

// Crochet de résolution pour Node : les composants de l'atelier importent des
// images et des SVG, que Vite transforme en URL mais que Node ne sait pas lire.
// Le générateur de documentation n'a besoin que des métadonnées du catalogue,
// jamais des pixels : chaque import d'asset renvoie donc un module vide.
//
// Le fichier joue deux rôles. Chargé par « node --import », il s'enregistre
// lui-même comme chaîne de crochets ; chargé dans le fil des crochets, ce sont
// ses exports resolve et load qui servent. Le drapeau d'environnement coupe la
// récursion : le fil hérite d'une copie de l'environnement du processus, donc
// il voit le drapeau posé avant son démarrage.
const ASSET = /\.(svg|png|jpe?g|gif|webp|avif|mp4|webm|css)(\?|$)/i;

if (!process.env.DS_STUDIO_ASSET_HOOKS) {
  process.env.DS_STUDIO_ASSET_HOOKS = '1';
  register(import.meta.url, import.meta.url);
}

export async function resolve(specifier, context, next) {
  if (ASSET.test(specifier))
    return {
      url: new URL(specifier, context.parentURL).href,
      format: 'module',
      shortCircuit: true,
    };
  return next(specifier, context);
}

// La résolution de tsx s'exécute parfois avant la nôtre et renvoie déjà une URL
// de fichier : le chargement est donc couvert aussi, pour ne pas dépendre de
// l'ordre d'enregistrement des crochets.
export async function load(url, context, next) {
  if (ASSET.test(url))
    return {
      format: 'module',
      source: 'export default "";',
      shortCircuit: true,
    };
  return next(url, context);
}
