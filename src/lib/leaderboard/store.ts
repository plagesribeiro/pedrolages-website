import type { GameId, ScoreEntry } from './types';
import { MAX_ENTRIES, sanitizeName } from './types';

const KEY_PREFIX = 'leaderboard:v1:';

// In-memory fallback used in `vite dev` (when there's no Cloudflare KV).
// Persisted only for the lifetime of the dev server process.
const memory = new Map<string, ScoreEntry[]>();

function key(game: GameId) {
  return `${KEY_PREFIX}${game}`;
}

export async function readScores(platform: App.Platform | undefined, game: GameId): Promise<ScoreEntry[]> {
  const kv = platform?.env?.SCORES;
  if (kv) {
    const raw = await kv.get(key(game), 'json');
    return Array.isArray(raw) ? (raw as ScoreEntry[]) : [];
  }
  return memory.get(game) ?? [];
}

export async function writeScores(
  platform: App.Platform | undefined,
  game: GameId,
  list: ScoreEntry[]
): Promise<void> {
  const kv = platform?.env?.SCORES;
  if (kv) {
    await kv.put(key(game), JSON.stringify(list));
    return;
  }
  memory.set(game, list);
}

export async function submitScore(
  platform: App.Platform | undefined,
  game: GameId,
  name: string,
  score: number
): Promise<ScoreEntry[]> {
  const cleanName = sanitizeName(name);
  const safeScore = Math.max(0, Math.min(1_000_000, Math.floor(Number(score) || 0)));
  const entry: ScoreEntry = { name: cleanName, score: safeScore, ts: Date.now() };
  const list = await readScores(platform, game);
  list.push(entry);
  list.sort((a, b) => b.score - a.score || a.ts - b.ts);
  const trimmed = list.slice(0, MAX_ENTRIES);
  await writeScores(platform, game, trimmed);
  return trimmed;
}
