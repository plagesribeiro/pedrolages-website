<script lang="ts">
  import { locale, t } from '$lib/i18n';
  import { yearsSince } from '$lib/utils/dates';
  import type { Resume } from '$lib/data/types';
  import { Sparkles, Cpu, Rocket } from '@lucide/svelte';

  export let resume: Resume;

  $: years = yearsSince(resume.careerStart);
  $: aiYears = yearsSince(resume.aiStart);
  $: startups = resume.experience.filter(
    (e) => e.founded || e.endedWith === 'acquired' || e.endedWith === 'shutdown'
  ).length;

  $: cards = [
    { icon: Cpu, label: $t('stats.years', { n: years }), big: years },
    { icon: Sparkles, label: $t('stats.aiYears', { n: aiYears }), big: aiYears },
    { icon: Rocket, label: $t('stats.startups', { n: startups }), big: startups }
  ];
</script>

<section class="px-6 py-10 sm:px-10">
  <div class="mx-auto grid max-w-5xl gap-3 sm:grid-cols-3">
    {#each cards as card}
      <div
        class="group relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 transition hover:border-[color:var(--color-gb-green)]/40"
      >
        <div class="flex items-center justify-between">
          <span class="font-pixel text-4xl text-[color:var(--color-gb-light)] glow-green"
            >{card.big}</span
          >
          <svelte:component
            this={card.icon}
            class="h-5 w-5 text-zinc-500 group-hover:text-[color:var(--color-gb-light)] transition"
          />
        </div>
        <p class="mt-2 text-sm text-zinc-400">{card.label}</p>
      </div>
    {/each}
  </div>
  <p class="mx-auto mt-3 max-w-5xl text-center text-xs text-zinc-500 sm:text-left">
    <span class="font-mono">★</span>
    {$t('stats.gpt2')}
  </p>
</section>
