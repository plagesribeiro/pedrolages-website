<script lang="ts">
  import { locale, pick, t } from '$lib/i18n';
  import type { Resume } from '$lib/data/types';

  export let resume: Resume;
  $: paragraphs = pick(resume.bio, $locale);
</script>

<section id="about" class="px-6 py-12 sm:px-10">
  <div class="mx-auto max-w-3xl">
    <h2 class="font-pixel text-xl text-[color:var(--color-gb-light)] glow-green">
      <span class="text-zinc-500">/*</span>
      {$t('section.about')} <span class="text-zinc-500">*/</span>
    </h2>

    <div class="mt-6 flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-8">
      <div class="relative shrink-0 self-center sm:self-start">
        <div
          class="absolute -inset-1 rounded-full bg-[color:var(--color-gb-green)]/30 blur-md"
          aria-hidden="true"
        ></div>
        <img
          src="/photo.png"
          alt={$t('about.photoAlt')}
          width="160"
          height="160"
          loading="lazy"
          decoding="async"
          class="relative h-32 w-32 rounded-full border-2 border-[color:var(--color-gb-green)]/60 object-cover shadow-lg sm:h-40 sm:w-40"
        />
      </div>

      <div class="flex-1 space-y-4 text-zinc-300 leading-relaxed">
        {#each paragraphs as p}
          <p>{p}</p>
        {/each}
      </div>
    </div>
  </div>
</section>
