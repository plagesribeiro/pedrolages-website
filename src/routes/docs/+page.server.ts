import { getManifest } from '$lib/drive/manifest';
import { publicItems } from '$lib/content/manifest';

export const prerender = false;

export async function load({ platform }) {
  const manifest = await getManifest(platform);
  return { items: publicItems(manifest) };
}
