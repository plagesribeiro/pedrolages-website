import type { GameId, ScoreEntry } from './types';

export async function fetchScores(game: GameId, fetchFn: typeof fetch = fetch): Promise<ScoreEntry[]> {
  try {
    const res = await fetchFn(`/api/scores/${game}`);
    if (!res.ok) return [];
    const json = (await res.json()) as { scores?: ScoreEntry[] };
    return json.scores ?? [];
  } catch {
    return [];
  }
}

export async function postScore(game: GameId, name: string, score: number): Promise<ScoreEntry[]> {
  try {
    const res = await fetch(`/api/scores/${game}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name, score })
    });
    if (!res.ok) return [];
    const json = (await res.json()) as { scores?: ScoreEntry[] };
    return json.scores ?? [];
  } catch {
    return [];
  }
}

const NAME_KEY = 'leaderboard-name';
export function rememberName(name: string) {
  try {
    localStorage.setItem(NAME_KEY, name);
  } catch {}
}
export function rememberedName(): string {
  try {
    return localStorage.getItem(NAME_KEY) ?? '';
  } catch {
    return '';
  }
}
