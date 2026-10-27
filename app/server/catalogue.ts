import { promises as fs } from 'node:fs';
import path from 'node:path';
import { z } from 'zod';
import { tokensSchema, type Tokens } from '../shared/model.js';

// Catalogue des design systems proposables. Les fichiers sont choisis par
// l'étudiant dans son workspace ; aucun chemin n'est construit à partir d'une
// requête HTTP. L'identifiant reçu est comparé à la liste réelle du dossier,
// et c'est le nom de fichier listé qui est lu.
const entrySchema = z
  .object({
    name: z.string().min(1).max(60),
    description: z.string().max(200).default(''),
    tokens: tokensSchema,
  })
  .strict();

export interface DesignSystem {
  id: string;
  name: string;
  description: string;
  tokens: Tokens;
}

// Un identifiant sûr : pas de séparateur, pas de point, donc pas de remontée.
const safeId = /^[a-z0-9][a-z0-9-]{0,39}$/;

export class Catalogue {
  private directory: string;
  constructor(root: string) {
    this.directory = path.join(root, 'workspace', 'design-systems');
  }
  // Un fichier illisible ou invalide est ignoré, jamais réparé ni supprimé :
  // un DS cassé ne doit pas empêcher les autres d'être proposés.
  async list(): Promise<DesignSystem[]> {
    let names: string[];
    try {
      names = await fs.readdir(this.directory);
    } catch {
      return [];
    }
    const found: DesignSystem[] = [];
    for (const file of names.sort()) {
      if (!file.endsWith('.json')) continue;
      const id = file.slice(0, -'.json'.length);
      if (!safeId.test(id)) continue;
      const full = path.join(this.directory, file);
      try {
        const stat = await fs.lstat(full);
        if (!stat.isFile() || stat.isSymbolicLink() || stat.size > 64_000)
          continue;
        const parsed = entrySchema.parse(JSON.parse(await fs.readFile(full, 'utf8')));
        found.push({ id, ...parsed });
      } catch {
        continue;
      }
    }
    return found;
  }
  async find(id: unknown): Promise<DesignSystem | undefined> {
    if (typeof id !== 'string' || !safeId.test(id)) return undefined;
    return (await this.list()).find((d) => d.id === id);
  }
}
