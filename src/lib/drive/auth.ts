/**
 * Google service account auth — signs an RS256 JWT and exchanges it for an
 * OAuth2 access token (1h lifetime). Runs in Cloudflare Workers via Web Crypto.
 *
 * Caches the token in module-scope memory per Worker isolate. Cold start =
 * one JWT sign + one HTTP roundtrip (~200ms). Warm = instant.
 */

import { env } from '$env/dynamic/private';

interface ServiceAccount {
  client_email: string;
  private_key: string;
  token_uri: string;
}

let cachedSA: ServiceAccount | null = null;
let cachedToken: { token: string; expiresAt: number } | null = null;

function decodeServiceAccount(): ServiceAccount {
  if (cachedSA) return cachedSA;
  const b64 = env.GOOGLE_DRIVE_SERVICE_ACCOUNT_KEY;
  if (!b64) throw new Error('GOOGLE_DRIVE_SERVICE_ACCOUNT_KEY is not set');
  const json = typeof atob === 'function' ? atob(b64) : Buffer.from(b64, 'base64').toString('utf-8');
  const sa = JSON.parse(json) as ServiceAccount;
  if (!sa.client_email || !sa.private_key) {
    throw new Error('Service account JSON missing client_email or private_key');
  }
  cachedSA = sa;
  return sa;
}

function base64UrlEncodeStr(str: string): string {
  return btoa(unescape(encodeURIComponent(str)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function base64UrlEncodeBytes(bytes: Uint8Array): string {
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function pemToArrayBuffer(pem: string): ArrayBuffer {
  const b64 = pem
    .replace(/-----BEGIN [A-Z ]+-----/, '')
    .replace(/-----END [A-Z ]+-----/, '')
    .replace(/\s+/g, '');
  const bin = atob(b64);
  const buf = new ArrayBuffer(bin.length);
  const view = new Uint8Array(buf);
  for (let i = 0; i < bin.length; i++) view[i] = bin.charCodeAt(i);
  return buf;
}

async function signJwt(sa: ServiceAccount): Promise<string> {
  const header = { alg: 'RS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const claim = {
    iss: sa.client_email,
    scope: 'https://www.googleapis.com/auth/drive.readonly',
    aud: sa.token_uri || 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now
  };
  const data = `${base64UrlEncodeStr(JSON.stringify(header))}.${base64UrlEncodeStr(JSON.stringify(claim))}`;

  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    pemToArrayBuffer(sa.private_key),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const sig = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    new TextEncoder().encode(data)
  );

  return `${data}.${base64UrlEncodeBytes(new Uint8Array(sig))}`;
}

/**
 * Returns a valid Google OAuth2 access token (Drive readonly scope).
 * Cached per Worker isolate until ~1min before expiry.
 */
export async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return cachedToken.token;
  }

  const sa = decodeServiceAccount();
  const jwt = await signJwt(sa);

  const body = new URLSearchParams({
    grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
    assertion: jwt
  });

  const res = await fetch(sa.token_uri || 'https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`Google token exchange failed: ${res.status} ${txt}`);
  }

  const data = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000
  };
  return data.access_token;
}
