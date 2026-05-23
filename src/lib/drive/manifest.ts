/**
 * Walks the Drive folder tree and produces a Manifest. Cached in KV.
 *
 * Drive structure expected:
 *   ROOT/
 *     md/
 *       public/...
 *       private/...
 *     html/
 *       public/...
 *       private/...
 *     pdf/
 *       public/...
 *       private/...
 *
 * Anything else at any level is ignored. Files with unsupported extensions
 * are skipped silently.
 */

import { env } from '$env/dynamic/private';
import { FOLDER_MIME, listChildren, type DriveFile } from './api';
import { cacheGet, cacheSet, cacheDelete } from './cache';
import {
  EMPTY_MANIFEST,
  type ContentItem,
  type Folder,
  type Manifest,
  type Visibility
} from '$lib/content/types';

const MANIFEST_TTL = 300; // 5 minutes
const MANIFEST_KEY = 'drive:manifest:v1';

const EXT: Record<Folder, string> = { md: '.md', html: '.html', pdf: '.pdf' };

function classifyFolder(name: string): Folder | null {
  const n = name.toLowerCase();
  if (n === 'md') return 'md';
  if (n === 'html') return 'html';
  if (n === 'pdf') return 'pdf';
  return null;
}

function classifyVisibility(name: string): Visibility | null {
  const n = name.toLowerCase();
  if (n === 'public') return 'public';
  if (n === 'private') return 'private';
  return null;
}

async function walkFolder(
  folderId: string,
  folder: Folder,
  visibility: Visibility,
  prefix: string,
  out: ContentItem[]
): Promise<void> {
  const children = await listChildren(folderId);
  for (const c of children) {
    if (c.mimeType === FOLDER_MIME) {
      const next = prefix ? `${prefix}/${c.name}` : c.name;
      await walkFolder(c.id, folder, visibility, next, out);
    } else {
      const ext = EXT[folder];
      const lowered = c.name.toLowerCase();
      if (!lowered.endsWith(ext)) continue; // ignore unsupported types
      const baseName = c.name.slice(0, -ext.length);
      const slug = prefix ? `${prefix}/${baseName}` : baseName;
      out.push({
        slug,
        url: `/${folder}/${slug}`,
        visibility,
        folder: prefix,
        name: baseName,
        driveId: c.id
      });
    }
  }
}

async function fetchManifestFromDrive(): Promise<Manifest> {
  const rootId = env.GOOGLE_DRIVE_ROOT_FOLDER_ID;
  if (!rootId) {
    console.warn('[drive] GOOGLE_DRIVE_ROOT_FOLDER_ID not set — returning empty manifest');
    return { ...EMPTY_MANIFEST, builtAt: new Date().toISOString() };
  }

  const manifest: Manifest = {
    md: [],
    html: [],
    pdf: [],
    builtAt: new Date().toISOString()
  };

  const topLevel = await listChildren(rootId);
  for (const folderEntry of topLevel) {
    if (folderEntry.mimeType !== FOLDER_MIME) continue;
    const folder = classifyFolder(folderEntry.name);
    if (!folder) continue;

    const visibilityEntries = await listChildren(folderEntry.id);
    for (const visEntry of visibilityEntries) {
      if (visEntry.mimeType !== FOLDER_MIME) continue;
      const visibility = classifyVisibility(visEntry.name);
      if (!visibility) continue;

      await walkFolder(visEntry.id, folder, visibility, '', manifest[folder]);
    }
  }

  return manifest;
}

/**
 * Returns the manifest. Uses cache when available. Pass `{ force: true }` to
 * bypass cache and refresh.
 */
export async function getManifest(
  platform: App.Platform | undefined,
  options: { force?: boolean } = {}
): Promise<Manifest> {
  if (!options.force) {
    const cached = await cacheGet<Manifest>(platform, MANIFEST_KEY);
    if (cached) return cached;
  }

  try {
    const fresh = await fetchManifestFromDrive();
    await cacheSet(platform, MANIFEST_KEY, fresh, MANIFEST_TTL);
    return fresh;
  } catch (err) {
    console.error('[drive] failed to fetch manifest:', err);
    // graceful degradation: serve stale cache if any, else empty
    const stale = await cacheGet<Manifest>(platform, MANIFEST_KEY);
    return stale ?? { ...EMPTY_MANIFEST, builtAt: new Date(0).toISOString() };
  }
}

/** Invalidate the cached manifest (and any cached file contents). */
export async function invalidateManifest(platform: App.Platform | undefined): Promise<void> {
  await cacheDelete(platform, MANIFEST_KEY);
}

/** Per-file content cache (for md/html). */
const FILE_TTL = 300;
function fileKey(driveId: string): string {
  return `drive:file:${driveId}`;
}

import { downloadText } from './api';

export async function getFileText(
  platform: App.Platform | undefined,
  driveId: string
): Promise<string> {
  const cached = await cacheGet<string>(platform, fileKey(driveId));
  if (cached !== null) return cached;
  const text = await downloadText(driveId);
  await cacheSet(platform, fileKey(driveId), text, FILE_TTL);
  return text;
}
