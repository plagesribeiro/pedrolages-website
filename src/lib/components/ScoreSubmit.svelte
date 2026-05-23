<script lang="ts">
  import { onMount, createEventDispatcher, tick } from 'svelte';
  import { fade, scale } from 'svelte/transition';
  import { Trophy } from '@lucide/svelte';
  import { tt } from '$lib/i18n';
  import type { GameId, ScoreEntry } from '$lib/leaderboard/types';
  import { MAX_NAME_LEN, sanitizeName } from '$lib/leaderboard/types';
  import { postScore, rememberName, rememberedName } from '$lib/leaderboard/client';

  export let open = false;
  export let game: GameId;
  export let score = 0;

  const dispatch = createEventDispatcher<{
    submitted: { scores: ScoreEntry[]; ts: number; name: string };
    close: void;
  }>();

  let name = '';
  let busy = false;
  let error: string | null = null;
  let inputEl: HTMLInputElement;
  let wasOpen = false;

  // run open-transition logic only when `open` flips false → true,
  // not on every reactive change (otherwise focus/select runs on each keystroke
  // and overwrites the previous letter).
  $: if (open && !wasOpen) {
    wasOpen = true;
    if (!name) name = rememberedName();
    void initFocus();
  }
  $: if (!open) wasOpen = false;

  async function initFocus() {
    await tick();
    inputEl?.focus();
    if (!name) inputEl?.select();
  }

  function close() {
    open = false;
    dispatch('close');
  }

  async function submit() {
    if (busy) return;
    const clean = sanitizeName(name);
    if (!clean) {
      error = $tt({ pt: 'coloca um nome aí', en: 'enter a name' });
      return;
    }
    busy = true;
    error = null;
    rememberName(clean);
    const ts = Date.now();
    const scores = await postScore(game, clean, score);
    busy = false;
    if (scores.length === 0) {
      error = $tt({ pt: 'falha ao salvar. tenta de novo.', en: 'failed to save. try again.' });
      return;
    }
    const found = scores.find((s) => s.name === clean && s.score === score);
    dispatch('submitted', { scores, ts: found?.ts ?? ts, name: clean });
    open = false;
  }

  function onKey(e: KeyboardEvent) {
    if (!open) return;
    if (e.key === 'Escape') close();
    if (e.key === 'Enter') submit();
  }

  onMount(() => {
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });
</script>

{#if open}
  <div
    class="fixed inset-0 z-[150] flex items-center justify-center bg-black/85 p-6 backdrop-blur"
    transition:fade={{ duration: 180 }}
    role="dialog"
    aria-modal="true"
    tabindex="-1"
  >
    <div
      class="w-full max-w-md rounded-2xl border border-[color:var(--color-gb-green)]/40 bg-zinc-950 p-6 shadow-[0_0_80px_-10px_rgba(155,188,15,0.45)]"
      in:scale={{ duration: 220, start: 0.94 }}
    >
      <div class="flex items-center gap-3">
        <Trophy class="h-6 w-6 text-amber-300" />
        <div>
          <p class="font-pixel text-[10px] text-zinc-500">NEW HIGH SCORE</p>
          <h2 class="mt-1 font-pixel text-xl text-[color:var(--color-gb-light)] glow-green">
            {score}
          </h2>
        </div>
      </div>

      <p class="mt-4 text-sm text-zinc-400">
        {$tt({
          pt: 'manda teu nome pra ficar no hall da fama dessa página:',
          en: 'drop your name to land on this page’s hall of fame:'
        })}
      </p>

      <input
        bind:this={inputEl}
        bind:value={name}
        maxlength={MAX_NAME_LEN}
        class="mt-3 w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 font-mono text-sm text-zinc-100 outline-none focus:border-[color:var(--color-gb-green)]/60"
        placeholder={$tt({
          pt: `seu nome (max ${MAX_NAME_LEN} chars)`,
          en: `your name (max ${MAX_NAME_LEN} chars)`
        })}
        autocomplete="off"
        spellcheck="false"
      />

      {#if error}
        <p class="mt-2 text-xs text-rose-400">{error}</p>
      {/if}

      <div class="mt-5 flex items-center justify-end gap-2">
        <button
          class="rounded-md px-3 py-2 text-sm text-zinc-400 hover:text-zinc-200"
          on:click={close}
          disabled={busy}
        >
          {$tt({ pt: 'pular', en: 'skip' })}
        </button>
        <button
          class="rounded-md border border-[color:var(--color-gb-green)]/50 bg-[color:var(--color-gb-green)]/15 px-4 py-2 text-sm font-medium text-[color:var(--color-gb-light)] hover:bg-[color:var(--color-gb-green)]/25 disabled:opacity-60"
          on:click={submit}
          disabled={busy}
        >
          {busy
            ? $tt({ pt: 'salvando...', en: 'saving...' })
            : $tt({ pt: 'salvar recorde', en: 'save record' })}
        </button>
      </div>
    </div>
  </div>
{/if}
