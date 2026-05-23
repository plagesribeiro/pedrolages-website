/**
 * Proxies a Drive file through our Worker. The SA token never leaves the
 * server — the browser only ever sees /api/drive-file/<id>.
 *
 * The Drive file ID is not a secret: knowing the ID does not grant access
 * (you'd need the SA token to fetch it from Drive). So exposing it in URLs
 * is fine.
 */

import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { downloadFile } from '$lib/drive/api';

export const prerender = false;

export const GET: RequestHandler = async ({ params }) => {
  const { fileId } = params;
  if (!fileId || !/^[A-Za-z0-9_-]+$/.test(fileId)) {
    throw error(400, 'invalid file id');
  }

  let upstream: Response;
  try {
    upstream = await downloadFile(fileId);
  } catch {
    throw error(404, 'file not found');
  }

  const contentType =
    upstream.headers.get('content-type') ?? 'application/octet-stream';
  const contentLength = upstream.headers.get('content-length');

  const headers: Record<string, string> = {
    'content-type': contentType,
    // safe to cache aggressively — Drive returns a new file id when the file
    // is replaced, so the URL changes too.
    'cache-control': 'public, max-age=3600',
    'content-disposition': 'inline'
  };
  if (contentLength) headers['content-length'] = contentLength;

  return new Response(upstream.body, { headers });
};
