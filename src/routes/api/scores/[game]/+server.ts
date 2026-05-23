import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { isValidGame } from '$lib/leaderboard/types';
import { readScores, submitScore } from '$lib/leaderboard/store';

export const prerender = false;

export const GET: RequestHandler = async ({ params, platform }) => {
  if (!isValidGame(params.game)) throw error(404, 'unknown game');
  const list = await readScores(platform, params.game);
  return json({ scores: list }, { headers: { 'cache-control': 'public, max-age=10' } });
};

export const POST: RequestHandler = async ({ params, request, platform }) => {
  if (!isValidGame(params.game)) throw error(404, 'unknown game');
  let body: { name?: string; score?: number };
  try {
    body = await request.json();
  } catch {
    throw error(400, 'invalid json');
  }
  if (typeof body.name !== 'string' || typeof body.score !== 'number') {
    throw error(400, 'name and score required');
  }
  const list = await submitScore(platform, params.game, body.name, body.score);
  return json({ scores: list });
};
