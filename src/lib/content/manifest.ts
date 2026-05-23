/**
 * Pure helpers that operate on a Manifest. Same functions are used:
 *   - server-side, with a Manifest fetched fresh from Drive (or KV cache)
 *   - client-side, with a Manifest provided via Svelte store (populated by
 *     the layout server load)
 *
 * No I/O, no globs, no env reads. Just data filtering.
 */

import type { ContentItem, Folder, Manifest, Visibility } from './types';

export type { ContentItem, Folder, Manifest, Visibility } from './types';

function dedupe(items: ContentItem[]): ContentItem[] {
  // public wins over private when slug collides
  const sorted = [...items].sort((a, b) =>
    a.visibility === b.visibility ? 0 : a.visibility === 'public' ? -1 : 1
  );
  const seen = new Set<string>();
  const out: ContentItem[] = [];
  for (const item of sorted) {
    if (seen.has(item.slug)) continue;
    seen.add(item.slug);
    out.push(item);
  }
  return out.sort((a, b) => a.slug.localeCompare(b.slug));
}

export function allItems(manifest: Manifest, folder: Folder): ContentItem[] {
  return dedupe(manifest[folder]);
}

export function publicItems(manifest: Manifest, folder: Folder): ContentItem[] {
  return allItems(manifest, folder).filter((i) => i.visibility === 'public');
}

export function publicSlugs(manifest: Manifest, folder: Folder): string[] {
  return publicItems(manifest, folder).map((i) => i.slug);
}

export function findItem(manifest: Manifest, folder: Folder, slug: string): ContentItem | null {
  return allItems(manifest, folder).find((i) => i.slug === slug) ?? null;
}

export function folderExists(manifest: Manifest, folder: Folder, folderPath: string): boolean {
  if (folderPath === '') return true;
  return allItems(manifest, folder).some(
    (i) => i.folder === folderPath || i.folder.startsWith(folderPath + '/')
  );
}

/**
 * Children of a folder for terminal `ls`.
 * - Root (folderPath === ''): only public items (same rule as the index page).
 * - Sub-folder: ALL items (public + private). "Private" only hides from the
 *   root listing; once you're inside a folder via the link, everything shows.
 */
export function listFolderChildren(
  manifest: Manifest,
  folder: Folder,
  folderPath: string
): { name: string; isDir: boolean; slug: string }[] {
  const items = folderPath === '' ? publicItems(manifest, folder) : allItems(manifest, folder);
  const prefix = folderPath ? folderPath + '/' : '';
  const seenDirs = new Set<string>();
  const out: { name: string; isDir: boolean; slug: string }[] = [];
  for (const item of items) {
    if (item.folder !== folderPath && !item.folder.startsWith(prefix)) continue;
    if (item.folder === folderPath) {
      out.push({ name: item.name, isDir: false, slug: item.slug });
    } else {
      const rest = item.folder.slice(prefix.length);
      const firstSeg = rest.split('/')[0];
      if (firstSeg && !seenDirs.has(firstSeg)) {
        seenDirs.add(firstSeg);
        out.push({
          name: firstSeg,
          isDir: true,
          slug: `${folderPath ? folderPath + '/' : ''}${firstSeg}`
        });
      }
    }
  }
  return out.sort((a, b) => Number(b.isDir) - Number(a.isDir) || a.name.localeCompare(b.name));
}

/** Items in a specific folder (recursive). Used by folder routes. */
export function itemsInFolder(
  manifest: Manifest,
  folder: Folder,
  folderPath: string
): ContentItem[] {
  return allItems(manifest, folder).filter(
    (i) => i.folder === folderPath || i.folder.startsWith(folderPath + '/')
  );
}
