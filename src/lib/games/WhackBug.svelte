<script context="module" lang="ts">
  function popIn(node: HTMLElement) {
    return {
      duration: 180,
      css: (t: number) => `transform: scale(${0.6 + 0.4 * t}); opacity: ${t}`
    };
  }
</script>

<script lang="ts">
  import { onMount } from 'svelte';
  import { RotateCcw, Bug } from '@lucide/svelte';
  import { tt } from '$lib/i18n';

  export let onGameOver: (score: number) => void = () => {};

  const HOLES = 9;
  const DURATION = 30;

  type Critter = { type: 'bug' | 'feature'; until: number } | null;

  let board: Critter[] = Array(HOLES).fill(null);
  let score = 0;
  let highScore = 0;
  let timeLeft = DURATION;
  let running = false;
  let smashed: Record<number, number> = {};
  let timerId: ReturnType<typeof setInterval> | null = null;
  let spawnId: ReturnType<typeof setInterval> | null = null;

  function start() {
    score = 0;
    timeLeft = DURATION;
    board = Array(HOLES).fill(null);
    smashed = {};
    running = true;
    if (timerId) clearInterval(timerId);
    if (spawnId) clearInterval(spawnId);
    timerId = setInterval(() => {
      timeLeft -= 1;
      if (timeLeft <= 0) end();
    }, 1000);
    spawnId = setInterval(spawn, 650);
  }

  function spawn() {
    if (!running) return;
    const empty = board.map((c, i) => (c ? -1 : i)).filter((i) => i >= 0);
    if (empty.length === 0) return;
    const idx = empty[Math.floor(Math.random() * empty.length)];
    const isFeature = Math.random() < 0.18;
    board[idx] = {
      type: isFeature ? 'feature' : 'bug',
      until: Date.now() + 900 + Math.random() * 600
    };
    board = board;
    setTimeout(() => {
      if (board[idx] && Date.now() >= board[idx]!.until) {
        board[idx] = null;
        board = board;
      }
    }, 1500);
  }

  function whack(i: number) {
    if (!running) return start();
    const c = board[i];
    if (!c) {
      score = Math.max(0, score - 1);
      return;
    }
    if (c.type === 'bug') {
      score += 10;
      smashed[i] = Date.now();
    } else {
      score = Math.max(0, score - 5);
    }
    board[i] = null;
    board = board;
  }

  function end() {
    running = false;
    if (timerId) clearInterval(timerId);
    if (spawnId) clearInterval(spawnId);
    highScore = Math.max(highScore, score);
    try {
      localStorage.setItem('whack-hi', String(highScore));
    } catch {}
    onGameOver(score);
  }

  onMount(() => {
    try {
      highScore = Number(localStorage.getItem('whack-hi') ?? 0) || 0;
    } catch {}
    return () => {
      if (timerId) clearInterval(timerId);
      if (spawnId) clearInterval(spawnId);
    };
  });
</script>

<div class="flex flex-col items-center gap-4">
  <div class="flex w-full max-w-md items-center justify-between font-mono text-sm">
    <p class="text-zinc-400">
      score: <span class="text-[color:var(--color-gb-light)]">{score}</span>
    </p>
    <p class="text-zinc-500">
      {$tt({ pt: 'tempo', en: 'time' })}:
      <span class={timeLeft < 10 ? 'text-rose-400' : 'text-zinc-200'}>{timeLeft}s</span>
    </p>
    <p class="text-zinc-500">hi: {highScore}</p>
    <button
      class="rounded-full border border-zinc-800 bg-zinc-900 p-2 text-zinc-300 hover:border-zinc-600"
      on:click={start}
      aria-label="start/reset"
    >
      <RotateCcw class="h-3.5 w-3.5" />
    </button>
  </div>

  <div
    class="grid grid-cols-3 gap-3 rounded-xl border border-zinc-800 bg-zinc-950/80 p-4 shadow-[0_0_60px_-20px_rgba(155,188,15,0.5)]"
  >
    {#each board as critter, i}
      <button
        type="button"
        class="hole {smashed[i] && Date.now() - smashed[i] < 250 ? 'smashed' : ''}"
        on:click={() => whack(i)}
        aria-label="hole {i + 1}"
      >
        {#if critter?.type === 'bug'}
          <span class="critter critter-bug" in:popIn>
            <Bug class="h-9 w-9" />
          </span>
        {:else if critter?.type === 'feature'}
          <span class="critter critter-feature" in:popIn>★</span>
        {/if}
      </button>
    {/each}
  </div>

  {#if !running}
    <button
      class="rounded-full border border-[color:var(--color-gb-green)]/40 bg-[color:var(--color-gb-green)]/15 px-4 py-2 text-sm font-medium text-[color:var(--color-gb-light)] hover:bg-[color:var(--color-gb-green)]/25"
      on:click={start}
    >
      {timeLeft === DURATION
        ? $tt({ pt: 'começar', en: 'start' })
        : $tt({ pt: 'jogar de novo', en: 'play again' })}
    </button>
  {/if}

  <p class="max-w-sm text-center text-xs text-zinc-500">
    {$tt({ pt: 'esmaga', en: 'smash' })} <span class="text-rose-400">bugs</span> (+10), {$tt({
      pt: 'evita',
      en: 'avoid'
    })} <span class="text-amber-300">features</span> (−5)
    {$tt({ pt: 'e os', en: 'and' })}
    <span class="text-zinc-300">{$tt({ pt: 'buracos vazios', en: 'empty holes' })}</span> (−1)
  </p>
</div>

<style>
  :global(.hole) {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 120px;
    height: 120px;
    border-radius: 9999px;
    background: radial-gradient(ellipse at center, #1c1917 0%, #0a0a0a 70%);
    border: 1px solid rgb(39 39 42);
    transition: transform 80ms;
    touch-action: manipulation;
  }
  @media (max-width: 480px) {
    :global(.hole) {
      width: 92px;
      height: 92px;
    }
  }
  :global(.hole:active) {
    transform: scale(0.96);
  }
  :global(.hole.smashed) {
    background: radial-gradient(ellipse at center, #422006 0%, #0a0a0a 70%);
  }
  :global(.critter) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
    line-height: 1;
  }
  :global(.critter-bug) {
    color: #f43f5e;
  }
  :global(.critter-feature) {
    color: #facc15;
  }
</style>
