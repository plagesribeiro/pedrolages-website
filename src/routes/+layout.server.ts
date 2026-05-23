import resume from '$lib/data/resume.json';
import { getManifest } from '$lib/drive/manifest';
import type { Resume } from '$lib/data/types';

// Disable prerendering at the layout level because the manifest is dynamic.
// Individual static pages (about, games, contact, ...) can still opt back in
// via `export const prerender = true` if they don't touch the manifest.
export const prerender = false;
export const trailingSlash = 'never';

export async function load({ platform }) {
  const manifest = await getManifest(platform);
  return { resume: resume as Resume, manifest };
}
