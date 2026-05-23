/**
 * Pure helpers that operate on a Manifest. Same functions are used:
 *   - server-side, with a Manifest fetched fresh from Drive (or KV cache)
 *   - client-side, with a Manifest provided via Svelte store (populated by
 *     the layout server load)
 *
 * The manifest is a single flat list of items (md/html/pdf, public+private)
 * — kind is decided by file extension, not by parent folder.
 */

import type { ContentItem, Kind, Manifest, Visibility } from './types';

export type { ContentItem, Kind, Manifest, Visibility } from './types';

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

export function allItems(manifest: Manifest): ContentItem[] {
  return dedupe(manifest.items);
}

export function publicItems(manifest: Manifest): ContentItem[] {
  return allItems(manifest).filter((i) => i.visibility === 'public');
}

export function publicSlugs(manifest: Manifest): string[] {
  return publicItems(manifest).map((i) => i.slug);
}

export function findItem(manifest: Manifest, slug: string): ContentItem | null {
  return allItems(manifest).find((i) => i.slug === slug) ?? null;
}

export function folderExists(manifest: Manifest, folderPath: string): boolean {
  if (folderPath === '') return true;
  return allItems(manifest).some(
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
  folderPath: string
): { name: string; isDir: boolean; slug: string; kind?: Kind }[] {
  const items = folderPath === '' ? publicItems(manifest) : allItems(manifest);
  const prefix = folderPath ? folderPath + '/' : '';
  const seenDirs = new Set<string>();
  const out: { name: string; isDir: boolean; slug: string; kind?: Kind }[] = [];
  for (const item of items) {
    if (item.folder !== folderPath && !item.folder.startsWith(prefix)) continue;
    if (item.folder === folderPath) {
      out.push({ name: item.name, isDir: false, slug: item.slug, kind: item.kind });
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
export function itemsInFolder(manifest: Manifest, folderPath: string): ContentItem[] {
  return allItems(manifest).filter(
    (i) => i.folder === folderPath || i.folder.startsWith(folderPath + '/')
  );
}
