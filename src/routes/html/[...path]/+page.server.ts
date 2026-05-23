import { error } from '@sveltejs/kit';
import { getManifest, getFileText } from '$lib/drive/manifest';
import { findItem, folderExists, itemsInFolder, type ContentItem } from '$lib/content/manifest';

export const prerender = false;

export async function load({ params, platform }) {
  const manifest = await getManifest(platform);
  const path = params.path;

  const item = findItem(manifest, 'html', path);
  if (item) {
    const source = await getFileText(platform, item.driveId);
    const title = extractTitle(source, path);
    const parentUrl = item.folder ? `/html/${item.folder}` : '/html';
    return {
      mode: 'file' as const,
      html: source,
      title,
      slug: path,
      visibility: item.visibility,
      hasParentListing: item.visibility === 'public' || item.folder !== '',
      parentUrl
    };
  }

  if (folderExists(manifest, 'html', path)) {
    const items: ContentItem[] = itemsInFolder(manifest, 'html', path);
    if (items.length > 0) {
      return { mode: 'folder' as const, items, basePath: path, title: path };
    }
  }

  throw error(404, 'Not found');
}

function extractTitle(html: string, fallback: string): string {
  const m = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  return m ? m[1].replace(/<[^>]+>/g, '').trim() : fallback.split('/').pop() ?? fallback;
}
