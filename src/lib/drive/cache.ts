/**
 * Two-layer cache: Cloudflare KV (when on Pages) + module-scope memory
 * (fallback for `vite dev` where no KV is bound). The memory cache also
 * accelerates same-isolate reads in production.
 */

type Entry = { value: unknown; expiresAt: number };

const mem = new Map<string, Entry>();

function memGet<T>(key: string): T | null {
  const e = mem.get(key);
  if (!e) return null;
  if (e.expiresAt < Date.now()) {
    mem.delete(key);
    return null;
  }
  return e.value as T;
}
function memSet(key: string, value: unknown, ttlSeconds: number) {
  mem.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
}

export async function cacheGet<T>(
  platform: App.Platform | undefined,
  key: string
): Promise<T | null> {
  const hit = memGet<T>(key);
  if (hit !== null) return hit;

  const kv = platform?.env?.CONTENT_CACHE;
  if (!kv) return null;
  try {
    const v = await kv.get(key, 'json');
    if (v !== null) memSet(key, v, 60); // mirror in memory briefly
    return (v ?? null) as T | null;
  } catch {
    return null;
  }
}

export async function cacheSet(
  platform: App.Platform | undefined,
  key: string,
  value: unknown,
  ttlSeconds = 300
): Promise<void> {
  memSet(key, value, ttlSeconds);
  const kv = platform?.env?.CONTENT_CACHE;
  if (!kv) return;
  try {
    await kv.put(key, JSON.stringify(value), { expirationTtl: ttlSeconds });
  } catch {
    /* swallow — memory cache still serves */
  }
}

export async function cacheDelete(platform: App.Platform | undefined, key: string): Promise<void> {
  mem.delete(key);
  const kv = platform?.env?.CONTENT_CACHE;
  if (!kv) return;
  try {
    await kv.delete(key);
  } catch {}
}
