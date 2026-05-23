/**
 * Walks the Drive folder tree and produces a Manifest. Cached in KV.
 *
 * Drive structure expected:
 *   ROOT/
 *     public/...   any depth, any layout
 *     private/...  any depth, any layout
 *
 * Anything else at the root is ignored. File kind comes from the extension
 * (.md / .html / .pdf); other extensions are skipped silently.
 */

import { env } from '$env/dynamic/private';
import { FOLDER_MIME, downloadText, listChildren } from './api';
import { cacheGet, cacheSet, cacheDelete } from './cache';
import {
  EMPTY_MANIFEST,
  type ContentItem,
  type Kind,
  type Manifest,
  type Visibility
} from '$lib/content/types';

const MANIFEST_TTL = 15; // seconds — short TTL drives the "real-time" feel
const MANIFEST_KEY = 'drive:manifest:v2';

function kindFromExtension(name: string): Kind | null {
  const lower = name.toLowerCase();
  if (lower.endsWith('.md')) return 'md';
  if (lower.endsWith('.html')) return 'html';
  if (lower.endsWith('.pdf')) return 'pdf';
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
  visibility: Visibility,
  prefix: string,
  out: ContentItem[]
): Promise<void> {
  const children = await listChildren(folderId);
  for (const c of children) {
    if (c.mimeType === FOLDER_MIME) {
      const next = prefix ? `${prefix}/${c.name}` : c.name;
      await walkFolder(c.id, visibility, next, out);
    } else {
      const kind = kindFromExtension(c.name);
      if (!kind) continue; // ignore unsupported types
      const slug = prefix ? `${prefix}/${c.name}` : c.name;
      out.push({
        slug,
        url: `/docs/${slug}`,
        kind,
        visibility,
        folder: prefix,
        name: c.name,
        driveId: c.id,
        modifiedTime: c.modifiedTime
      });
    }
  }
}

/** FNV-1a 32-bit hex hash. Deterministic, not cryptographic. */
function fnv1a(input: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = (hash + ((hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24))) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

function computeRevisionTag(items: ContentItem[]): string {
  const fingerprint = [...items]
    .sort((a, b) => a.slug.localeCompare(b.slug))
    .map((i) => `${i.visibility}:${i.slug}:${i.driveId}:${i.modifiedTime}`)
    .join('|');
  return fnv1a(fingerprint);
}

async function fetchManifestFromDrive(): Promise<Manifest> {
  const rootId = env.GOOGLE_DRIVE_ROOT_FOLDER_ID;
  if (!rootId) {
    console.warn('[drive] GOOGLE_DRIVE_ROOT_FOLDER_ID not set — returning empty manifest');
    return { ...EMPTY_MANIFEST, builtAt: new Date().toISOString() };
  }

  const items: ContentItem[] = [];

  const topLevel = await listChildren(rootId);
  for (const entry of topLevel) {
    if (entry.mimeType !== FOLDER_MIME) continue;
    const visibility = classifyVisibility(entry.name);
    if (!visibility) continue;
    await walkFolder(entry.id, visibility, '', items);
  }

  return {
    items,
    builtAt: new Date().toISOString(),
    revisionTag: computeRevisionTag(items)
  };
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

/** Invalidate the cached manifest. */
export async function invalidateManifest(platform: App.Platform | undefined): Promise<void> {
  await cacheDelete(platform, MANIFEST_KEY);
}

/**
 * Per-file content cache (for md/html). Cache key includes `modifiedTime`
 * so any edit invalidates without waiting for TTL.
 */
const FILE_TTL = 60;
function fileKey(driveId: string, modifiedTime: string): string {
  return `drive:file:${driveId}:${modifiedTime}`;
}

export async function getFileText(
  platform: App.Platform | undefined,
  driveId: string,
  modifiedTime: string
): Promise<string> {
  const key = fileKey(driveId, modifiedTime);
  const cached = await cacheGet<string>(platform, key);
  if (cached !== null) return cached;
  const text = await downloadText(driveId);
  await cacheSet(platform, key, text, FILE_TTL);
  return text;
}
