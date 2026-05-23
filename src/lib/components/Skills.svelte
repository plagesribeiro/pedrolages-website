<script lang="ts">
  import { t } from '$lib/i18n';
  import type { Resume } from '$lib/data/types';

  export let resume: Resume;

  $: groups = [
    { key: 'skills.ai', items: resume.skills.ai, accent: true },
    { key: 'skills.leadership', items: resume.skills.leadership },
    { key: 'skills.stack', items: resume.skills.stack },
    { key: 'skills.infra', items: resume.skills.infra }
  ];
</script>

<section id="skills" class="px-6 py-12 sm:px-10">
  <div class="mx-auto max-w-3xl">
    <h2 class="font-pixel text-xl text-[color:var(--color-gb-light)] glow-green">
      <span class="text-zinc-500">/*</span>
      {$t('section.skills')} <span class="text-zinc-500">*/</span>
    </h2>

    <div class="mt-6 space-y-5">
      {#each groups as group}
        <div>
          <h3 class="font-mono text-xs uppercase tracking-wider text-zinc-500">{$t(group.key)}</h3>
          <div class="mt-2 flex flex-wrap gap-2">
            {#each group.items as item}
              <span class="chip {group.accent ? 'chip-accent' : ''}">{item}</span>
            {/each}
          </div>
        </div>
      {/each}
    </div>
  </div>
</section>
