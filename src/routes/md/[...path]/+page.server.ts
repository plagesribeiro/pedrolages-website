import { error } from '@sveltejs/kit';
import { getManifest, getFileText } from '$lib/drive/manifest';
import { findItem, folderExists, itemsInFolder, type ContentItem } from '$lib/content/manifest';
import { renderMarkdown } from '$lib/content/markdown';

export const prerender = false;

export async function load({ params, platform }) {
  const manifest = await getManifest(platform);
  const path = params.path;

  // 1) file?
  const item = findItem(manifest, 'md', path);
  if (item) {
    const source = await getFileText(platform, item.driveId);
    const html = await renderMarkdown(source);
    const title = extractTitle(source, path);
    const parentUrl = item.folder ? `/md/${item.folder}` : '/md';
    return {
      mode: 'file' as const,
      html,
      title,
      slug: path,
      visibility: item.visibility,
      hasParentListing: item.visibility === 'public' || item.folder !== '',
      parentUrl
    };
  }

  // 2) folder? Inside a folder we show ALL items (fake-private).
  if (folderExists(manifest, 'md', path)) {
    const items: ContentItem[] = itemsInFolder(manifest, 'md', path);
    if (items.length > 0) {
      return { mode: 'folder' as const, items, basePath: path, title: path };
    }
  }

  throw error(404, 'Not found');
}

function extractTitle(md: string, fallback: string): string {
  const m = md.match(/^#\s+(.+)$/m);
  return m ? m[1].trim() : (fallback.split('/').pop() ?? fallback);
}
