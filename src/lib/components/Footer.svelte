<script lang="ts">
  import { t } from '$lib/i18n';
  import type { Resume } from '$lib/data/types';
  import { Mail, GraduationCap } from '@lucide/svelte';
  import BrandIcon from './BrandIcon.svelte';

  export let resume: Resume;
</script>

<footer class="border-t border-zinc-900 px-6 py-10 sm:px-10">
  <div class="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 text-xs text-zinc-500 sm:flex-row">
    <p class="font-mono">$ {$t('footer.madeWith')}</p>
    <div class="flex items-center gap-4">
      <a href={resume.links.github} target="_blank" rel="noopener" aria-label="GitHub" class="hover:text-zinc-200">
        <BrandIcon name="github" size={16} />
      </a>
      <a href={resume.links.linkedin} target="_blank" rel="noopener" aria-label="LinkedIn" class="hover:text-zinc-200">
        <BrandIcon name="linkedin" size={16} />
      </a>
      {#if resume.links.lattes}
        <a href={resume.links.lattes} target="_blank" rel="noopener" aria-label="Lattes" class="hover:text-zinc-200">
          <GraduationCap size={16} />
        </a>
      {/if}
      <a href="mailto:{resume.email}" aria-label="Email" class="hover:text-zinc-200">
        <Mail size={16} />
      </a>
      <span class="font-mono text-zinc-700">·</span>
      <span class="font-mono text-zinc-600">{$t('easter.help')}</span>
    </div>
  </div>
</footer>
