/**
 * Lightweight endpoint the browser polls to know if the Drive manifest has
 * changed. Reads through the same cache layer as everything else — the cache
 * itself drives the refresh cadence.
 */

import type { RequestHandler } from './$types';
import { getManifest } from '$lib/drive/manifest';

export const prerender = false;

export const GET: RequestHandler = async ({ platform }) => {
  const manifest = await getManifest(platform);
  return new Response(
    JSON.stringify({ builtAt: manifest.builtAt, revisionTag: manifest.revisionTag }),
    {
      headers: {
        'content-type': 'application/json',
        'cache-control': 'no-store'
      }
    }
  );
};
