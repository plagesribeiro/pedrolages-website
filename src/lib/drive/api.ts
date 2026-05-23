/**
 * Thin wrapper over Drive v3 endpoints. All calls auto-authenticate.
 */

import { getAccessToken } from './auth';

export const FOLDER_MIME = 'application/vnd.google-apps.folder';

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
}

async function authHeaders(): Promise<HeadersInit> {
  const token = await getAccessToken();
  return { Authorization: `Bearer ${token}` };
}

/** Lists every non-trashed item inside `folderId`. Handles pagination. */
export async function listChildren(folderId: string): Promise<DriveFile[]> {
  const out: DriveFile[] = [];
  let pageToken: string | undefined;
  const headers = await authHeaders();

  do {
    const q = encodeURIComponent(`'${folderId}' in parents and trashed=false`);
    const fields = encodeURIComponent('nextPageToken,files(id,name,mimeType)');
    let url = `https://www.googleapis.com/drive/v3/files?q=${q}&fields=${fields}&pageSize=1000`;
    if (pageToken) url += `&pageToken=${encodeURIComponent(pageToken)}`;

    const res = await fetch(url, { headers });
    if (!res.ok) {
      const txt = await res.text().catch(() => '');
      throw new Error(`Drive list failed (${res.status}): ${txt}`);
    }
    const data = (await res.json()) as { files: DriveFile[]; nextPageToken?: string };
    out.push(...data.files);
    pageToken = data.nextPageToken;
  } while (pageToken);

  return out;
}

/** Downloads the raw bytes of a Drive file. */
export async function downloadFile(fileId: string): Promise<Response> {
  const headers = await authHeaders();
  const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
  const res = await fetch(url, { headers });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`Drive download failed (${res.status}): ${txt}`);
  }
  return res;
}

/** Downloads a Drive file as text (assumes UTF-8). */
export async function downloadText(fileId: string): Promise<string> {
  const res = await downloadFile(fileId);
  return res.text();
}
