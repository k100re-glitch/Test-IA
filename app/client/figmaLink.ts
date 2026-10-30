// Lecture d'un lien Figma de composant.
//
// On n'y touche pas à Figma : on vérifie seulement que le lien collé est bien
// celui d'un nœud précis, et on en extrait la clé de fichier et l'identifiant
// du nœud. C'est ce couple qu'une intégration réelle utiliserait ; ici il sert
// à montrer ce qui serait lu, et à refuser tout de suite un lien qui ne
// désigne aucun composant.

export interface FigmaTarget {
  fileKey: string;
  nodeId: string;
}

const HOSTS = new Set(['figma.com', 'www.figma.com']);
// Les deux formes en circulation : /design/<clé>/<nom> aujourd'hui,
// /file/<clé>/<nom> dans les liens plus anciens.
const PATH = /^\/(?:design|file|proto)\/([A-Za-z0-9]{10,64})(?:\/|$)/;

export function parseFigmaLink(raw: string): FigmaTarget {
  const trimmed = raw.trim();
  if (!trimmed) throw new Error('Collez le lien Figma du composant.');
  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    throw new Error('Ce n’est pas un lien : il manque « https:// ».');
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:')
    throw new Error('Lien Figma attendu, en https.');
  if (!HOSTS.has(url.hostname))
    throw new Error(`Lien ${url.hostname} : un lien figma.com est attendu.`);
  const path = PATH.exec(url.pathname);
  if (!path)
    throw new Error('Ce lien ne désigne pas un fichier Figma.');
  // Figma écrit « 12-34 » dans l'URL et « 12:34 » dans son API ; les deux
  // formes circulent selon l'endroit où le lien a été copié.
  const node = url.searchParams.get('node-id');
  if (!node)
    throw new Error(
      'Lien du fichier, pas du composant. Copiez le lien d’un calque sélectionné.',
    );
  const nodeId = node.replace(/-/g, ':');
  if (!/^\d+:\d+$/.test(nodeId))
    throw new Error(`Identifiant de nœud illisible : « ${node} ».`);
  return { fileKey: path[1], nodeId };
}

// Un nom de repli quand Figma n'est pas interrogé : le nom du fichier est dans
// l'URL, pas celui du composant. Mieux vaut un nom neutre tiré du nœud qu'un
// nom inventé qui aurait l'air d'avoir été lu.
export function fallbackName(target: FigmaTarget): string {
  return `node-${target.nodeId.replace(':', '-')}`;
}
