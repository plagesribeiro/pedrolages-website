<script lang="ts">
  import { locale, pick } from '$lib/i18n';
  import PixelAvatar from './PixelAvatar.svelte';
  import RotatingTagline from './RotatingTagline.svelte';
  import type { Resume } from '$lib/data/types';
  import DownloadResume from './DownloadResume.svelte';
  import BrandIcon from './BrandIcon.svelte';
  import { Mail, GraduationCap } from '@lucide/svelte';

  export let resume: Resume;
  export let onSecret: () => void = () => {};

  $: headline = pick(resume.headline, $locale);
  $: location = pick(resume.location, $locale);
  $: taglines = pick(resume.taglines, $locale);
</script>

<section class="relative overflow-hidden px-6 pt-20 pb-16 sm:px-10 sm:pt-28 lg:pt-32">
  <div
    aria-hidden="true"
    class="pointer-events-none absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_at_center,#000_30%,transparent_70%)]"
    style="background-image: radial-gradient(rgba(155,188,15,0.13) 1px, transparent 1px); background-size: 22px 22px;"
  ></div>

  <div class="mx-auto flex max-w-5xl flex-col items-center gap-8 text-center sm:flex-row sm:items-start sm:text-left">
    <div class="shrink-0">
      <PixelAvatar on:secret={onSecret} />
    </div>
    <div class="flex flex-col gap-4">
      <div class="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
        <span class="chip chip-accent font-pixel !text-[10px]">// {resume.handle}.dev</span>
        <span class="chip font-mono">{location}</span>
      </div>
      <h1 class="font-pixel text-2xl leading-tight glow-green sm:text-3xl lg:text-4xl">
        {resume.name}
      </h1>
      <p class="text-base text-zinc-300 sm:text-lg">{headline}</p>
      <div class="font-mono text-sm">
        <RotatingTagline lines={taglines} />
      </div>

      <div class="mt-2 flex flex-wrap items-center justify-center gap-3 sm:justify-start">
        <DownloadResume {resume} />
        <a
          href={resume.links.github}
          target="_blank"
          rel="noopener"
          aria-label="GitHub"
          class="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-sm text-zinc-300 transition hover:border-zinc-700 hover:text-white"
        >
          <BrandIcon name="github" /> GitHub
        </a>
        <a
          href={resume.links.linkedin}
          target="_blank"
          rel="noopener"
          aria-label="LinkedIn"
          class="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-sm text-zinc-300 transition hover:border-zinc-700 hover:text-white"
        >
          <BrandIcon name="linkedin" /> LinkedIn
        </a>
        {#if resume.links.lattes}
          <a
            href={resume.links.lattes}
            target="_blank"
            rel="noopener"
            aria-label="Lattes"
            class="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-sm text-zinc-300 transition hover:border-zinc-700 hover:text-white"
          >
            <GraduationCap class="h-4 w-4" /> Lattes
          </a>
        {/if}
        <a
          href="mailto:{resume.email}"
          aria-label="Email"
          class="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-sm text-zinc-300 transition hover:border-zinc-700 hover:text-white"
        >
          <Mail class="h-4 w-4" /> {resume.email}
        </a>
      </div>
    </div>
  </div>
</section>
