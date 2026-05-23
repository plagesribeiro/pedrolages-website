<script lang="ts">
  import { onMount } from 'svelte';
  import type { GameId, ScoreEntry } from '$lib/leaderboard/types';
  import { fetchScores } from '$lib/leaderboard/client';
  import { tt } from '$lib/i18n';
  import { Trophy } from '@lucide/svelte';

  export let game: GameId;
  export let scores: ScoreEntry[] = [];
  export let highlightTs: number | null = null;
  export let title = '';
  $: titleText = title || $tt({ pt: 'recordes', en: 'high scores' });

  let loading = true;

  export async function refresh() {
    loading = true;
    scores = await fetchScores(game);
    loading = false;
  }

  onMount(() => {
    refresh();
  });

  function timeAgo(ts: number): string {
    const diff = Date.now() - ts;
    const min = Math.floor(diff / 60000);
    if (min < 1) return $tt({ pt: 'agora', en: 'now' });
    if (min < 60) return `${min}m`;
    const h = Math.floor(min / 60);
    if (h < 24) return `${h}h`;
    const d = Math.floor(h / 24);
    return `${d}d`;
  }
</script>

<aside class="w-full max-w-[600px] rounded-xl border border-zinc-800 bg-zinc-950/60 p-4 backdrop-blur">
  <header class="mb-3 flex items-center gap-2">
    <Trophy class="h-4 w-4 text-amber-300" />
    <h3 class="font-pixel text-[11px] tracking-wider text-zinc-300">{titleText.toUpperCase()}</h3>
    {#if scores[0]}
      <span class="ml-auto text-[10px] font-mono text-zinc-500">
        {$tt({ pt: 'líder', en: 'leader' })}: <span class="text-[color:var(--color-gb-light)]">{scores[0].name}</span>
      </span>
    {/if}
  </header>

  {#if loading && scores.length === 0}
    <p class="py-4 text-center font-mono text-xs text-zinc-600">{$tt({ pt: 'carregando...', en: 'loading...' })}</p>
  {:else if scores.length === 0}
    <p class="py-4 text-center font-mono text-xs text-zinc-600">
      {$tt({ pt: 'ninguém ainda. seja o primeiro 👑', en: 'nobody yet. be the first 👑' })}
    </p>
  {:else}
    <ol class="space-y-1 font-mono text-sm">
      {#each scores as entry, i (entry.ts + entry.name)}
        <li
          class="flex items-center justify-between rounded-md px-2 py-1.5 transition {highlightTs === entry.ts
            ? 'bg-[color:var(--color-gb-green)]/15 text-[color:var(--color-gb-light)]'
            : 'text-zinc-300 odd:bg-zinc-900/40'}"
        >
          <span class="flex items-center gap-3">
            <span class="w-6 text-right text-xs {i < 3 ? 'text-amber-300' : 'text-zinc-500'}">
              {i + 1}.
            </span>
            <span class="font-medium">{entry.name}</span>
          </span>
          <span class="flex items-center gap-3">
            <span class="text-xs text-zinc-500">{timeAgo(entry.ts)}</span>
            <span class="font-pixel text-[11px] text-[color:var(--color-gb-light)]">{entry.score}</span>
          </span>
        </li>
      {/each}
    </ol>
  {/if}
</aside>
