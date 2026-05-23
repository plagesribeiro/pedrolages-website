<script lang="ts">
  import { tt } from '$lib/i18n';
  import Particles from '$lib/components/Particles.svelte';
  import { ArrowLeft, Trophy } from '@lucide/svelte';

  const games = [
    {
      slug: 'snake',
      title: 'snake',
      hintPt: 'clássico + bombas. setas. não bata.',
      hintEn: 'classic + bombs. arrows. don\'t crash.',
      glyph: '◉',
      hue: 'text-[color:var(--color-gb-light)] border-[color:var(--color-gb-green)]/30'
    },
    {
      slug: 'tokens',
      title: 'token catcher',
      hintPt: 'pega tokens, foge dos bugs.',
      hintEn: 'catch tokens, dodge bugs.',
      glyph: '✦',
      hue: 'text-amber-300 border-amber-500/30'
    },
    {
      slug: 'pong',
      title: 'pong vs ai',
      hintPt: 'primeiro a 5. ai é cabreiro.',
      hintEn: 'first to 5. ai is sneaky.',
      glyph: '◐',
      hue: 'text-zinc-200 border-zinc-600'
    },
    {
      slug: 'bugs',
      title: 'whack-a-bug',
      hintPt: 'esmaga bugs. evita features.',
      hintEn: 'smash bugs. avoid features.',
      glyph: '✖',
      hue: 'text-rose-400 border-rose-500/30'
    }
  ];
</script>

<svelte:head>
  <title>games — plagesribeiro</title>
</svelte:head>

<main class="relative isolate min-h-screen overflow-hidden">
  <div class="absolute inset-0 -z-10"><Particles density={50} /></div>

  <a href="/" class="fixed top-4 left-4 z-40 inline-flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-950/70 px-3 py-1.5 text-xs text-zinc-400 backdrop-blur transition hover:border-zinc-600 hover:text-zinc-100">
    <ArrowLeft class="h-3.5 w-3.5" /> {$tt({ pt: 'voltar', en: 'back' })}
  </a>

  <div class="mx-auto max-w-4xl px-6 py-20">
    <header class="text-center">
      <p class="font-pixel text-[10px] text-zinc-500">/* arcade */</p>
      <h1 class="mt-2 font-pixel text-2xl text-[color:var(--color-gb-light)] glow-green sm:text-3xl">
        {$tt({ pt: 'insert coin.', en: 'insert coin.' })}
      </h1>
      <p class="mt-3 text-sm text-zinc-400">
        {$tt({ pt: '4 joguinhos rápidos, sem cadastro, sem cookies.', en: 'four quick games — no signup, no cookies.' })}
      </p>
    </header>

    <div class="mt-12 grid gap-4 sm:grid-cols-2">
      {#each games as g, i}
        <a
          href="/games/{g.slug}"
          class="game-card group block overflow-hidden rounded-xl border bg-zinc-950/60 p-6 transition-all hover:-translate-y-1 hover:shadow-[0_20px_60px_-20px_rgba(155,188,15,0.4)] {g.hue}"
          style:animation-delay="{i * 90}ms"
        >
          <div class="flex items-start justify-between">
            <span class="font-pixel text-4xl {g.hue.split(' ')[0]} glow-green">{g.glyph}</span>
            <Trophy class="h-4 w-4 text-zinc-700 group-hover:text-amber-300 transition-colors" />
          </div>
          <h2 class="mt-6 font-pixel text-sm {g.hue.split(' ')[0]}">{g.title}</h2>
          <p class="mt-1 text-sm text-zinc-400 group-hover:text-zinc-200">
            {$tt({ pt: g.hintPt, en: g.hintEn })}
          </p>
          <p class="mt-4 inline-flex items-center gap-1 text-xs font-mono text-zinc-500 group-hover:text-[color:var(--color-gb-light)]">
            {$tt({ pt: 'jogar', en: 'play' })} ▶
          </p>
        </a>
      {/each}
    </div>
  </div>
</main>

<style>
  .game-card {
    animation: card-in 0.5s ease-out backwards;
  }
  @keyframes card-in {
    from {
      opacity: 0;
      transform: translateY(12px);
    }
    to {
      opacity: 1;
      transform: none;
    }
  }
</style>
