import { error } from '@sveltejs/kit';
import { getManifest, getFileText } from '$lib/drive/manifest';
import { findItem, folderExists, itemsInFolder, type ContentItem } from '$lib/content/manifest';
import { renderMarkdown } from '$lib/content/markdown';

export const prerender = false;

export async function load({ params, platform }) {
  const manifest = await getManifest(platform);
  const path = params.path;

  // 1) file?
  const item = findItem(manifest, path);
  if (item) {
    const parentUrl = item.folder ? `/docs/${item.folder}` : '/docs';
    const hasParentListing = item.visibility === 'public' || item.folder !== '';

    if (item.kind === 'md') {
      const source = await getFileText(platform, item.driveId, item.modifiedTime);
      const html = await renderMarkdown(source);
      const title = extractMarkdownTitle(source, path);
      return {
        mode: 'file' as const,
        kind: 'md' as const,
        html,
        title,
        slug: path,
        visibility: item.visibility,
        hasParentListing,
        parentUrl
      };
    }

    if (item.kind === 'html') {
      const source = await getFileText(platform, item.driveId, item.modifiedTime);
      const title = extractHtmlTitle(source, path);
      return {
        mode: 'file' as const,
        kind: 'html' as const,
        html: source,
        title,
        slug: path,
        visibility: item.visibility,
        hasParentListing,
        parentUrl
      };
    }

    // pdf
    const title = path.split('/').pop() ?? path;
    return {
      mode: 'file' as const,
      kind: 'pdf' as const,
      url: `/api/drive-file/${item.driveId}`,
      title,
      slug: path,
      visibility: item.visibility,
      hasParentListing,
      parentUrl
    };
  }

  // 2) folder? Inside a folder we show ALL items (public + private).
  if (folderExists(manifest, path)) {
    const items: ContentItem[] = itemsInFolder(manifest, path);
    if (items.length > 0) {
      return { mode: 'folder' as const, items, basePath: path, title: path };
    }
  }

  throw error(404, 'Not found');
}

function extractMarkdownTitle(md: string, fallback: string): string {
  const m = md.match(/^#\s+(.+)$/m);
  return m ? m[1].trim() : (fallback.split('/').pop() ?? fallback);
}

function extractHtmlTitle(html: string, fallback: string): string {
  const m = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  return m ? m[1].replace(/<[^>]+>/g, '').trim() : (fallback.split('/').pop() ?? fallback);
}
