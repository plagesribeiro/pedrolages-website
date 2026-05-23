<script lang="ts">
  import type { GameId, ScoreEntry } from '$lib/leaderboard/types';
  import { qualifies } from '$lib/leaderboard/types';
  import Leaderboard from './Leaderboard.svelte';
  import ScoreSubmit from './ScoreSubmit.svelte';
  import { tt } from '$lib/i18n';
  import { ArrowLeft } from '@lucide/svelte';

  export let game: GameId;
  export let title: string;
  export let titleClass = 'text-[color:var(--color-gb-light)] glow-green';
  export let blurb: string = '';

  let scores: ScoreEntry[] = [];
  let leaderboard: Leaderboard;
  let submitOpen = false;
  let submitScore = 0;
  let highlightTs: number | null = null;

  export async function handleGameOver(score: number) {
    if (!scores.length && leaderboard) await leaderboard.refresh();
    if (qualifies(score, scores)) {
      submitScore = score;
      submitOpen = true;
    }
  }

  function onSubmitted(e: CustomEvent<{ scores: ScoreEntry[]; ts: number; name: string }>) {
    scores = e.detail.scores;
    highlightTs = e.detail.ts;
    setTimeout(() => (highlightTs = null), 6000);
  }
</script>

<main class="min-h-screen px-4 py-8 sm:px-6 sm:py-12">
  <a
    href="/games"
    class="mb-6 inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-100"
  >
    <ArrowLeft class="h-3.5 w-3.5" /> {$tt({ pt: 'arcade', en: 'arcade' })}
  </a>

  <header class="text-center">
    <h1 class="font-pixel text-2xl {titleClass}">{title}</h1>
    {#if blurb}
      <p class="mt-1 text-xs text-zinc-500">{blurb}</p>
    {/if}
  </header>

  <div class="mx-auto mt-10 flex max-w-[720px] flex-col items-center gap-8">
    <slot {handleGameOver} />

    <Leaderboard bind:this={leaderboard} bind:scores {game} {highlightTs} />
  </div>
</main>

<ScoreSubmit bind:open={submitOpen} {game} score={submitScore} on:submitted={onSubmitted} />
