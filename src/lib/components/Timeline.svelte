<script lang="ts">
  import { locale, pick, t } from '$lib/i18n';
  import { formatRange } from '$lib/utils/dates';
  import type { Resume, Experience } from '$lib/data/types';
  import { Building2, Sparkles, Skull, Handshake, Briefcase, Globe } from '@lucide/svelte';

  export let resume: Resume;

  function badges(exp: Experience, $locale: 'pt' | 'en'): { label: string; tone: string }[] {
    const b: { label: string; tone: string }[] = [];
    if (exp.current) b.push({ label: $t('exp.current'), tone: 'bg-[color:var(--color-gb-green)]/15 text-[color:var(--color-gb-light)] border-[color:var(--color-gb-green)]/30' });
    if (exp.founded) b.push({ label: $t('exp.founded'), tone: 'bg-amber-500/10 text-amber-300 border-amber-500/30' });
    if (exp.remote) b.push({ label: $t('exp.remote'), tone: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30' });
    if (exp.endedWith === 'acquired') b.push({ label: $t('exp.acquired'), tone: 'bg-violet-500/10 text-violet-300 border-violet-500/30' });
    if (exp.endedWith === 'shutdown') b.push({ label: $t('exp.shutdown'), tone: 'bg-rose-500/10 text-rose-300 border-rose-500/30' });
    return b;
  }

  function iconFor(exp: Experience) {
    if (exp.current) return Globe;
    if (exp.founded) return Sparkles;
    if (exp.endedWith === 'shutdown') return Skull;
    if (exp.endedWith === 'acquired') return Handshake;
    return Briefcase;
  }

  // dummy reference so $t reactivity is tracked
  $: _ = $t('exp.current');
</script>

<section id="journey" class="px-6 py-12 sm:px-10">
  <div class="mx-auto max-w-3xl">
    <h2 class="font-pixel text-xl text-[color:var(--color-gb-light)] glow-green">
      <span class="text-zinc-500">/*</span> {$t('section.journey')} <span class="text-zinc-500">*/</span>
    </h2>

    <ol class="mt-8 relative border-l border-zinc-800 pl-6">
      {#each resume.experience as exp}
        <li class="relative pb-8 last:pb-0">
          <span class="absolute -left-[33px] top-0 flex h-6 w-6 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900">
            <svelte:component this={iconFor(exp)} class="h-3.5 w-3.5 text-[color:var(--color-gb-light)]" />
          </span>

          <div class="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h3 class="font-semibold text-zinc-100">{exp.company}</h3>
            <span class="font-mono text-xs text-zinc-500">{formatRange(exp.start, exp.end, exp.current, $locale)}</span>
          </div>
          <p class="mt-1 text-sm text-zinc-300">{pick(exp.role, $locale)}</p>
          <p class="mt-2 text-sm text-zinc-400">{pick(exp.summary, $locale)}</p>
          <div class="mt-3 flex flex-wrap gap-2">
            {#each badges(exp, $locale) as badge}
              <span class="inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium {badge.tone}">{badge.label}</span>
            {/each}
            {#each exp.tags as tag}
              <span class="chip !text-[11px] !px-2 !py-0.5">#{tag}</span>
            {/each}
          </div>
        </li>
      {/each}
    </ol>
  </div>
</section>
