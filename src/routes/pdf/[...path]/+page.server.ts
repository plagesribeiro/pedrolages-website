import { error } from '@sveltejs/kit';
import { getManifest } from '$lib/drive/manifest';
import { findItem, folderExists, itemsInFolder, type ContentItem } from '$lib/content/manifest';

export const prerender = false;

export async function load({ params, platform }) {
  const manifest = await getManifest(platform);
  const path = params.path;

  const item = findItem(manifest, 'pdf', path);
  if (item) {
    const title = path.split('/').pop() ?? path;
    const parentUrl = item.folder ? `/pdf/${item.folder}` : '/pdf';
    return {
      mode: 'file' as const,
      // proxy through our worker — the SA token never leaves the server
      url: `/api/drive-file/${item.driveId}`,
      title,
      slug: path,
      visibility: item.visibility,
      hasParentListing: item.visibility === 'public' || item.folder !== '',
      parentUrl
    };
  }

  if (folderExists(manifest, 'pdf', path)) {
    const items: ContentItem[] = itemsInFolder(manifest, 'pdf', path);
    if (items.length > 0) {
      return { mode: 'folder' as const, items, basePath: path, title: path };
    }
  }

  throw error(404, 'Not found');
}
