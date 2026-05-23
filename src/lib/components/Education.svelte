<script lang="ts">
  import { locale, pick, t } from '$lib/i18n';
  import type { Resume } from '$lib/data/types';
  import { GraduationCap } from '@lucide/svelte';

  export let resume: Resume;
</script>

<section id="education" class="px-6 py-12 sm:px-10">
  <div class="mx-auto max-w-3xl">
    <h2 class="font-pixel text-xl text-[color:var(--color-gb-light)] glow-green">
      <span class="text-zinc-500">/*</span>
      {$t('section.education')} <span class="text-zinc-500">*/</span>
    </h2>

    <div class="mt-6 grid gap-3 sm:grid-cols-2">
      {#each resume.education as edu}
        <div class="relative rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
          <div class="flex items-start justify-between gap-3">
            <GraduationCap class="h-5 w-5 text-[color:var(--color-gb-light)]" />
            {#if edu.status === 'in-progress'}
              <span
                class="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[11px] text-amber-300"
              >
                <span class="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400"></span>
                {$t('edu.inProgress')}
              </span>
            {/if}
          </div>
          <h3 class="mt-3 font-semibold text-zinc-100">{edu.institution}</h3>
          <p class="text-sm text-zinc-400">{pick(edu.degree, $locale)}</p>
          <p class="mt-2 font-mono text-xs text-zinc-500">
            {edu.start} → {edu.status === 'in-progress' ? $t('edu.inProgress') : (edu.end ?? '')}
          </p>
          {#if edu.note}
            <p class="mt-2 text-xs text-zinc-500 italic">{pick(edu.note, $locale)}</p>
          {/if}
          {#if edu.skills}
            <div class="mt-3 flex flex-wrap gap-1.5">
              {#each pick(edu.skills, $locale) as skill}
                <span class="chip !text-[10px] !px-2 !py-0.5">{skill}</span>
              {/each}
            </div>
          {/if}
        </div>
      {/each}
    </div>
  </div>
</section>
