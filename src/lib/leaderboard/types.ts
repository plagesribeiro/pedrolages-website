export type GameId = 'snake' | 'tokens' | 'pong' | 'bugs';

export interface ScoreEntry {
  name: string;
  score: number;
  ts: number;
}

export const MAX_ENTRIES = 10;
export const MAX_NAME_LEN = 14;

export const GAMES: Record<GameId, { label: string; sortDesc: boolean }> = {
  snake: { label: 'snake', sortDesc: true },
  tokens: { label: 'token catcher', sortDesc: true },
  pong: { label: 'pong vs ai', sortDesc: true },
  bugs: { label: 'whack-a-bug', sortDesc: true }
};

export function isValidGame(g: string): g is GameId {
  return g === 'snake' || g === 'tokens' || g === 'pong' || g === 'bugs';
}

export function sanitizeName(raw: string): string {
  return (
    String(raw ?? '')
      .replace(/[^\p{L}\p{N}_\-\.@ ]/gu, '')
      .trim()
      .slice(0, MAX_NAME_LEN) || 'anon'
  );
}

export function qualifies(score: number, list: ScoreEntry[]): boolean {
  if (list.length < MAX_ENTRIES) return score > 0;
  return score > list[list.length - 1].score;
}
