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
    <div class="mt-5 space-y-4 text-zinc-300 leading-relaxed">
      {#each paragraphs as p}
        <p>{p}</p>
      {/each}
    </div>
  </div>
</section>
