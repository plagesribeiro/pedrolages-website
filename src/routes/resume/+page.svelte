<script lang="ts">
  import { locale, pick, t } from '$lib/i18n';
  import { formatRange, yearsSince } from '$lib/utils/dates';
  import DownloadResume from '$lib/components/DownloadResume.svelte';
  export let data;
  $: resume = data.resume;
</script>

<svelte:head>
  <title>{data.resume.name} — CV</title>
</svelte:head>

<article class="mx-auto max-w-3xl px-6 py-10 print:py-0 print:px-0">
  <header class="border-b border-zinc-800 pb-6 print:border-zinc-300">
    <div class="flex items-start justify-between gap-4">
      <div class="flex items-center gap-4">
        <img
          src="/photo.png"
          alt={resume.name}
          width="72"
          height="72"
          class="h-16 w-16 rounded-full border border-zinc-700 object-cover print:hidden"
        />
        <div>
          <h1 class="text-2xl font-semibold">{resume.name}</h1>
          <p class="mt-1 text-zinc-400 print:text-zinc-700">{pick(resume.headline, $locale)}</p>
        </div>
      </div>
      <div class="print:hidden"><DownloadResume {resume} /></div>
    </div>
    <p class="mt-3 font-mono text-xs text-zinc-500 print:text-zinc-700">
      {pick(resume.location, $locale)} · {resume.email} ·
      <a class="underline" href={resume.links.linkedin}>LinkedIn</a> ·
      <a class="underline" href={resume.links.github}>GitHub</a>
    </p>
    <p class="mt-3 font-mono text-xs text-[color:var(--color-gb-light)] print:text-zinc-800">
      {yearsSince(resume.careerStart)}y building software · {yearsSince(resume.aiStart)}y with AI
    </p>
  </header>

  <section class="py-6">
    <h2 class="font-pixel text-sm text-[color:var(--color-gb-light)] print:text-zinc-900">
      {$t('section.about').toUpperCase()}
    </h2>
    <div class="mt-3 space-y-3 text-zinc-300 print:text-zinc-800">
      {#each pick(resume.bio, $locale) as p}<p>{p}</p>{/each}
    </div>
  </section>

  <section class="py-6">
    <h2 class="font-pixel text-sm text-[color:var(--color-gb-light)] print:text-zinc-900">
      {$t('section.journey').toUpperCase()}
    </h2>
    <div class="mt-3 space-y-5">
      {#each resume.experience as exp}
        <div>
          <div class="flex items-baseline justify-between gap-3">
            <h3 class="font-semibold">
              {exp.company}
              <span class="font-normal text-zinc-400">· {pick(exp.role, $locale)}</span>
            </h3>
            <span class="font-mono text-xs text-zinc-500"
              >{formatRange(exp.start, exp.end, exp.current, $locale)}</span
            >
          </div>
          <p class="text-sm text-zinc-400 print:text-zinc-700">{pick(exp.summary, $locale)}</p>
        </div>
      {/each}
    </div>
  </section>

  <section class="py-6">
    <h2 class="font-pixel text-sm text-[color:var(--color-gb-light)] print:text-zinc-900">
      {$t('section.education').toUpperCase()}
    </h2>
    <div class="mt-3 space-y-3">
      {#each resume.education as edu}
        <div>
          <div class="flex items-baseline justify-between gap-3">
            <h3 class="font-semibold">{edu.institution}</h3>
            <span class="font-mono text-xs text-zinc-500">
              {edu.start} → {edu.status === 'in-progress' ? $t('edu.inProgress') : (edu.end ?? '')}
            </span>
          </div>
          <p class="text-sm text-zinc-400 print:text-zinc-700">{pick(edu.degree, $locale)}</p>
          {#if edu.note}
            <p class="mt-1 text-sm text-zinc-500 print:text-zinc-700">{pick(edu.note, $locale)}</p>
          {/if}
          {#if edu.skills}
            <p class="mt-1 text-xs text-zinc-500 print:text-zinc-700">
              <span class="font-semibold">Skills:</span>
              {pick(edu.skills, $locale).join(' · ')}
            </p>
          {/if}
        </div>
      {/each}
    </div>
  </section>

  <section class="py-6">
    <h2 class="font-pixel text-sm text-[color:var(--color-gb-light)] print:text-zinc-900">
      {$t('section.skills').toUpperCase()}
    </h2>
    <div class="mt-3 grid gap-1 text-sm">
      <p>
        <span class="font-semibold">{$t('skills.ai')}:</span>
        {pick(resume.skills.ai, $locale).join(' · ')}
      </p>
      <p>
        <span class="font-semibold">{$t('skills.leadership')}:</span>
        {pick(resume.skills.leadership, $locale).join(' · ')}
      </p>
      <p>
        <span class="font-semibold">{$t('skills.stack')}:</span>
        {pick(resume.skills.stack, $locale).join(' · ')}
      </p>
      <p>
        <span class="font-semibold">{$t('skills.infra')}:</span>
        {pick(resume.skills.infra, $locale).join(' · ')}
      </p>
    </div>
  </section>
</article>

<style>
  @media print {
    article {
      max-width: none;
    }
    :global(html) {
      background: white;
    }
    :global(body) {
      color: black;
    }
  }
</style>
